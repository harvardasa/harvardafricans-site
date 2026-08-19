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

// Whether a member has actually filled in who they are.
//
// /api/auth/account-setup creates a PARTIAL profile row at the password step,
// stubbing these three columns with empty strings for the onboarding wizard to
// fill in later. They are NOT NULL in the 0001 schema, so the sentinel to test
// for is '', not null.
//
// Every gate that wants to know "has this person finished signing up" must ask
// this, not "does a profiles row exist". Asking the latter is what silently
// skipped onboarding for every password-flow signup: the partial row already
// existed, so the wizard's own entry guard turned them away.
export function isProfileComplete(
  profile: Pick<ProfileLayout, 'first_name' | 'last_name' | 'country_of_origin'> | null,
): boolean {
  if (!profile) return false
  return Boolean(
    profile.first_name?.trim() && profile.last_name?.trim() && profile.country_of_origin?.trim(),
  )
}

// Shape used by app/(app)/layout.tsx for the nav bar and its completeness gate.
export type ProfileLayout = {
  first_name: string
  last_name: string
  country_of_origin: string
  role: 'member' | 'admin'
  approval_status: 'pending' | 'approved' | 'rejected'
}

export async function getProfileLayout(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileLayout | null> {
  const { data } = await supabase
    .from('profiles')
    .select('first_name, last_name, country_of_origin, role, approval_status')
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
