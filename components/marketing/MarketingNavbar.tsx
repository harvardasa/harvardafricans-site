'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Escape closes the mobile menu. It covers the whole viewport on a phone, so
  // without this a keyboard user who opens it has to tab through all seven
  // links to get out.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/story', label: 'Our Story' },
    { href: '/leadership', label: 'Leadership' },
    { href: '/events', label: 'Events' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/directory', label: 'Directory' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-md shadow-md border-b border-hasa-red/30'
          : 'bg-black/40 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center" aria-label="HASA home">
                {/* The official shield already carries the HASA wordmark, so no
                    text label alongside it. */}
                <Image
                  src="/hasa-logo.svg"
                  alt=""
                  width={225}
                  height={264}
                  className="h-10 w-auto sm:h-11 drop-shadow-sm"
                  loading="eager"
                />
              </Link>
            </div>
          </div>
          {/* Seven links at text-sm plus the shield need roughly 660px of row.
              They used to unfold at `sm` (640px) and overflowed the bar at the
              narrow end of that range; `lg` is the first breakpoint where they
              all fit on one line. */}
          <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                // The current page was marked by colour alone, which says
                // nothing to a screen reader and nothing to anyone who can't
                // separate the red underline from the transparent one.
                aria-current={pathname === link.href ? 'page' : undefined}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  pathname === link.href
                    ? 'border-hasa-red text-white'
                    : 'border-transparent text-gray-300 hover:border-hasa-red/50 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="-mr-2 flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="marketing-mobile-menu"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10"
            >
              {/* The label has to track the state: a control that still says
                  "Open main menu" while the menu is open is announced wrong. */}
              <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          id="marketing-mobile-menu"
          className="lg:hidden bg-black/90 border-t border-hasa-red/30 backdrop-blur-xl"
        >
          <div className="pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                aria-current={pathname === link.href ? 'page' : undefined}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname === link.href
                    ? 'bg-hasa-red/20 border-hasa-red text-white'
                    : 'border-transparent text-gray-300 hover:bg-white/5 hover:border-hasa-red/50 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
