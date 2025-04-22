'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { Company, Reminder } from '@/types/reminder';

type AddReminderProps = {
  companies: Company[];
  onReminderAdded: (reminder: Reminder) => void;
  onError: (error: string) => void;
  editingReminder?: Reminder | null;
  onCancel?: () => void;
};

export default function AddReminder({ 
  companies, 
  onReminderAdded, 
  onError,
  editingReminder,
  onCancel 
}: AddReminderProps) {
  const { data: session } = useSession();
  const [companyId, setCompanyId] = useState('');
  const [companyUserId, setCompanyUserId] = useState('');
  const [daysBetweenReminders, setDaysBetweenReminders] = useState('');
  const [lastReminderDate, setLastReminderDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [errors, setErrors] = useState<{ companyId?: string; companyUserId?: string }>({});

  // Set today's date as default for lastReminderDate
  useEffect(() => {
    if (!editingReminder && !lastReminderDate) {
      const today = new Date().toISOString().split('T')[0];
      setLastReminderDate(today);
    }
  }, [editingReminder, lastReminderDate]);

  // Initialize form with editing reminder data
  useEffect(() => {
    if (editingReminder) {
      setCompanyId(editingReminder.companyId);
      setCompanyUserId(editingReminder.companyUserId || '');
      setDaysBetweenReminders(editingReminder.daysBetweenReminders.toString());
      setLastReminderDate(editingReminder.lastReminderDate || '');
      setSelectedCompany(companies.find(c => c.id === editingReminder.companyId) || null);
    }
  }, [editingReminder, companies]);

  // Reset form when company changes (only in add mode)
  useEffect(() => {
    if (!editingReminder) {
      setCompanyUserId('');
      setDaysBetweenReminders('');
      // Don't reset lastReminderDate here as we want to keep today's date
    }
  }, [companyId, editingReminder]);

  // Update days between reminders when company changes
  useEffect(() => {
    if (!editingReminder && companyId) {
      const company = companies.find(c => c.id === companyId);
      setSelectedCompany(company || null);
      if (company) {
        setDaysBetweenReminders(company.days_before_deactivation?.toString() || '120');
      }
    }
  }, [companyId, companies, editingReminder]);

  const validateForm = () => {
    const newErrors: { companyId?: string; companyUserId?: string } = {};
    
    if (!companyId) {
      newErrors.companyId = 'Company is required';
    }
    
    if (!companyUserId.trim()) {
      newErrors.companyUserId = 'Company User ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) {
      onError('You must be signed in to add a reminder');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const url = '/api/reminders';
      const method = editingReminder ? 'PUT' : 'POST';
      
      const selectedCompany = companies.find(c => c.id === companyId);
      if (!selectedCompany) {
        throw new Error('Selected company not found');
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...(editingReminder && { reminderId: editingReminder.id }),
          companyId,
          companyName: selectedCompany.name,
          companyUserId: companyUserId.trim(),
          daysBetweenReminders: parseInt(daysBetweenReminders),
          lastReminderDate: lastReminderDate || null,
          userEmail: session.user.email,
        }),
      });

      let errorMessage = `Failed to ${editingReminder ? 'update' : 'create'} reminder`;
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, try to get the text
          try {
            const textError = await response.text();
            errorMessage = textError || errorMessage;
          } catch (e) {
            // If we can't get the text either, use the status text
            errorMessage = response.statusText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      let reminder;
      try {
        reminder = await response.json();
      } catch (e) {
        throw new Error('Invalid response from server');
      }

      onReminderAdded(reminder);

      // Reset form
      setCompanyId('');
      setCompanyUserId('');
      setDaysBetweenReminders('');
      setLastReminderDate('');
      setSelectedCompany(null);
      setErrors({});
    } catch (error) {
      console.error('Error saving reminder:', error);
      onError(error instanceof Error ? error.message : `Failed to ${editingReminder ? 'update' : 'create'} reminder`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDaysFieldDisabled = Boolean(selectedCompany?.days_before_deactivation && selectedCompany.days_before_deactivation > 0);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Add New Reminder
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth error={!!errors.companyId}>
          <InputLabel>Company</InputLabel>
          <Select
            value={companyId}
            label="Company"
            onChange={(e) => setCompanyId(e.target.value)}
            required
            disabled={!!editingReminder}
          >
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name} ({company.days_before_deactivation || 120} days)
              </MenuItem>
            ))}
          </Select>
          {errors.companyId && (
            <Typography color="error" variant="caption" sx={{ mt: 1 }}>
              {errors.companyId}
            </Typography>
          )}
        </FormControl>

        <TextField
          label="Company User ID"
          value={companyUserId}
          onChange={(e) => setCompanyUserId(e.target.value)}
          fullWidth
          required
          error={!!errors.companyUserId}
          helperText={errors.companyUserId}
        />

        <TextField
          label="Days Between Reminders"
          type="number"
          value={daysBetweenReminders}
          onChange={(e) => setDaysBetweenReminders(e.target.value)}
          required
          fullWidth
          inputProps={{ min: 1 }}
          disabled={isDaysFieldDisabled}
          helperText={isDaysFieldDisabled ? "Days are fixed by company policy" : undefined}
        />

        <TextField
          label="Last Reminder Date"
          type="date"
          value={lastReminderDate}
          onChange={(e) => setLastReminderDate(e.target.value)}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{ flex: 1 }}
          >
            {isSubmitting ? 'Saving...' : editingReminder ? 'Save Changes' : 'Add Reminder'}
          </Button>
          {editingReminder && onCancel && (
            <Button
              type="button"
              variant="outlined"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
} 