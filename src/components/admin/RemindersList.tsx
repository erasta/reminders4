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
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Reminder } from '@/models/Reminder';
import ReminderRow from '../ReminderRow';

type RemindersListProps = {
  reminders: Reminder[];
  error: string | null;
  onRemindersSent: () => void;
};

// formatDate is not used if ReminderRow handles its own date formatting
// function formatDate(date: Date | string | null): string {
//   if (!date) return 'Never';
//   return new Date(date).toLocaleDateString();
// }

export default function RemindersList({ reminders, error, onRemindersSent }: RemindersListProps) {
  // const handleSendReminders = async () => { // Old combined handler
  //   try {
  //     const userCount = await sendAllReminders(); // This would now need a list
  //     alert(`Reminders sent to ${userCount} users.`);
  //   } catch (err) {
  //     alert(err instanceof Error ? err.message : 'Failed to send reminders');
  //   }
  // };

  // Placeholder functions for ReminderRow props in admin context
  // const handleEditPlaceholder = (reminder: Reminder) => {
  //   console.log('Edit clicked for reminder (admin view):', reminder.id);
  //   // Admin-specific edit logic can be added here
  // };

  const handleDeletePlaceholder = (reminderId: string) => {
    console.log('Delete clicked for reminder ID (admin view):', reminderId);
    // Admin-specific delete logic can be added here
  };

  const handleSendPlaceholder = (reminder: Reminder) => {
    console.log('Send clicked for reminder (admin view):', reminder.id);
    // Admin-specific send logic can be added here
  };

  const dueTodayReminders = reminders.filter(
    (reminder) => reminder.getDaysUntilDue() === 0
  );
  const overdueReminders = reminders.filter(
    (reminder) => (reminder.getDaysUntilDue() ?? 0) < 0 // Handle null for getDaysUntilDue just in case
  );

  const handleSendDueTodayReminders = async () => {
    if (dueTodayReminders.length === 0) {
      alert('No reminders due today to send.');
      return;
    }
    try {
      // Convert Reminder instances to plain JSON objects
      const plainDueTodayReminders = dueTodayReminders.map(r => r.toJSON());
      const userCount = await sendAllReminders(plainDueTodayReminders);
      alert(`Sent reminders due today to ${userCount} user(s).`);
      onRemindersSent();
    } catch (err) {
      alert(`Failed to send reminders due today: ${(err instanceof Error ? err.message : String(err))}`);
    }
  };

  const handleSendOverdueReminders = async () => {
    if (overdueReminders.length === 0) {
      alert('No overdue reminders to send.');
      return;
    }
    try {
      // Convert Reminder instances to plain JSON objects
      const plainOverdueReminders = overdueReminders.map(r => r.toJSON());
      const userCount = await sendAllReminders(plainOverdueReminders);
      alert(`Sent overdue reminders to ${userCount} user(s).`);
      onRemindersSent();
    } catch (err) {
      alert(`Failed to send overdue reminders: ${(err instanceof Error ? err.message : String(err))}`);
    }
  };

  const renderRemindersTable = (title: string, reminderList: Reminder[]) => {
    if (reminderList.length === 0) {
      return (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No reminders in this category.
          </Typography>
        </Box>
      );
    }

    return (
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {/* Columns from ReminderRow */}
                <TableCell>Company</TableCell>
                <TableCell>Company User ID</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Last Reminder</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reminderList.map((reminder) => (
                <ReminderRow
                  key={reminder.id}
                  reminder={reminder}
                  // onEdit={handleEditPlaceholder} // Remove edit functionality for admin
                  onDelete={handleDeletePlaceholder}
                  onSend={handleSendPlaceholder}
                  isDeleting={false}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5" sx={{ mb: { xs: 1, sm: 0} }}> 
          Due Reminders Overview
        </Typography>
        {/* Button group for sending reminders */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap'}}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={handleSendDueTodayReminders} // New handler
            disabled={dueTodayReminders.length === 0}
          >
            Send Due Today ({dueTodayReminders.length})
          </Button>
          <Button
            variant="contained"
            color="secondary" // Changed color for distinction
            startIcon={<SendIcon />}
            onClick={handleSendOverdueReminders} // New handler
            disabled={overdueReminders.length === 0}
          >
            Send Overdue ({overdueReminders.length})
          </Button>
        </Box>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          {renderRemindersTable('Reminders Due Today', dueTodayReminders)}
          <Divider sx={{ my: 4 }} />
          {renderRemindersTable('Overdue Reminders', overdueReminders)}
        </>
      )}
    </Box>
  );
} 