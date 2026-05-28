// Detects whether a public page should include unpublished items. Only
// admins are allowed to use ?preview=1; for everyone else the param is
// silently ignored.

import { createServerClient } from '@/lib/supabase/server'
import { getProfileRole } from '@/lib/profiles'

export async function isPreviewAllowed(searchParams: { [k: string]: string | string[] | undefined }): Promise<boolean> {
  if (searchParams.preview !== '1') return false
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false
  const role = await getProfileRole(supabase, user.id)
  return role === 'admin'
}
