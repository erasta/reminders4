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
  Snackbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState } from 'react';

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
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSendReminders = async () => {
    try {
      await sendAllReminders();
      setAlert({
        open: true,
        message: 'All reminders sent successfully',
        severity: 'success',
      });
    } catch (error) {
      setAlert({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to send reminders',
        severity: 'error',
      });
    }
  };

  const handleSendSingleReminder = async (reminderId: string) => {
    try {
      const response = await fetch('/api/send-single-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reminderId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reminder');
      }

      setAlert({
        open: true,
        message: 'Reminder sent successfully',
        severity: 'success',
      });
    } catch (error) {
      setAlert({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to send reminder',
        severity: 'error',
      });
    }
  };

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Reminders Due Today</Typography>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSendReminders}
            disabled={reminders.length === 0}
          >
            Send All Reminders
          </Button>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Days Between</TableCell>
                <TableCell>Last Reminder</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>User Email</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reminders.map((reminder) => (
                <TableRow key={reminder.id}>
                  <TableCell>{reminder.company_name}</TableCell>
                  <TableCell>{reminder.company_user_id || 'Not assigned'}</TableCell>
                  <TableCell>{reminder.days_between_reminders}</TableCell>
                  <TableCell>{formatDate(reminder.last_reminder_date)}</TableCell>
                  <TableCell>{formatDate(reminder.date_due)}</TableCell>
                  <TableCell>{reminder.user_email}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Send reminder">
                      <IconButton onClick={() => handleSendSingleReminder(reminder.id)}>
                        <NotificationsIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={() => setAlert(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setAlert(prev => ({ ...prev, open: false }))} 
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
} 