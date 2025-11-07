'use client';

import { useContext } from 'react';
import { LanguageContext } from '~/context/LanguageContext';
import { setCookie } from '~/utils/cookies';

const ToggleLanguage = () => {
  const { language, setLanguage } = useContext(LanguageContext);

  const handleLanguageChange = () => {
    const newLanguage = language === 'en' ? 'he' : 'en';
    setLanguage(newLanguage);
    setCookie('NEXT_LOCALE', newLanguage, 365);
  };

  return (
    <button
      className="text-muted inline-flex items-center rounded-lg p-2.5 text-sm hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
      aria-label="Toggle Language"
      onClick={handleLanguageChange}
    >
      {language === 'en' ? 'HE' : 'EN'}
    </button>
  );
};

export default ToggleLanguage;
