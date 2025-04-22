'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <Button
        variant="outlined"
        color="inherit"
        onClick={() => signOut()}
        startIcon={<LogoutIcon />}
      >
        Sign Out
      </Button>
    );
  }

  return (
    <Button
      variant="contained"
      color="inherit"
      onClick={() => signIn('google')}
      startIcon={<LoginIcon />}
    >
      Sign In
    </Button>
  );
} 