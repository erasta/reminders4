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
import { Reminder } from '@/models/Reminder';
import ReminderRow from './ReminderRow';

type ReminderListProps = {
  reminders: any[]; // Raw reminder data from the API
  onEditReminder: (reminder: Reminder) => void;
  onDeleteReminder: (reminderId: string) => void;
  onError: (error: string) => void;
};

export default function ReminderList({ reminders: rawReminders, onEditReminder, onDeleteReminder, onError }: ReminderListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Convert raw reminder data to Reminder instances
  const reminders = useMemo(() => 
    rawReminders.map(reminder => Reminder.fromDB(reminder)),
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
        throw new Error('Failed to delete reminder');
      }

      onDeleteReminder(reminderId);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      onError('Failed to delete reminder');
    } finally {
      setDeletingId(null);
    }
  };

  if (reminders.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
        No reminders found. Add your first reminder above.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Company</TableCell>
            <TableCell>User ID</TableCell>
            <TableCell>Days Between</TableCell>
            <TableCell>Last Reminder</TableCell>
            <TableCell>Next Due Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
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