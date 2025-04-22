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

type Reminder = {
  id: string;
  company_id: string;
  company_name: string;
  company_user_id: string | null;
  days_between_reminders: number;
  last_reminder_date: Date;
  date_due: string;
  user_email: string;
};

// Helper function to format dates safely
function formatDate(dateString: string | Date): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

type RemindersListProps = {
  reminders: Reminder[];
  error: string | null;
};

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
                  <TableCell>{reminder.user_email}</TableCell>
                  <TableCell>{reminder.company_name}</TableCell>
                  <TableCell>
                    {formatDate(reminder.last_reminder_date)}
                  </TableCell>
                  <TableCell>{reminder.days_between_reminders}</TableCell>
                  <TableCell>
                    {formatDate(reminder.date_due)}
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