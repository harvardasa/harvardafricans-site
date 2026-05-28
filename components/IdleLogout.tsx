'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

// Mount this once inside (app)/layout.tsx so it runs on every authenticated
// page. Listens for mouse, keyboard, touch, and scroll activity; after the
// idle window with no activity, signs the user out and hard-navigates to
// /login. A hard navigation (not router.push) guarantees server components
// on /login re-evaluate session state with the now-cleared cookies.
//
// This is defense in depth. Supabase JWTs also expire on their own (set the
// access-token TTL in Supabase Dashboard → Authentication → Settings) — once
// expired, the next request fails and the proxy bounces to /login. This
// component fires earlier and more predictably for an active tab that's been
// left open.
const IDLE_MS = 20 * 60 * 1000 // 20 minutes
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'] as const

export default function IdleLogout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const signingOutRef = useRef(false)

  useEffect(() => {
    const supabase = createClient()

    const doSignOut = async () => {
      if (signingOutRef.current) return
      signingOutRef.current = true
      try {
        await supabase.auth.signOut()
      } catch {
        // ignore — we're navigating away regardless
      }
      window.location.href = '/login?idle=1'
    }

    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(doSignOut, IDLE_MS)
    }

    reset()
    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, reset, { passive: true })
    }
    document.addEventListener('visibilitychange', reset)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      for (const ev of ACTIVITY_EVENTS) {
        window.removeEventListener(ev, reset)
      }
      document.removeEventListener('visibilitychange', reset)
    }
  }, [])

  return null
}
