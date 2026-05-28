'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/marketing/MarketingNavbar';
import Footer from '@/components/marketing/Footer';

// Routes that render full-screen layouts and should NOT show HASA's
// public-facing Navbar/Footer.
const STANDALONE_PREFIXES = [
  '/admin',         // HASA CMS admin dashboard
  '/login',         // directory magic-link login
  '/verify',        // magic-link confirmation
  '/onboarding',    // directory profile wizard
];

export default function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const standalone = STANDALONE_PREFIXES.some((p) =>
    pathname?.startsWith(p)
  );

  return (
    <div className="flex min-h-screen flex-col">
      {!standalone ? <Navbar /> : null}
      <main className="flex-grow">{children}</main>
      {!standalone ? <Footer /> : null}
    </div>
  );
}
