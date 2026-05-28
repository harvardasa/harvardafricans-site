'use server'

import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/admin'

// ─── Events ─────────────────────────────────────────────────────────────────

export type EventInput = {
  slug: string
  title: string
  description?: string | null
  starts_at: string                 // ISO timestamp
  ends_at?: string | null
  location?: string | null
  cover_image_url?: string | null
  rsvp_url?: string | null
  is_published?: boolean
  status?: 'upcoming' | 'past' | 'cancelled'
}

export async function upsertEvent(input: EventInput & { id?: string }) {
  await requireAdmin()
  const admin = createAdminClient()

  const row = {
    slug: input.slug,
    title: input.title,
    description: input.description ?? null,
    starts_at: input.starts_at,
    ends_at: input.ends_at ?? null,
    location: input.location ?? null,
    cover_image_url: input.cover_image_url ?? null,
    rsvp_url: input.rsvp_url ?? null,
    is_published: input.is_published ?? true,
    status: input.status ?? 'upcoming',
  }

  if (input.id) {
    const { error } = await admin.from('events').update(row).eq('id', input.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await admin.from('events').insert(row)
    if (error) return { error: error.message }
  }

  revalidatePath('/admin/events')
  revalidatePath('/events')
  revalidatePath('/')
  return { ok: true }
}

export async function deleteEvent(id: string) {
  await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('events').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/events')
  revalidatePath('/events')
  revalidatePath('/')
  return { ok: true }
}

export async function bulkImportEvents() {
  await requireAdmin()
  const admin = createAdminClient()

  // Don't double-import: only proceed if events table is empty
  const { count } = await admin.from('events').select('id', { count: 'exact', head: true })
  if ((count ?? 0) > 0) {
    return { error: 'Events table is not empty. Delete existing rows first if you want to re-import.' }
  }

  const file = path.join(process.cwd(), 'content', 'events.json')
  const raw = await fs.readFile(file, 'utf8')
  const json: Array<Record<string, unknown>> = JSON.parse(raw)

  const rows = json.map((e) => ({
    slug: String(e.id),
    title: String(e.title ?? ''),
    description: (e.description ?? e.summary ?? null) as string | null,
    starts_at: String(e.start ?? e.date ?? new Date().toISOString()),
    ends_at: (e.end ?? null) as string | null,
    location: (e.location ?? null) as string | null,
    cover_image_url: (e.image ?? null) as string | null,
    is_published: true,
    status: (e.status === 'past' || e.category === 'past' ? 'past' : 'upcoming') as
      | 'upcoming'
      | 'past',
  }))

  const { error } = await admin.from('events').insert(rows)
  if (error) return { error: error.message }
  revalidatePath('/admin/events')
  revalidatePath('/events')
  return { ok: true, imported: rows.length }
}

// ─── Site content ───────────────────────────────────────────────────────────

export async function updateSiteContent(key: string, value: string | string[]) {
  await requireAdmin()
  const admin = createAdminClient()
  const row: { id: string; body: string | null; metadata: Record<string, unknown> } =
    typeof value === 'string'
      ? { id: key, body: value, metadata: {} }
      : { id: key, body: null, metadata: { value } }
  const { error } = await admin
    .from('site_content')
    .upsert(row as never, { onConflict: 'id' })
  if (error) return { error: error.message }
  revalidatePath('/admin/site-content')
  revalidatePath('/story')
  revalidatePath('/events')
  revalidatePath('/gallery')
  return { ok: true }
}

export async function bulkImportSiteContent() {
  await requireAdmin()
  const admin = createAdminClient()
  const { count } = await admin.from('site_content').select('id', { count: 'exact', head: true })
  if ((count ?? 0) > 0) {
    return { error: 'site_content already populated. Edit individual fields instead.' }
  }

  const file = path.join(process.cwd(), 'content', 'site-content.json')
  const raw = await fs.readFile(file, 'utf8')
  const json: Record<string, unknown> = JSON.parse(raw)

  const rows = Object.entries(json).map(([id, value]) =>
    Array.isArray(value)
      ? { id, body: null, metadata: { value } }
      : { id, body: String(value), metadata: {} },
  )

  const { error } = await admin.from('site_content').insert(rows)
  if (error) return { error: error.message }
  revalidatePath('/admin/site-content')
  return { ok: true, imported: rows.length }
}
