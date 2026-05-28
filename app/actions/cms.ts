'use server'

import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/admin'
import { logCmsAction } from '@/lib/audit'

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
  const { user } = await requireAdmin()
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
    await logCmsAction(admin, { adminId: user.id, entityType: 'event', entityId: input.id, action: 'update', diff: row })
  } else {
    const { error } = await admin.from('events').insert(row)
    if (error) return { error: error.message }
    await logCmsAction(admin, { adminId: user.id, entityType: 'event', entityId: input.slug, action: 'create', diff: row })
  }

  revalidatePath('/admin/events')
  revalidatePath('/events')
  revalidatePath('/')
  return { ok: true }
}

export async function deleteEvent(id: string) {
  const { user } = await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('events').delete().eq('id', id)
  if (error) return { error: error.message }
  await logCmsAction(admin, { adminId: user.id, entityType: 'event', entityId: id, action: 'delete' })
  revalidatePath('/admin/events')
  revalidatePath('/events')
  revalidatePath('/')
  return { ok: true }
}

export async function bulkImportEvents() {
  const { user } = await requireAdmin()
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
  await logCmsAction(admin, { adminId: user.id, entityType: 'event', entityId: 'bulk', action: 'bulk_import', diff: { count: rows.length } })
  revalidatePath('/admin/events')
  revalidatePath('/events')
  return { ok: true, imported: rows.length }
}

// ─── Site content ───────────────────────────────────────────────────────────

export async function updateSiteContent(key: string, value: string | string[]) {
  const { user } = await requireAdmin()
  const admin = createAdminClient()
  const row: { id: string; body: string | null; metadata: Record<string, unknown> } =
    typeof value === 'string'
      ? { id: key, body: value, metadata: {} }
      : { id: key, body: null, metadata: { value } }
  const { error } = await admin
    .from('site_content')
    .upsert(row as never, { onConflict: 'id' })
  if (error) return { error: error.message }
  await logCmsAction(admin, { adminId: user.id, entityType: 'site_content', entityId: key, action: 'update', diff: row })
  revalidatePath('/admin/site-content')
  revalidatePath('/story')
  revalidatePath('/events')
  revalidatePath('/gallery')
  return { ok: true }
}

// ─── Board members ──────────────────────────────────────────────────────────

export type LeaderInput = {
  id?: string
  name: string
  role: string
  bio?: string | null
  photo_url?: string | null
  linkedin_url?: string | null
  email?: string | null
  display_order?: number
  is_active?: boolean
  academic_year?: string | null
}

export async function upsertLeader(input: LeaderInput) {
  const { user } = await requireAdmin()
  const admin = createAdminClient()
  const row = {
    name: input.name,
    role: input.role,
    bio: input.bio ?? null,
    photo_url: input.photo_url ?? null,
    linkedin_url: input.linkedin_url ?? null,
    email: input.email ?? null,
    display_order: input.display_order ?? 0,
    is_active: input.is_active ?? true,
    academic_year: input.academic_year ?? null,
  }
  if (input.id) {
    const { error } = await admin.from('board_members').update(row).eq('id', input.id)
    if (error) return { error: error.message }
    await logCmsAction(admin, { adminId: user.id, entityType: 'leader', entityId: input.id, action: 'update', diff: row })
  } else {
    const { error } = await admin.from('board_members').insert(row)
    if (error) return { error: error.message }
    await logCmsAction(admin, { adminId: user.id, entityType: 'leader', entityId: input.name, action: 'create', diff: row })
  }
  revalidatePath('/admin/leadership')
  revalidatePath('/leadership')
  return { ok: true }
}

export async function deleteLeader(id: string) {
  const { user } = await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('board_members').delete().eq('id', id)
  if (error) return { error: error.message }
  await logCmsAction(admin, { adminId: user.id, entityType: 'leader', entityId: id, action: 'delete' })
  revalidatePath('/admin/leadership')
  revalidatePath('/leadership')
  return { ok: true }
}

