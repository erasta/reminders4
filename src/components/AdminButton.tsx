'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { checkIsAdmin } from '../app/actions';
import AdminDialog from './AdminDialog';
import { Button } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

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
      <Button
        variant="outlined"
        color="inherit"
        onClick={handleClick}
        startIcon={<AdminPanelSettingsIcon />}
      >
        Admin
      </Button>
      <AdminDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        isAuthorized={isAdmin}
      />
    </>
  );
} 