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
import { useTranslation } from 'react-i18next';

type ReminderRowProps = {
  reminder: Reminder;
  onEdit?: (reminder: Reminder) => void;
  onDelete: (reminderId: string) => void;
  onSend?: (reminder: Reminder) => void;
  isDeleting: boolean;
};

export default function ReminderRow({ reminder, onEdit, onDelete, onSend, isDeleting }: ReminderRowProps) {
  const { t } = useTranslation();
  const nextDueDate = reminder.getNextDueDate();
  const daysUntilDue = reminder.getDaysUntilDue();

  return (
    <TableRow>
      <TableCell>{reminder.companyName}</TableCell>
      <TableCell>{reminder.companyUserId || t('reminders.notAssigned')}</TableCell>
      <TableCell>{reminder.daysBetweenReminders}</TableCell>
      <TableCell>
        {reminder.lastReminderDate instanceof Date 
          ? reminder.lastReminderDate.toLocaleDateString()
          : reminder.lastReminderDate 
            ? new Date(reminder.lastReminderDate).toLocaleDateString()
            : t('reminders.never')}
      </TableCell>
      <TableCell>
        {nextDueDate ? nextDueDate.toLocaleDateString() : t('reminders.notSet')}
      </TableCell>
      <TableCell>
        {reminder.isDue() ? (
          reminder.getDaysUntilDue() === 0 ? (
            <Typography color="primary.main">{t('reminders.dueToday')}</Typography>
          ) : (
            <Typography color="error">{t('reminders.overdue')}</Typography>
          )
        ) : (
          <Typography color="text.secondary">
            {daysUntilDue !== null 
              ? t('reminders.daysLeft', { days: daysUntilDue })
              : t('reminders.notSet')}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onEdit && (
            <IconButton
              size="small"
              onClick={() => onEdit(reminder)}
              title={t('common.edit')}
            >
              <EditIcon />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() => onDelete(reminder.id)}
            disabled={isDeleting}
            title={t('common.delete')}
          >
            <DeleteIcon />
          </IconButton>
          {onSend && (
            <IconButton
              size="small"
              onClick={() => onSend(reminder)}
              title={t('reminders.send')}
            >
              <SendIcon />
            </IconButton>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
} 