export async function bulkImportLeaders() {
  const { user } = await requireAdmin()
  const admin = createAdminClient()
  const { count } = await admin.from('board_members').select('id', { count: 'exact', head: true })
  if ((count ?? 0) > 0) {
    return { error: 'board_members table is not empty.' }
  }
  const file = path.join(process.cwd(), 'content', 'leaders.json')
  const raw = await fs.readFile(file, 'utf8')
  const json: Array<Record<string, unknown>> = JSON.parse(raw)
  const rows = json.map((l, i) => ({
    name: String(l.name ?? ''),
    role: String(l.role ?? ''),
    bio: (l.bio ?? l.blurb ?? null) as string | null,
    photo_url: (l.photo ?? l.image ?? null) as string | null,
    linkedin_url: ((l.social as { linkedin?: string } | undefined)?.linkedin ?? l.linkedin ?? null) as string | null,
    email: (l.email ?? null) as string | null,
    display_order: i,
    is_active: true,
    academic_year: (l.academicYear ?? null) as string | null,
  }))
  const { error } = await admin.from('board_members').insert(rows)
  if (error) return { error: error.message }
  await logCmsAction(admin, { adminId: user.id, entityType: 'leader', entityId: 'bulk', action: 'bulk_import', diff: { count: rows.length } })
  revalidatePath('/admin/leadership')
  revalidatePath('/leadership')
  return { ok: true, imported: rows.length }
}

// ─── Gallery ────────────────────────────────────────────────────────────────

export type AlbumInput = {
  id?: string
  title: string
  slug: string
  description?: string | null
  cover_image_url?: string | null
  is_published?: boolean
}

export async function upsertAlbum(input: AlbumInput) {
  const { user } = await requireAdmin()
  const admin = createAdminClient()
  const row = {
    title: input.title,
    slug: input.slug,
    description: input.description ?? null,
    cover_image_url: input.cover_image_url ?? null,
    is_published: input.is_published ?? true,
  }
  if (input.id) {
    const { error } = await admin.from('gallery_albums').update(row).eq('id', input.id)
    if (error) return { error: error.message }
    await logCmsAction(admin, { adminId: user.id, entityType: 'album', entityId: input.id, action: 'update', diff: row })
  } else {
    const { error } = await admin.from('gallery_albums').insert(row)
    if (error) return { error: error.message }
    await logCmsAction(admin, { adminId: user.id, entityType: 'album', entityId: input.slug, action: 'create', diff: row })
  }
  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  return { ok: true }
}

export async function deleteAlbum(id: string) {
  const { user } = await requireAdmin()
  const admin = createAdminClient()
  // gallery_images has ON DELETE CASCADE so images go with the album
  const { error } = await admin.from('gallery_albums').delete().eq('id', id)
  if (error) return { error: error.message }
  await logCmsAction(admin, { adminId: user.id, entityType: 'album', entityId: id, action: 'delete' })
  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  return { ok: true }
}

export async function addGalleryImage(input: {
  album_id: string
  image_url: string
  caption?: string | null
  alt_text?: string | null
}) {
  const { user } = await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('gallery_images').insert({
    album_id: input.album_id,
    image_url: input.image_url,
    caption: input.caption ?? null,
    alt_text: input.alt_text ?? null,
    display_order: 0,
  })
  if (error) return { error: error.message }
  await logCmsAction(admin, { adminId: user.id, entityType: 'gallery_image', entityId: input.album_id, action: 'create', diff: { image_url: input.image_url } })
  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  return { ok: true }
}

export async function deleteGalleryImage(id: string) {
  const { user } = await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('gallery_images').delete().eq('id', id)
  if (error) return { error: error.message }
  await logCmsAction(admin, { adminId: user.id, entityType: 'gallery_image', entityId: id, action: 'delete' })
  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  return { ok: true }
}

export async function bulkImportSiteContent() {
  const { user } = await requireAdmin()
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
  await logCmsAction(admin, { adminId: user.id, entityType: 'site_content', entityId: 'bulk', action: 'bulk_import', diff: { count: rows.length } })
  revalidatePath('/admin/site-content')
  return { ok: true, imported: rows.length }
}
