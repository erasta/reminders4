'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AddReminder from './AddReminder';
import EditReminder from './EditReminder';
import ReminderList from './ReminderList';
import { Company, Reminder } from '@/types/reminder';

export default function ReminderManager() {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  // Fetch companies from CSV and reminders from API
  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.email) return;
      
      try {
        // Fetch companies from CSV
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
        setError('Failed to load data');
      }
    }

    fetchData();
  }, [session]);

  // Handle reminder added
  const handleReminderAdded = (newReminder: Reminder) => {
    setReminders(prevReminders => [newReminder, ...prevReminders]);
  };

  // Handle reminder updated
  const handleReminderUpdated = (updatedReminder: Reminder) => {
    setReminders(prevReminders =>
      prevReminders.map(reminder =>
        reminder.id === updatedReminder.id ? updatedReminder : reminder
      )
    );
    setEditingReminder(null);
  };

  // Handle reminder deleted
  const handleReminderDeleted = (reminderId: string) => {
    setReminders(prevReminders => 
      prevReminders.filter(reminder => reminder.id !== reminderId)
    );
  };

  // Start editing a reminder
  const startEditing = (reminder: Reminder) => {
    setEditingReminder(reminder);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingReminder(null);
  };

  if (!session) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {editingReminder ? (
        <EditReminder
          reminder={editingReminder}
          onReminderUpdated={handleReminderUpdated}
          onCancel={cancelEditing}
          onError={setError}
        />
      ) : (
        <AddReminder
          companies={companies}
          onReminderAdded={handleReminderAdded}
          onError={setError}
        />
      )}

      <ReminderList
        reminders={reminders}
        onEditReminder={startEditing}
        onDeleteReminder={handleReminderDeleted}
        onError={setError}
      />
    </div>
  );
} 