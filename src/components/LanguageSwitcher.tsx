'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
  };

  return (
    <Button
      variant="outlined"
      color="inherit"
      onClick={toggleLanguage}
      startIcon={<TranslateIcon />}
    >
      {i18n.language === 'en' ? 'עברית' : 'English'}
    </Button>
  );
};

export default LanguageSwitcher; 