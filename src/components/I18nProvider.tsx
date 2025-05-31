'use client';

import { PropsWithChildren, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

export default function I18nProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    // Set initial direction based on language
    document.documentElement.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
} 