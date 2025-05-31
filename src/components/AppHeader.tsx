'use client';

import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip } from '@mui/material';
import LoginButton from './LoginButton';
import AdminButton from './AdminButton';
import LanguageSwitcher from './LanguageSwitcher';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

export default function AppHeader() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const userName = session?.user?.name || '';
  const userEmail = session?.user?.email || '';

  return (
    <AppBar position="static">
      <Toolbar sx={{ position: 'relative' }}>
        {/* Centered title */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flex: 1,
            textAlign: 'center'
          }}
        >
          {t('common.appName')}
        </Typography>

        {/* Right side elements with fixed positions */}
        <Box 
          sx={{ 
            position: 'absolute', 
            right: 16, 
            top: '50%', 
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'row',
            direction: 'ltr',
            unicodeBidi: 'isolate',
            alignItems: 'center'
          }}
        >
          {session && (
            <Box component="span" sx={{ mr: 2, display: 'inline-flex', alignItems: 'center' }}>
              <Tooltip title={`${userName}\n${userEmail}`} arrow placement="bottom">
                <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                  {userName}
                </Typography>
              </Tooltip>
            </Box>
          )}
          <Box component="span" sx={{ mr: 1, display: 'inline-block' }}>
            <LanguageSwitcher />
          </Box>
          <Box component="span" sx={{ mr: 1, display: 'inline-block' }}>
            <AdminButton />
          </Box>
          <Box component="span" sx={{ display: 'inline-block' }}>
            <LoginButton />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 