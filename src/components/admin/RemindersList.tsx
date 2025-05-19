'use client';

import { sendAllReminders } from '../../server/sendAllReminders';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Reminder } from '@/models/Reminder';

type RemindersListProps = {
  reminders: Reminder[];
  error: string | null;
};

function formatDate(date: Date | string | null): string {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString();
}

export default function RemindersList({ reminders, error }: RemindersListProps) {
  const handleSendReminders = async () => {
    try {
      const userCount = await sendAllReminders();
      alert(`Reminders sent to ${userCount} users.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to send reminders');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Reminders Due Today
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SendIcon />}
          onClick={handleSendReminders}
        >
          Send Reminders
        </Button>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : reminders.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No reminders are due today.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Last Reminder</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Due Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reminders.map((reminder) => (
                <TableRow key={reminder.id}>
                  <TableCell>{reminder.userId}</TableCell>
                  <TableCell>{reminder.companyName}</TableCell>
                  <TableCell>
                    {formatDate(reminder.lastReminderDate)}
                  </TableCell>
                  <TableCell>{reminder.daysBetweenReminders}</TableCell>
                  <TableCell>
                    {formatDate(reminder.getNextDueDate())}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
} 