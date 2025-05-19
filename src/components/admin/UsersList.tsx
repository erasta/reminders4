'use client';

import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import { User } from '@/models/User';
import { Reminder } from '@/models/Reminder';
import ReminderRow from '../ReminderRow';

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

type UsersListProps = {
  users: User[];
};

export default function UsersList({ users }: UsersListProps) {
  const [userReminders, setUserReminders] = useState<Record<string, Reminder[]>>({});
  const [loadingReminders, setLoadingReminders] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSendTestEmail = async (email: string) => {
    try {
      const response = await fetch('/api/admin/send-test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send test email');
      }

      alert('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email:', error);
      alert(error instanceof Error ? error.message : 'Failed to send test email');
    }
  };

  const fetchUserReminders = async (userId: string) => {
    if (loadingReminders[userId]) return;
    
    setLoadingReminders(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await fetch(`/api/admin/user-reminders?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reminders');
      }
      const data = await response.json();
      // Convert the raw data to Reminder instances
      const reminders = data.map((reminder: any) => new Reminder(
        reminder.id,
        reminder.userId,
        reminder.companyId,
        reminder.companyName,
        reminder.companyUserId,
        reminder.daysBetweenReminders,
        reminder.lastReminderDate ? new Date(reminder.lastReminderDate) : null,
        new Date(reminder.createdAt)
      ));
      setUserReminders(prev => ({ ...prev, [userId]: reminders }));
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoadingReminders(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (deletingId) return;
    
    setDeletingId(reminderId);
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete reminder');
      }

      // Update the reminders in state
      setUserReminders(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(userId => {
          newState[userId] = newState[userId].filter(r => r.id !== reminderId);
        });
        return newState;
      });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete reminder');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditReminder = (reminder: Reminder) => {
    // TODO: Implement edit functionality
    console.log('Edit reminder:', reminder);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Users
      </Typography>
      {users.map((user) => (
        <Accordion 
          key={user.id}
          onChange={(_, expanded) => {
            if (expanded && !userReminders[user.id]) {
              fetchUserReminders(user.id);
            }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`user-${user.id}-content`}
            id={`user-${user.id}-header`}
          >
            <Typography>{user.displayName}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email: {user.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {user.createdAt.toLocaleDateString()}
                  </Typography>
                </Box>
                <Tooltip title="Send Test Email">
                  <IconButton
                    size="small"
                    onClick={() => handleSendTestEmail(user.email)}
                  >
                    <SendIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Reminders
                </Typography>
                {loadingReminders[user.id] ? (
                  <Typography color="text.secondary">Loading reminders...</Typography>
                ) : userReminders[user.id]?.length ? (
                  <TableContainer component={Paper}>
                    <Table size="small">
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
                        {userReminders[user.id].map((reminder) => (
                          <ReminderRow
                            key={reminder.id}
                            reminder={reminder}
                            onDelete={handleDeleteReminder}
                            isDeleting={deletingId === reminder.id}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">No reminders found</Typography>
                )}
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
} 