'use client';

import { createContext, useState, useMemo } from 'react';

export const LanguageContext = createContext({
  language: 'en',
  setLanguage: (language: string) => {},
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('he');

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
