// Admin auth helper. The (app)/layout.tsx already gates on approval_status,
// so by the time we hit /admin/* the user is at least an approved member.
// This adds, in order:
//   1. role='admin'
//   2. optional ADMIN_EMAIL_ALLOWLIST — defense in depth so a compromised
//      member account can't reach the CMS even if `profiles.role` got flipped
//   3. aal2 (two-factor actually completed), for users who have TOTP enrolled
//
// Every admin surface goes through here — pages, server actions, and route
// handlers. Previously the check was copy-pasted in three places and only this
// copy had the allowlist, which left promote-to-admin, delete-user, and the
// member CSV export less protected than the pages they're launched from.

import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { getProfileRole } from '@/lib/profiles'

export const MFA_CHALLENGE_PATH = '/account/verify-2fa'

export function getAdminAllowlist(): string[] {
  return (process.env.ADMIN_EMAIL_ALLOWLIST ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isOnAdminAllowlist(email: string | null | undefined): boolean {
  if (!email) return false
  const allowlist = getAdminAllowlist()
  // Empty allowlist = check disabled (role='admin' alone is the gate).
  if (allowlist.length === 0) return true
  return allowlist.includes(email.toLowerCase())
}

type AdminFailure =
  | { kind: 'unauthenticated' }
  | { kind: 'not-admin' }
  | { kind: 'not-allowlisted' }
  | { kind: 'mfa-required' }

type AdminCheck =
  | { ok: true; user: User; role: 'admin' }
  | { ok: false; failure: AdminFailure }

// The single source of truth. Returns a verdict rather than acting on it, so
// pages can redirect and route handlers can return a status code.
async function checkAdmin(): Promise<AdminCheck> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, failure: { kind: 'unauthenticated' } }

  const role = await getProfileRole(supabase, user.id)
  if (role !== 'admin') return { ok: false, failure: { kind: 'not-admin' } }

  if (!isOnAdminAllowlist(user.email)) {
    // On allowlist mismatch we sign them out so a stale session can't keep
    // probing the admin area.
    await supabase.auth.signOut()
    return { ok: false, failure: { kind: 'not-allowlisted' } }
  }

  // Two-factor. `nextLevel` is 'aal2' only when the user has at least one
  // VERIFIED factor, so admins who never enrolled TOTP are unaffected: for
  // them currentLevel === nextLevel === 'aal1' and this passes. Without this
  // check the code prompt on /login was cosmetic — the session cookie is set
  // by signInWithPassword before the prompt ever renders, so navigating
  // straight to /admin skipped it entirely.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
    return { ok: false, failure: { kind: 'mfa-required' } }
  }

  return { ok: true, user, role }
}

// For pages and server actions: redirects on failure, never returns on the
// unhappy path.
export async function requireAdmin() {
  const result = await checkAdmin()
  if (result.ok) return { user: result.user, role: result.role }

  switch (result.failure.kind) {
    case 'unauthenticated':
      redirect('/login')
    case 'not-admin':
      redirect('/directory')
    case 'not-allowlisted':
      redirect('/login?error=not-authorized')
    case 'mfa-required':
      redirect(MFA_CHALLENGE_PATH)
  }
}

// For route handlers, where a 307 to an HTML page is the wrong answer to a
// fetch. Returns a response to hand straight back to the caller.
export async function requireAdminApi(): Promise<
  { ok: true; user: User; role: 'admin' } | { ok: false; response: NextResponse }
> {
  const result = await checkAdmin()
  if (result.ok) return { ok: true, user: result.user, role: result.role }

  switch (result.failure.kind) {
    case 'unauthenticated':
      return { ok: false, response: new NextResponse('Unauthorized', { status: 401 }) }
    case 'mfa-required':
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'mfa-required', challenge: MFA_CHALLENGE_PATH },
          { status: 403 },
        ),
      }
    default:
      return { ok: false, response: new NextResponse('Forbidden', { status: 403 }) }
  }
}
