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
import EmailIcon from '@mui/icons-material/Email';
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
  const [sendingId, setSendingId] = useState<string | null>(null);

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

  const handleSendReminder = async (reminder: Reminder) => {
    if (sendingId) return;
    
    setSendingId(reminder.id);
    try {
      const response = await fetch('/api/admin/send-single-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reminderId: reminder.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reminder');
      }

      alert('Reminder sent successfully');
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert(error instanceof Error ? error.message : 'Failed to send reminder');
    } finally {
      setSendingId(null);
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
      )).sort((a: Reminder, b: Reminder) => {
        const aDue = a.getNextDueDate()?.getTime() ?? Infinity;
        const bDue = b.getNextDueDate()?.getTime() ?? Infinity;
        return aDue - bDue;
      });
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Typography>{user.displayName}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Created: {user.createdAt.toLocaleDateString()}
                </Typography>
                <Tooltip title="Send Test Email">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendTestEmail(user.email);
                    }}
                  >
                    <EmailIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                          onSend={handleSendReminder}
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
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
} 