'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';

const LanguageSwitcher = () => {
  const [currentLang, setCurrentLang] = useState('en');

  const toggleLanguage = () => {
    // This is a placeholder for future implementation
    setCurrentLang(currentLang === 'en' ? 'he' : 'en');
  };

  return (
    <Button
      variant="outlined"
      color="inherit"
      onClick={toggleLanguage}
      startIcon={<TranslateIcon />}
    >
      {currentLang === 'en' ? 'עברית' : 'English'}
    </Button>
  );
};

export default LanguageSwitcher; 