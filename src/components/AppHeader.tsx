'use client';

import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import LoginButton from './LoginButton';
import AdminButton from './AdminButton';
import { useSession } from 'next-auth/react';

export default function AppHeader() {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const userEmail = session?.user?.email || '';

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Reminder System
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {session && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
                  {userName}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                  {userEmail}
                </Typography>
              </Box>
            </Box>
          )}
          <AdminButton />
          <LoginButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
} 