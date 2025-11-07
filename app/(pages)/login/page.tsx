'use client';

import { useState, useContext, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { LanguageContext } from '~/context/LanguageContext';
import { getTranslation } from '~/utils/i18n';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { loginAction } from '../../(auth)/actions';

function SubmitButton({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus();
  const { language } = useContext(LanguageContext);

  return (
    <button
      type="submit"
      className={`w-full rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        enabled
          ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
          : 'cursor-not-allowed bg-gray-400'
      }`}
      disabled={!enabled || pending}
    >
      {pending ? getTranslation(language, 'login.signingIn') : getTranslation(language, 'login.loginButton')}
    </button>
  );
}

const LoginPage = () => {
  const { language } = useContext(LanguageContext);

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [state, formAction] = useFormState(loginAction as any, { errorKey: '' });
  const [submitted, setSubmitted] = useState(false);

  const errorKey = state?.errorKey || (submitted && (!email || !password) ? 'login.errorAllFields' : '');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-slate-800">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
          {getTranslation(language, 'login.title')}
        </h2>

        <form
          action={(formData) => {
            setSubmitted(true);
            formAction(formData);
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="email"
              className={`mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 ${
                language === 'he' ? 'text-right' : ''
              }`}
            >
              {getTranslation(language, 'login.emailLabel')}
            </label>
            <input
              type="email"
              id="email"
              name="email" // important for FormData
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none 
              dark:border-gray-600 dark:bg-slate-700 dark:text-white ${
                language === 'he' ? 'text-right' : ''
              }`}
              placeholder={getTranslation(language, 'login.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative mb-6">
            <label
              htmlFor="password"
              className={`mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 ${
                language === 'he' ? 'text-right' : ''
              }`}
            >
              {getTranslation(language, 'login.passwordLabel')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password" // important for FormData
                className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none 
                dark:border-gray-600 dark:bg-slate-700 dark:text-white ${
                  language === 'he' ? 'text-right' : ''
                }`}
                placeholder={getTranslation(language, 'login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={`absolute inset-y-0 flex items-center px-3 text-gray-500 ${
                  language === 'he' ? 'left-0' : 'right-0'
                }`}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          

          {errorKey && (
            <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/50">
              <p className="text-center text-sm text-red-800 dark:text-red-200">
                {getTranslation(language, errorKey)}
              </p>
            </div>
          )}

          <SubmitButton enabled={!!email && !!password} />
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
