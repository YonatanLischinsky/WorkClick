'use client';

import { signOutAction } from '../../(auth)/actions';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '~/utils/supabase';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  account_type: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { session },
        error: sessionErr,
      } = await supabase.auth.getSession();

      if (sessionErr) console.error('Error getting session:', sessionErr);

      if (!session) {
        setLoading(false);
        router.push('/login');
        return;
      }

      const { data: prof, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!mounted) return;

      if (error) {
        console.error('Error loading profile:', error);
        setLoading(false);
        return;
      }

      setProfile(prof as Profile);
      setLoading(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) router.push('/login');
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-slate-800">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
<form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-slate-800">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-slate-700">
            <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-white">User Profile</h3>
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p>
                <span className="font-medium">Full Name:</span> {profile.full_name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {profile.email}
              </p>
              <p>
                <span className="font-medium">Account Type:</span> {profile.account_type ?? '—'}
              </p>
              <p>
                <span className="font-medium">Member Since:</span>{' '}
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Server-side sign out clears auth cookies */}
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
