'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  Typography,
} from '@mui/material';
import { Reminder, ReminderDataFromDB } from '@/models/Reminder';
import ReminderRow from './ReminderRow';
import { useTranslation } from 'react-i18next';

type ReminderListProps = {
  reminders: ReminderDataFromDB[]; // Use ReminderDataFromDB[] instead of any[]
  onEditReminder: (reminder: Reminder) => void;
  onDeleteReminder: (reminderId: string) => void;
  onError: (error: string) => void;
};

export default function ReminderList({ reminders: rawReminders, onEditReminder, onDeleteReminder, onError }: ReminderListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { t } = useTranslation();

  // Convert raw reminder data to Reminder instances and sort by due date
  const reminders = useMemo(() => 
    rawReminders
      .map(reminder => Reminder.fromDB(reminder))
      .sort((a, b) => {
        const aDue = a.getNextDueDate()?.getTime() ?? Infinity;
        const bDue = b.getNextDueDate()?.getTime() ?? Infinity;
        return aDue - bDue;
      }),
    [rawReminders]
  );

  const handleDelete = async (reminderId: string) => {
    if (deletingId) return;
    
    setDeletingId(reminderId);
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(t('reminders.deleteError'));
      }

      onDeleteReminder(reminderId);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      onError(t('reminders.deleteError'));
    } finally {
      setDeletingId(null);
    }
  };

  if (reminders.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
        {t('reminders.noReminders')}
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('reminders.company')}</TableCell>
            <TableCell>{t('reminders.companyUser')}</TableCell>
            <TableCell>{t('reminders.daysBetweenReminders')}</TableCell>
            <TableCell>{t('reminders.lastReminderDate')}</TableCell>
            <TableCell>{t('reminders.nextDueDate')}</TableCell>
            <TableCell>{t('reminders.status')}</TableCell>
            <TableCell>{t('common.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reminders.map((reminder) => (
            <ReminderRow
              key={reminder.id}
              reminder={reminder}
              onEdit={onEditReminder}
              onDelete={handleDelete}
              isDeleting={deletingId === reminder.id}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 