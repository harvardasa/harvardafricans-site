// Audit log writer for CMS actions. The cms_actions table was created in
// migration 0008 but went unused until now. Every successful mutation in
// app/actions/cms.ts calls logCmsAction so /admin can answer "who edited
// what, when" later.

import type { SupabaseClient } from '@supabase/supabase-js'

type EntityType =
  | 'event'
  | 'album'
  | 'gallery_image'
  | 'leader'
  | 'site_content'

type ActionType = 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'bulk_import'

export async function logCmsAction(
  admin: SupabaseClient,
  params: {
    adminId: string
    entityType: EntityType
    entityId: string
    action: ActionType
    diff?: Record<string, unknown> | null
  },
): Promise<void> {
  try {
    await admin.from('cms_actions').insert({
      admin_id: params.adminId,
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: params.action,
      diff: params.diff ?? null,
    })
  } catch {
    // Audit writes never block the actual mutation. If logging fails (network
    // hiccup, RLS misconfig), we swallow so the user-visible action succeeds.
  }
}
