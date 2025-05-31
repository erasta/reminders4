'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { IconButton, Tooltip } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTranslation } from 'react-i18next';

export default function LoginButton() {
  const { data: session } = useSession();
  const { t } = useTranslation();

  if (session) {
    return (
      <Tooltip title={t('auth.logout')} arrow>
        <IconButton
          color="inherit"
          onClick={() => signOut()}
          size="small"
          sx={{ direction: 'ltr' }}
        >
          <LogoutIcon />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={t('auth.login')} arrow>
      <IconButton
        color="inherit"
        onClick={() => signIn('google')}
        size="small"
        sx={{ direction: 'ltr' }}
      >
        <LoginIcon />
      </IconButton>
    </Tooltip>
  );
} 