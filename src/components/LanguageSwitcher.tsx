'use client';

import { useTranslation } from 'react-i18next';
import { IconButton, Tooltip } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
  };

  return (
    <Tooltip title={i18n.language === 'en' ? 'Switch to Hebrew' : 'עבור לאנגלית'} arrow>
      <IconButton
        color="inherit"
        onClick={toggleLanguage}
        size="small"
        sx={{ direction: 'ltr' }}
      >
        <TranslateIcon />
      </IconButton>
    </Tooltip>
  );
};

export default LanguageSwitcher; 