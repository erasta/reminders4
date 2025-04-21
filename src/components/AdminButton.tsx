'use client';

import { useState, useEffect } from 'react';
import { checkIsAdmin } from '../app/actions';

export default function AdminButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
        
        // Get the email from the session
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setEmail(data.user?.email || null);
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setLoading(false);
      }
    }
    
    checkAdmin();
  }, []);

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!isAdmin) {
    return null; // Don't show the button to non-admins
  }

  return (
    <button
      onClick={() => alert(`Hi ${email}`)}
      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
    >
      Admin Action
    </button>
  );
} 