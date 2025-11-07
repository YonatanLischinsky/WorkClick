import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signOutAction } from '../../(auth)/actions';
import { getTranslation } from '~/utils/i18n';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  account_type: string | null;
  created_at: string;
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const language = cookieStore.get('NEXT_LOCALE')?.value || 'en';

  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('Error loading profile:', error);
  }

  if (!profile) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-900"
        dir={language === 'he' ? 'rtl' : 'ltr'}
      >
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-slate-800">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">{getTranslation(language, 'dashboard.title')}</h2>
          <p className="mb-4 text-center text-gray-600 dark:text-gray-300">{getTranslation(language, 'dashboard.profileError')}</p>

          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {getTranslation(language, 'dashboard.signOutButton')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-900"
      dir={language === 'he' ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-slate-800">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">{getTranslation(language, 'dashboard.title')}</h2>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-slate-700">
            <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-white">{getTranslation(language, 'dashboard.profileTitle')}</h3>
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p>
                <span className="font-medium">{getTranslation(language, 'dashboard.fullNameLabel')}:</span> {profile.full_name}
              </p>
              <p>
                <span className="font-medium">{getTranslation(language, 'dashboard.emailLabel')}:</span> {profile.email}
              </p>
              <p>
                <span className="font-medium">{getTranslation(language, 'dashboard.accountTypeLabel')}:</span> {profile.account_type ?? '—'}
              </p>
              <p>
                <span className="font-medium">{getTranslation(language, 'dashboard.memberSinceLabel')}:</span>{' '}
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {getTranslation(language, 'dashboard.signOutButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
