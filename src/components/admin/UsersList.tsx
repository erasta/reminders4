'use client';

import { useState } from 'react';
import { sendTestEmail } from '../../server/email';

type User = {
  id: string;
  email: string;
  created_at: Date;
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

type UsersListProps = {
  users: User[];
};

export default function UsersList({ users }: UsersListProps) {
  const [sendingEmails, setSendingEmails] = useState<Record<string, boolean>>({});

  const handleSendTestEmail = async (userEmail: string) => {
    setSendingEmails(prev => ({ ...prev, [userEmail]: true }));
    
    try {
      await sendTestEmail(userEmail);
    } finally {
      setSendingEmails(prev => ({ ...prev, [userEmail]: false }));
    }
  };

  return (
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
  );
} 