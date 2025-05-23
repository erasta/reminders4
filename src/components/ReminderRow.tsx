'use client';

import {
  TableCell,
  TableRow,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import { Reminder } from '@/models/Reminder';

type ReminderRowProps = {
  reminder: Reminder;
  onEdit?: (reminder: Reminder) => void;
  onDelete: (reminderId: string) => void;
  onSend?: (reminder: Reminder) => void;
  isDeleting: boolean;
};

export default function ReminderRow({ reminder, onEdit, onDelete, onSend, isDeleting }: ReminderRowProps) {
  const nextDueDate = reminder.getNextDueDate();
  const daysUntilDue = reminder.getDaysUntilDue();

  return (
    <TableRow>
      <TableCell>{reminder.companyName}</TableCell>
      <TableCell>{reminder.companyUserId || 'Not assigned'}</TableCell>
      <TableCell>{reminder.daysBetweenReminders}</TableCell>
      <TableCell>
        {reminder.lastReminderDate instanceof Date 
          ? reminder.lastReminderDate.toLocaleDateString()
          : reminder.lastReminderDate 
            ? new Date(reminder.lastReminderDate).toLocaleDateString()
            : 'Never'}
      </TableCell>
      <TableCell>
        {nextDueDate ? nextDueDate.toLocaleDateString() : 'Not set'}
      </TableCell>
      <TableCell>
        {reminder.isDue() ? (
          reminder.getDaysUntilDue() === 0 ? (
            <Typography color="primary.main">Due Today</Typography>
          ) : (
            <Typography color="error">Overdue</Typography>
          )
        ) : (
          <Typography color="text.secondary">
            {daysUntilDue !== null 
              ? `${daysUntilDue} days left`
              : 'Not set'}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onEdit && (
            <IconButton
              size="small"
              onClick={() => onEdit(reminder)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          )}
          {onSend && (
            <IconButton
              size="small"
              onClick={() => onSend(reminder)}
              color="primary"
            >
              <SendIcon />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() => onDelete(reminder.id)}
            disabled={isDeleting}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
} 