'use client';

import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import LoginButton from './LoginButton';
import AdminButton from './AdminButton';

export default function AppHeader() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Reminder System
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <AdminButton />
          <LoginButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
} 