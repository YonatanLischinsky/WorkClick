import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Metadata } from 'next';

import { SITE } from '~/config.js';

import Providers from '~/components/atoms/Providers';
import Header from '~/components/widgets/Header';
import Announcement from '~/components/widgets/Announcement';
import Footer2 from '~/components/widgets/Footer2';

import '~/assets/styles/base.css';
import { LanguageProvider } from '~/context/LanguageContext';
import HtmlWithLanguage from '~/components/common/HtmlWithLanguage';

export interface LayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: {
    template: `%s — ${SITE.name}`,
    default: SITE.title,
  },
  description: SITE.description,
};

export default async function RootLayout({ children }: LayoutProps) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    profile = data;
  }

  return (
    <HtmlWithLanguage>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="tracking-tight antialiased text-gray-900 dark:text-slate-300 dark:bg-slate-900">
        <LanguageProvider>
          <Providers>
            <Announcement />
            <Header user={user} profile={profile} />
            <main>{children}</main>
            <Footer2 />
          </Providers>
        </LanguageProvider>
      </body>
    </HtmlWithLanguage>
  );
}
