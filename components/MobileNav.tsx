'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import LogoutButton from './LogoutButton'

// Mobile-only nav. The desktop links in Navbar are `hidden sm:flex`, so on
// phones this hamburger is the only way to reach Directory / My profile /
// Admin. Renders nothing on sm+ screens (parent wraps it in `sm:hidden`).
export default function MobileNav({
  userName,
  isAdmin,
}: {
  userName: string
  isAdmin: boolean
}) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  const linkClass =
    'border-b border-border py-3 text-foreground transition-colors hover:text-primary'

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="-mr-2 rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {open && (
        <>
          {/* Tap-away backdrop. */}
          <button
            aria-hidden="true"
            tabIndex={-1}
            onClick={close}
            className="fixed inset-0 z-40 cursor-default bg-foreground/20"
          />
          <div className="absolute inset-x-0 top-full z-50 border-b bg-card shadow-lg">
            <div className="mx-auto flex max-w-6xl flex-col px-4">
              <Link href="/directory" onClick={close} className={linkClass}>
                Directory
              </Link>
              <Link href="/profile" onClick={close} className={linkClass}>
                My profile
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={close}
                  className="border-b border-border py-3 font-medium text-amber-700 dark:text-amber-400"
                >
                  Admin
                </Link>
              )}
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="truncate text-sm text-muted-foreground">{userName}</span>
                <LogoutButton variant="outline" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
