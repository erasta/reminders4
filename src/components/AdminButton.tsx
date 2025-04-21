'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { checkIsAdmin } from '../app/actions';
import AdminDialog from './AdminDialog';

export default function AdminButton() {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function verifyAdminStatus() {
      if (session?.user?.email) {
        try {
          const adminStatus = await checkIsAdmin();
          setIsAdmin(adminStatus);
        } catch (err) {
          console.error('Failed to verify admin status:', err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    }

    verifyAdminStatus();
  }, [session]);

  const handleClick = () => {
    setIsDialogOpen(true);
  };

  if (!session || !isAdmin || isLoading) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Admin
      </button>
      <AdminDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
} 