'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, getRemindersDueToday } from '../app/actions';
import { sendTestEmail } from '../server/emailUtils';

type User = {
  id: string;
  email: string;
  created_at: Date;
};

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

type AdminDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  isAuthorized: boolean;
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

export default function AdminDialog({ isOpen, onClose, isAuthorized }: AdminDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [sendingEmails, setSendingEmails] = useState<Record<string, boolean>>({});

  // Add event listener for escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      async function fetchData() {
        setLoading(true);
        setError(null);
        setReminderError(null);
        try {
          // Fetch users
          const usersResult = await getAllUsers();
          if (usersResult.error) {
            setError(usersResult.error);
          } else if (usersResult.users) {
            setUsers(usersResult.users as User[]);
          } else {
            setUsers([]);
          }
          
          // Fetch reminders due today
          try {
            const remindersResult = await getRemindersDueToday();
            if (remindersResult.error) {
              setReminderError(remindersResult.error);
              console.error('Error fetching reminders:', remindersResult.error);
            } else if (remindersResult.reminders) {
              setReminders(remindersResult.reminders as Reminder[]);
            } else {
              setReminders([]);
            }
          } catch (reminderErr) {
            setReminderError('Failed to fetch reminders: ' + (reminderErr instanceof Error ? reminderErr.message : String(reminderErr)));
            console.error('Exception fetching reminders:', reminderErr);
          }
        } catch (err) {
          setError('Failed to fetch data: ' + (err instanceof Error ? err.message : String(err)));
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      
      fetchData();
    }
  }, [isOpen]);

  const handleSendTestEmail = async (userEmail: string) => {
    setSendingEmails(prev => ({ ...prev, [userEmail]: true }));
    
    try {
      await sendTestEmail(userEmail);
    } finally {
      setSendingEmails(prev => ({ ...prev, [userEmail]: false }));
    }
  };

  if (!isOpen) return null;

  // Show unauthorized message if not an admin
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-700">You do not have permission to access the admin dashboard.</p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : (
          <div className="overflow-auto flex-grow">
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Users</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleSendTestEmail(user.email)}
                          disabled={sendingEmails[user.email]}
                          className={`px-3 py-1 rounded ${
                            sendingEmails[user.email]
                              ? 'bg-gray-300 cursor-not-allowed'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          {sendingEmails[user.email] ? 'Sending...' : 'Send Test Email'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Reminders Due Today</h3>
              {reminderError ? (
                <div className="text-red-500 p-4 bg-red-50 rounded-md">
                  <p className="font-medium">Error loading reminders:</p>
                  <p className="text-sm mt-1">{reminderError}</p>
                </div>
              ) : reminders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No reminders are due today.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Reminder</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reminders.map((reminder) => (
                      <tr key={reminder.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reminder.user_email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {reminder.company_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(reminder.last_reminder_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reminder.days_between_reminders}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(reminder.date_due)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 