'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '~/utils/supabase';
import { LanguageContext } from '~/context/LanguageContext';
import { getTranslation } from '~/utils/i18n';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

const SignupPage = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState(''); // UI value
  const [isFormValid, setIsFormValid] = useState(false);
  const [errorKey, setErrorKey] = useState('');
  const [infoKey, setInfoKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    if (fullName === '' || email === '' || password === '' || confirmPassword === '') {
      setErrorKey('signup.errorAllFields');
      setInfoKey('');
      setIsFormValid(false);
    } else if (accountType === '') {
      setErrorKey('signup.errorAccountType');
      setInfoKey('');
      setIsFormValid(false);
    } else if (!email.includes('@') || !email.includes('.')) {
      setErrorKey('signup.errorInvalidEmail');
      setInfoKey('');
      setIsFormValid(false);
    } else if (password.length < 6) {
      setErrorKey('signup.errorPasswordLength');
      setInfoKey('');
      setIsFormValid(false);
    } else if (password !== confirmPassword) {
      setErrorKey('signup.errorPasswordMismatch');
      setInfoKey('');
      setIsFormValid(false);
    } else {
      setErrorKey('');
      setIsFormValid(true);
    }
  }, [fullName, email, password, confirmPassword, accountType]);

  // normalize UI selection -> enum: 'contractor' | 'hr'
  const normalizeRole = (v: string): 'contractor' | 'hr' | null => {
    if (!v) return null;
    const lower = v.toLowerCase();
    if (lower.includes('contractor')) return 'contractor';
    // covers "HR company", "hr", etc.
    if (lower.includes('hr')) return 'hr';
    return null;
    // If you want to be strict, use exact values from the <select> below.
  };

  const redirectByRole = (accountType?: string | null) => {
    return router.push('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setInfoKey('');

    try {
      const enumRole = normalizeRole(accountType);
      if (!enumRole) {
        setErrorKey('signup.errorAccountType');
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            account_type: enumRole, // goes to raw_user_meta_data; trigger can copy this
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('email')) {
          setErrorKey('signup.errorEmailExists');
        } else if (signUpError.message.toLowerCase().includes('password')) {
          setErrorKey('signup.errorPasswordWeak');
        } else {
          setErrorKey('signup.errorGeneral');
        }
        return;
      }

      // If your project requires email confirmation, data.session === null
      if (!data?.user) {
        setErrorKey('signup.errorGeneral');
        return;
      }

      // If confirmation required -> tell the user to verify email and stop.
      if (data.session === null) {
        setInfoKey('signup.confirmEmail');
        setErrorKey('');
        return;
      }

      // If email confirmation is disabled (or magic link already created a session):
      // Ensure profiles.account_type is set (some people keep a trigger that only copies name).
      // This update is safe under RLS (user can update own row).
      await supabase
        .from('profiles')
        .update({ account_type: enumRole })
        .eq('id', data.user.id);

      // Fetch profile for redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', data.user.id)
        .single();

      redirectByRole(profile?.account_type ?? enumRole);
    } catch (error: any) {
      console.error('Error signing up:', error);
      setErrorKey('signup.errorGeneral');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-slate-800">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
          {getTranslation(language, 'signup.title')}
        </h2>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="mb-4">
            <label
              htmlFor="fullName"
              className={`mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 ${
                language === 'he' ? 'text-right' : ''
              }`}
            >
              {getTranslation(language, 'signup.fullNameLabel')}
            </label>
            <input
              type="text"
              id="fullName"
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-700 dark:text-white ${
                language === 'he' ? 'text-right' : ''
              }`}
              placeholder={getTranslation(language, 'signup.fullNamePlaceholder')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className={`mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 ${
                language === 'he' ? 'text-right' : ''
              }`}
            >
              {getTranslation(language, 'signup.emailLabel')}
            </label>
            <input
              type="email"
              id="email"
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-700 dark:text-white ${
                language === 'he' ? 'text-right' : ''
              }`}
              placeholder={getTranslation(language, 'signup.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className={`mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 ${
                language === 'he' ? 'text-right' : ''
              }`}
            >
              {getTranslation(language, 'signup.passwordLabel')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-700 dark:text-white ${
                  language === 'he' ? 'text-right' : ''
                }`}
                placeholder={getTranslation(language, 'signup.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
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

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className={`mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 ${
                language === 'he' ? 'text-right' : ''
              }`}
            >
              {getTranslation(language, 'signup.confirmPasswordLabel')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-700 dark:text-white ${
                  language === 'he' ? 'text-right' : ''
                }`}
                placeholder={getTranslation(language, 'signup.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className={`absolute inset-y-0 flex items-center px-3 text-gray-500 ${
                  language === 'he' ? 'left-0' : 'right-0'
                }`}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="accountType"
              className={`mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 ${
                language === 'he' ? 'text-right' : ''
              }`}
            >
              {getTranslation(language, 'signup.accountTypeLabel')}
            </label>
            <select
              id="accountType"
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-700 dark:text-white ${
                language === 'he' ? 'text-right' : ''
              }`}
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              required
            >
              <option value="" disabled>
                {getTranslation(language, 'signup.accountTypePlaceholder')}
              </option>
              {/* Values are human-readable for UI; we normalize before sending */}
              <option value="Contractor">
                {getTranslation(language, 'signup.accountTypeContractor')}
              </option>
              <option value="HR company">
                {getTranslation(language, 'signup.accountTypeHrCompany')}
              </option>
            </select>
          </div>

          {errorKey && (
            <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/50">
              <p className="text-center text-sm text-red-800 dark:text-red-200">
                {getTranslation(language, errorKey)}
              </p>
            </div>
          )}
          {infoKey && (
            <div className="mb-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/50">
              <p className="text-center text-sm text-blue-800 dark:text-blue-200">
                {getTranslation(language, infoKey)}
              </p>
            </div>
          )}

          <button
            type="submit"
            className={`w-full rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isFormValid
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                : 'cursor-not-allowed bg-gray-400'
            }`}
            disabled={!isFormValid}
          >
            {getTranslation(language, 'signup.signupButton')}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {getTranslation(language, 'signup.alreadyAccount')}{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            {getTranslation(language, 'signup.login')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
