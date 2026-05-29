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

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="-mr-2 p-2 text-gray-700"
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
            className="fixed inset-0 z-40 cursor-default bg-black/20"
          />
          <div className="absolute inset-x-0 top-full z-50 border-b bg-white shadow-lg">
            <div className="mx-auto flex max-w-6xl flex-col px-4">
              <Link
                href="/directory"
                onClick={close}
                className="border-b border-gray-100 py-3 text-gray-800"
              >
                Directory
              </Link>
              <Link
                href="/profile"
                onClick={close}
                className="border-b border-gray-100 py-3 text-gray-800"
              >
                My profile
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={close}
                  className="border-b border-gray-100 py-3 font-medium text-amber-700"
                >
                  Admin
                </Link>
              )}
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="truncate text-sm text-gray-500">{userName}</span>
                <LogoutButton variant="outline" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
