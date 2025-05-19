'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Typography, Paper, Alert, Divider } from '@mui/material';
import AddReminder from './AddReminder';
import ReminderList from './ReminderList';
import { Company } from '@/types/company';
import { Reminder } from '@/models/Reminder';
import { useLoading } from './LoadingContext';

export default function ReminderManager() {
  const { data: session } = useSession();
  const { setIsLoading } = useLoading();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  // Fetch companies and reminders
  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.email) return;
      
      setLoading(true);
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch companies
        const companiesResponse = await fetch('/api/companies');
        if (!companiesResponse.ok) {
          throw new Error('Failed to fetch companies');
        }
        const companiesData = await companiesResponse.json();
        setCompanies(Array.isArray(companiesData) ? companiesData : []);
        
        // Fetch reminders
        const remindersResponse = await fetch('/api/reminders');
        if (!remindersResponse.ok) {
          throw new Error('Failed to fetch reminders');
        }
        const remindersData = await remindersResponse.json();
        setReminders(Array.isArray(remindersData) ? remindersData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data: ' + (error instanceof Error ? error.message : String(error)));
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [session, setIsLoading]);

  const handleReminderAdded = (newReminder: Reminder) => {
    setReminders(prevReminders => [newReminder, ...prevReminders]);
  };

  const handleReminderEdited = (updatedReminder: Reminder) => {
    setReminders(prevReminders => 
      prevReminders.map(reminder => 
        reminder.id === updatedReminder.id ? updatedReminder : reminder
      )
    );
    setEditingReminder(null);
  };

  const handleReminderDeleted = (reminderId: string) => {
    setReminders(prevReminders => 
      prevReminders.filter(reminder => reminder.id !== reminderId)
    );
  };

  const handleEditClick = (reminder: Reminder) => {
    setEditingReminder(reminder);
  };

  const handleCancelEdit = () => {
    setEditingReminder(null);
  };

  if (!session) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Please sign in to manage your reminders
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', maxWidth: 800, mx: 'auto', mt: 4, p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 4, opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
        </Typography>
        <AddReminder 
          companies={companies} 
          onReminderAdded={editingReminder ? handleReminderEdited : handleReminderAdded} 
          onError={setError}
          editingReminder={editingReminder}
          onCancel={handleCancelEdit}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          My Reminders
        </Typography>
        <ReminderList 
          reminders={reminders} 
          onEditReminder={handleEditClick} 
          onDeleteReminder={handleReminderDeleted} 
          onError={setError} 
        />
      </Box>
    </Paper>
  );
} 