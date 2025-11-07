'use client';

import { createContext, useState, useMemo, useEffect } from 'react';
import { getCookie } from '~/utils/cookies';

export const LanguageContext = createContext({
  language: 'en',
  setLanguage: (language: string) => {},
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('he');

  useEffect(() => {
    const savedLanguage = getCookie('NEXT_LOCALE');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const value = useMemo(() => ({
    language,
    setLanguage,
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
