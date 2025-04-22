'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Reminder } from '@/types/reminder';

type ReminderListProps = {
  reminders: Reminder[];
  onEditReminder: (reminder: Reminder) => void;
  onDeleteReminder: (reminderId: string) => void;
  onError: (error: string) => void;
};

export default function ReminderList({ reminders, onEditReminder, onDeleteReminder, onError }: ReminderListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reminders.map((reminder) => (
            <TableRow key={reminder.id}>
              <TableCell>{reminder.companyName}</TableCell>
              <TableCell>{reminder.companyUserId || 'Not assigned'}</TableCell>
              <TableCell>{reminder.daysBetweenReminders}</TableCell>
              <TableCell>
                {reminder.lastReminderDate 
                  ? new Date(reminder.lastReminderDate).toLocaleDateString()
                  : 'Never'}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => onEditReminder(reminder)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(reminder.id)}
                    disabled={deletingId === reminder.id}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 