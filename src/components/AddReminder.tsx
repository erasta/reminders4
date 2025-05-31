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
} from '@mui/material';
import { Company } from '@/types/company';
import { Reminder } from '@/models/Reminder';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [companyId, setCompanyId] = useState(editingReminder?.companyId || '');
  const [companyUserId, setCompanyUserId] = useState(editingReminder?.companyUserId || '');
  const [daysBetweenReminders, setDaysBetweenReminders] = useState(editingReminder?.daysBetweenReminders?.toString() || '');
  const [lastReminderDate, setLastReminderDate] = useState(
    editingReminder?.lastReminderDate 
      ? new Date(editingReminder.lastReminderDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(
    editingReminder 
      ? companies.find(c => c.id === editingReminder.companyId) || null
      : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (companyId) {
      const company = companies.find(c => c.id === companyId);
      setSelectedCompany(company || null);
    } else {
      setSelectedCompany(null);
    }
  }, [companyId, companies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const reminderData = {
        companyId,
        companyUserId,
        daysBetweenReminders: parseInt(daysBetweenReminders),
        lastReminderDate: new Date(lastReminderDate),
      };

      if (editingReminder) {
        // Update existing reminder
        const response = await fetch(`/api/reminders/${editingReminder.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reminderData),
        });

        if (!response.ok) {
          throw new Error(t('reminders.updateError'));
        }

        const updatedReminder = await response.json();
        onReminderAdded(updatedReminder);
      } else {
        // Create new reminder
        const response = await fetch('/api/reminders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reminderData),
        });

        if (!response.ok) {
          throw new Error(t('reminders.createError'));
        }

        const newReminder = await response.json();
        onReminderAdded(newReminder);
      }

      // Reset form
      setCompanyId('');
      setCompanyUserId('');
      setDaysBetweenReminders('');
      setLastReminderDate(new Date().toISOString().split('T')[0]);
      setSelectedCompany(null);
      setErrors({});
    } catch (error) {
      console.error('Error saving reminder:', error);
      onError(error instanceof Error ? error.message : t('reminders.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onError(''); // Clear any existing error
    if (onCancel) {
      onCancel();
    }
  };

  const isDaysFieldDisabled = Boolean(selectedCompany?.days_before_deactivation && selectedCompany.days_before_deactivation > 0);

  return (
    <Paper sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth error={!!errors.companyId} size="small">
          <InputLabel>{t('reminders.company')}</InputLabel>
          <Select
            value={companyId}
            label={t('reminders.company')}
            onChange={(e) => setCompanyId(e.target.value)}
            required
            disabled={!!editingReminder}
          >
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name} ({company.days_before_deactivation || 120} {t('reminders.days')})
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
          label={t('reminders.companyUser')}
          value={companyUserId}
          onChange={(e) => setCompanyUserId(e.target.value)}
          fullWidth
          required
          error={!!errors.companyUserId}
          helperText={errors.companyUserId}
          size="small"
        />

        <TextField
          label={t('reminders.daysBetweenReminders')}
          type="number"
          value={daysBetweenReminders}
          onChange={(e) => setDaysBetweenReminders(e.target.value)}
          required
          fullWidth
          inputProps={{ min: 1 }}
          disabled={!companyId || isDaysFieldDisabled}
          helperText={isDaysFieldDisabled ? t('reminders.fixedByPolicy') : !companyId ? t('reminders.selectCompany') : undefined}
          size="small"
        />

        <TextField
          label={t('reminders.lastReminderDate')}
          type="date"
          value={lastReminderDate}
          onChange={(e) => setLastReminderDate(e.target.value)}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          size="small"
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            sx={{ flex: 1 }}
            size="small"
          >
            {isLoading ? t('common.loading') : editingReminder ? t('common.save') : t('reminders.addReminder')}
          </Button>
          {editingReminder && onCancel && (
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={isLoading}
              size="small"
            >
              {t('common.cancel')}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
} 