'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllUsers, getRemindersDueToday } from '../app/actions';
import UsersList from './admin/UsersList';
import RemindersList from './admin/RemindersList';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { User } from '@/models/User';
import { Reminder } from '@/models/Reminder';

type AdminDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  isAuthorized: boolean;
};

export default function AdminDialog({ isOpen, onClose, isAuthorized }: AdminDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderError, setReminderError] = useState<string | null>(null);

  const refreshAdminData = useCallback(async () => {
    if (!isAuthorized) {
      setUsers([]);
      setReminders([]);
      setError('Unauthorized to fetch admin data.');
      setReminderError('Unauthorized to fetch admin data.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setReminderError(null);
    try {
      // Fetch users
      const usersResult = await getAllUsers();
      if (usersResult.error) {
        setError(usersResult.error);
        setUsers([]);
      } else if (usersResult.users) {
        setUsers(usersResult.users.map(user => User.fromDB(user)));
      } else {
        setUsers([]);
      }
      
      // Fetch reminders due today
      const remindersResult = await getRemindersDueToday();
      if (remindersResult.error) {
        setReminderError(remindersResult.error);
        setReminders([]);
        console.error('Error fetching reminders:', remindersResult.error);
      } else if (remindersResult.reminders) {
        setReminders(remindersResult.reminders.map(reminder => Reminder.fromDB(reminder)));
      } else {
        setReminders([]);
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch admin data: ' + (err instanceof Error ? err.message : String(err));
      setError(errorMessage);
      setReminderError(errorMessage); // Also set reminderError if general fetch fails
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthorized]); // Dependency: isAuthorized

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      refreshAdminData(); // Call refreshAdminData when dialog opens
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose, refreshAdminData]); // refreshAdminData added to dependencies

  if (!isOpen) return null;

  if (!isAuthorized && !loading) { // Check !loading to avoid flashing unauthorized during initial load
    return (
      <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>
          Access Denied
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 2 }}>
            You do not have permission to access the admin dashboard.
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Admin Dashboard
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        ) : error && !users.length && !reminders.length ? ( // Show general error only if no data at all
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : (
          <Box sx={{ mt: 2 }}>
            <UsersList users={users} />
            <RemindersList reminders={reminders} error={reminderError} onRemindersSent={refreshAdminData} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
} 