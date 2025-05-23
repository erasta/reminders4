'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
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
import SendIcon from '@mui/icons-material/Send';
import { User } from '@/models/User';
import { Reminder } from '@/models/Reminder';
import ReminderRow from '../ReminderRow';

// Helper function to format dates safely
// function formatDate(dateString: string | Date): string {
//   try {
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) {
//       return 'Invalid Date';
//     }
//     return date.toLocaleDateString();
//   } catch (error) {
//     console.error('Error formatting date:', error);
//     return 'Invalid Date';
//   }
// }

type UsersListProps = {
  users: User[];
};

// Define a type for the raw reminder data from the API
interface RawReminderData {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  companyUserId: string | null;
  daysBetweenReminders: number;
  lastReminderDate: string | null; // Assuming it comes as string from JSON
  createdAt: string; // Assuming it comes as string from JSON
  // Add any other fields that come from /api/admin/user-reminders?userId=${userId}
}

export default function UsersList({ users }: UsersListProps) {
  const [userReminders, setUserReminders] = useState<Record<string, Reminder[]>>({});
  const [loadingReminders, setLoadingReminders] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendingAllForUser, setSendingAllForUser] = useState<string | null>(null);

  const handleSendTestEmail = async (userId: string, email: string) => {
    try {
      console.log('Sending test email for:', { userId, email });
      const response = await fetch('/api/admin/send-test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email');
      }

      alert(data.message || 'Test email sent successfully');
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reminder');
      }

      const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      alert(`Reminder sent successfully\n\nTo: ${data.email}\nSubject: ${data.subject}\nSent at: ${timestamp}`);
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert(error instanceof Error ? error.message : 'Failed to send reminder');
    } finally {
      setSendingId(null);
    }
  };

  const handleSendAllDueReminders = async (userId: string) => {
    if (sendingAllForUser) return;
    
    setSendingAllForUser(userId);
    try {
      const response = await fetch('/api/admin/send-user-due-reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send reminders');
      }

      const data = await response.json();
      alert(`Successfully sent ${data.count} reminders`);
      
      if (userReminders[userId]) {
        fetchUserReminders(userId);
      }
    } catch (error) {
      console.error('Error sending reminders:', error);
      alert(error instanceof Error ? error.message : 'Failed to send reminders');
    } finally {
      setSendingAllForUser(null);
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
      const data: RawReminderData[] = await response.json(); // Use RawReminderData type
      const reminders = data.map((reminder) => new Reminder( // Now reminder is typed
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
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionActions>
            <Tooltip title="Send All Due Reminders">
              <IconButton
                size="small"
                onClick={() => handleSendAllDueReminders(user.id)}
                disabled={sendingAllForUser === user.id}
              >
                <SendIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Send Test Email">
              <IconButton
                size="small"
                onClick={() => handleSendTestEmail(user.id, user.email)}
              >
                <EmailIcon />
              </IconButton>
            </Tooltip>
          </AccordionActions>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {loadingReminders[user.id] ? (
                <Typography color="text.secondary">Loading reminders...</Typography>
              ) : userReminders[user.id] && userReminders[user.id].length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
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
                      {userReminders[user.id].map((reminder) => (
                        <ReminderRow
                          key={reminder.id}
                          reminder={reminder}
                          onDelete={handleDeleteReminder} 
                          onSend={handleSendReminder}
                          isDeleting={deletingId === reminder.id || sendingId === reminder.id}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">No reminders found for this user.</Typography>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
} 