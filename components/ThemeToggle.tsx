'use client'

import { Moon, Sun } from 'lucide-react'

// Dark-mode switch. Deliberately has no React state for the icon: the two
// glyphs are shown/hidden by the `dark:` variant, which keys off the `.dark`
// class on <html>. That class is set by the inline script in app/layout.tsx
// before first paint, so the server and client markup are identical and there
// is no hydration mismatch and no wrong-icon flash on load.
export const THEME_STORAGE_KEY = 'hasa-theme'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement
    const next = !root.classList.contains('dark')
    root.classList.toggle('dark', next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light')
    } catch {
      // Private browsing / storage disabled. The toggle still works for this
      // page view, it just won't be remembered.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className={`inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none ${className}`}
    >
      <Sun size={18} className="dark:hidden" />
      <Moon size={18} className="hidden dark:block" />
    </button>
  )
}
