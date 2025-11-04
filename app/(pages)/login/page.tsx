'use client';

import { useState, useContext } from 'react';
import Link from 'next/link';
import { LanguageContext } from '~/context/LanguageContext';
import { getTranslation } from '~/utils/i18n';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { language } = useContext(LanguageContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Email:', email, 'Password:', password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-slate-800">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">{getTranslation(language, 'login.title')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {getTranslation(language, 'login.emailLabel')}
            </label>
            <input
              type="email"
              id="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-700 dark:text-white"
              placeholder={getTranslation(language, 'login.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {getTranslation(language, 'login.passwordLabel')}
            </label>
            <input
              type="password"
              id="password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-700 dark:text-white"
              placeholder={getTranslation(language, 'login.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {getTranslation(language, 'login.loginButton')}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {getTranslation(language, 'login.noAccount')}{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            {getTranslation(language, 'login.signUp')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
