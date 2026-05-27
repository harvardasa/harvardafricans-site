'use server'

import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function requireAdmin() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (me?.role !== 'admin') redirect('/directory')
  return { user, adminClient: createAdminClient() }
}

export async function approveProfile(profileId: string) {
  const { user, adminClient } = await requireAdmin()
  const { error } = await adminClient
    .from('profiles')
    .update({ approval_status: 'approved' })
    .eq('id', profileId)
  if (error) return { error: error.message }

  await adminClient.from('admin_actions').insert({
    admin_id: user.id,
    target_id: profileId,
    action: 'approve',
    note: null,
  })
  revalidatePath('/admin')
}

export async function rejectProfile(profileId: string, note?: string) {
  const { user, adminClient } = await requireAdmin()
  const { error } = await adminClient
    .from('profiles')
    .update({ approval_status: 'rejected' })
    .eq('id', profileId)
  if (error) return { error: error.message }

  await adminClient.from('admin_actions').insert({
    admin_id: user.id,
    target_id: profileId,
    action: 'reject',
    note: note ?? null,
  })
  revalidatePath('/admin')
}

export async function promoteToAdmin(profileId: string) {
  const { user, adminClient } = await requireAdmin()
  const { error } = await adminClient
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', profileId)
  if (error) return { error: error.message }

  await adminClient.from('admin_actions').insert({
    admin_id: user.id,
    target_id: profileId,
    action: 'promote',
    note: null,
  })
  revalidatePath('/admin')
}

export async function demoteToMember(profileId: string) {
  const { user, adminClient } = await requireAdmin()
  const { error } = await adminClient
    .from('profiles')
    .update({ role: 'member' })
    .eq('id', profileId)
  if (error) return { error: error.message }

  await adminClient.from('admin_actions').insert({
    admin_id: user.id,
    target_id: profileId,
    action: 'demote',
    note: null,
  })
  revalidatePath('/admin')
}

export async function deleteMember(profileId: string) {
  const { user, adminClient } = await requireAdmin()

  // Log first because deleting the auth user cascades to profiles (and would
  // make the foreign key fail otherwise)
  await adminClient.from('admin_actions').insert({
    admin_id: user.id,
    target_id: profileId,
    action: 'delete',
    note: null,
  })

  // Delete the auth user — cascades to profiles via ON DELETE CASCADE
  const { error } = await adminClient.auth.admin.deleteUser(profileId)
  if (error) return { error: error.message }

  revalidatePath('/admin')
}
