// Admin auth helper. The (app)/layout.tsx already gates on approval_status,
// so by the time we hit /admin/* the user is at least an approved member.
// This adds: role='admin' check + optional ADMIN_EMAIL_ALLOWLIST defense in
// depth so a compromised member account can't reach the CMS even if its
// `profiles.role` somehow got flipped to admin.

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getProfileRole } from '@/lib/profiles'

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

// Server-side admin gate. Call at the top of every /admin/** page or layout.
// Returns the authenticated admin's { user, role } so the page can use them.
export async function requireAdmin() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = await getProfileRole(supabase, user.id)
  if (role !== 'admin') redirect('/directory')

  if (!isOnAdminAllowlist(user.email)) {
    // On allowlist mismatch we sign them out so a stale session can't keep
    // probing the admin area.
    await supabase.auth.signOut()
    redirect('/login?error=not-authorized')
  }

  return { user, role }
}
