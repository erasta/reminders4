'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { checkIsAdmin } from '../app/actions';
import AdminDialog from './AdminDialog';
import { IconButton, Tooltip } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useTranslation } from 'react-i18next';

export default function AdminButton() {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t } = useTranslation();

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
      <Tooltip title={t('auth.admin')} arrow>
        <IconButton
          color="inherit"
          onClick={handleClick}
          size="small"
          sx={{ direction: 'ltr' }}
        >
          <AdminPanelSettingsIcon />
        </IconButton>
      </Tooltip>
      <AdminDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        isAuthorized={isAdmin}
      />
    </>
  );
} 