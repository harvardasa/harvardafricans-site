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
      {/* Every public page repeats the same seven nav links before its content
          starts, so keyboard and screen-reader users need a way past them.
          Off-screen until focused, then pinned to the top-left. */}
      {!standalone ? (
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-hasa-red focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
      ) : null}
      {!standalone ? <Navbar /> : null}
      {/* tabIndex={-1} so the skip link actually moves focus here, not just the
          scroll position — without it the next Tab returns to the nav. */}
      <main id="main-content" tabIndex={-1} className="flex-grow">
        {children}
      </main>
      {!standalone ? <Footer /> : null}
    </div>
  );
}
