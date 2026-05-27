// Profile query helpers. Anywhere in the app that reads/writes the `profiles`
// table for one specific user goes through here so the column lists stay
// consistent and a schema rename only touches this file.
//
// Bulk/filtered queries (the directory grid with search and pagination, the
// admin members table) intentionally stay inline at their call sites — they're
// stateful UI queries, not the same as the per-user lookups here.

import type { SupabaseClient } from '@supabase/supabase-js'

// Slim shape used by /api/auth/callback, /login, /signup/account, and the
// proxy when deciding where to send a user post-auth.
export type ProfileGating = {
  approval_status: 'pending' | 'approved' | 'rejected'
  password_set_at: string | null
}

export async function getProfileGating(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileGating | null> {
  const { data } = await supabase
    .from('profiles')
    .select('approval_status, password_set_at')
    .eq('id', userId)
    .maybeSingle()
  return data as ProfileGating | null
}

// Shape used by app/(app)/layout.tsx for the nav bar.
export type ProfileLayout = {
  first_name: string
  last_name: string
  role: 'member' | 'admin'
  approval_status: 'pending' | 'approved' | 'rejected'
}

export async function getProfileLayout(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileLayout | null> {
  const { data } = await supabase
    .from('profiles')
    .select('first_name, last_name, role, approval_status')
    .eq('id', userId)
    .maybeSingle()
  return data as ProfileLayout | null
}

// Just the role — used in admin-gate checks.
export async function getProfileRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<'member' | 'admin' | null> {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()
  return (data as { role: 'member' | 'admin' } | null)?.role ?? null
}

// Fire-and-forget; we don't block redirect on this.
export function updateLastSignIn(supabase: SupabaseClient, userId: string): void {
  void supabase
    .from('profiles')
    .update({ last_signed_in_at: new Date().toISOString() })
    .eq('id', userId)
}

// Admin-client write — used by reset-password, change-password, account-setup
// to flip the migration-gate flag.
export async function markPasswordSet(
  adminClient: SupabaseClient,
  userId: string,
): Promise<{ error: string | null }> {
  const { error } = await adminClient
    .from('profiles')
    .update({ password_set_at: new Date().toISOString() })
    .eq('id', userId)
  return { error: error?.message ?? null }
}
