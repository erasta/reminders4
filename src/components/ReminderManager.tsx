'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Typography, Paper, Alert, Divider } from '@mui/material';
import AddReminder from './AddReminder';
import ReminderList from './ReminderList';
import { Company } from '@/types/company';
import { Reminder } from '@/models/Reminder';
import { useLoading } from './LoadingContext';
import { useTranslation } from 'react-i18next';

export default function ReminderManager() {
  const { data: session } = useSession();
  const { setIsLoading } = useLoading();
  const { t } = useTranslation();
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
          throw new Error(t('reminders.fetchCompaniesError'));
        }
        const companiesData = await companiesResponse.json();
        setCompanies(Array.isArray(companiesData) ? companiesData : []);
        
        // Fetch reminders
        const remindersResponse = await fetch('/api/reminders');
        if (!remindersResponse.ok) {
          throw new Error(t('reminders.fetchRemindersError'));
        }
        const remindersData = await remindersResponse.json();
        setReminders(Array.isArray(remindersData) ? remindersData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : t('reminders.fetchError'));
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [session, setIsLoading, t]);

  const handleReminderAdded = (newReminder: Reminder) => {
    setReminders(prevReminders => [newReminder, ...prevReminders]);
    setError(null);
    setEditingReminder(null);
  };

  const handleReminderEdited = (updatedReminder: Reminder) => {
    setReminders(prevReminders => 
      prevReminders.map(reminder => 
        reminder.id === updatedReminder.id ? updatedReminder : reminder
      )
    );
    setError(null);
    setEditingReminder(null);
  };

  const handleReminderDeleted = (reminderId: string) => {
    setReminders(prevReminders => 
      prevReminders.filter(reminder => reminder.id !== reminderId)
    );
    setError(null);
  };

  const handleEditClick = (reminder: Reminder) => {
    setEditingReminder(reminder);
  };

  const handleCancelEdit = () => {
    setEditingReminder(null);
    setError(null);
  };

  if (!session) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {t('auth.signInRequired')}
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
          {editingReminder ? t('reminders.editReminder') : t('reminders.addReminder')}
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
          {t('reminders.myReminders')}
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