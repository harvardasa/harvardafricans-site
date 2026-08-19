import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

// Member-facing avatar upload. The sibling of app/api/admin/upload/route.ts,
// which is admin-only and therefore no use to an ordinary member wanting a
// profile picture.
//
// The security shape that matters: the bucket is fixed here rather than read
// from the request, and the row written is always the CALLER'S OWN, taken from
// the session. The client never sends a user id, so there is no id for anyone
// to tamper with and no way to overwrite another member's photo.
const BUCKET = 'member-avatars'
const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

// Turns a stored public URL back into the storage path so the old file can be
// removed. Returns null for anything that is not one of our own bucket URLs,
// so a hand-edited avatar_url pointing elsewhere can never make us issue a
// delete against something we do not own.
function storagePathFromPublicUrl(url: string | null): string | null {
  if (!url) return null
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const at = url.indexOf(marker)
  if (at === -1) return null
  const path = url.slice(at + marker.length).split('?')[0]
  return path || null
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Check the declared size BEFORE touching the body. Parsing a multipart body
  // buffers the whole thing, and an oversized one throws inside formData(),
  // which surfaces to the member as an opaque 500 rather than "too large".
  // Reading the header first also means we never hold a rejected upload in
  // memory at all.
  const declared = Number(request.headers.get('content-length') ?? 0)
  if (declared > MAX_BYTES) {
    return NextResponse.json({ error: 'That image is too large (max 10MB).' }, { status: 413 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    // Malformed body, or one larger than the platform will parse despite the
    // header. Either way it is the request at fault, not the server.
    return NextResponse.json(
      { error: 'That image could not be read. Try a different file.' },
      { status: 400 },
    )
  }
  const file = form.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  // Belt and braces: content-length can lie or be absent on a chunked upload.
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'That image is too large (max 10MB).' }, { status: 413 })
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: 'Use a JPEG, PNG or WebP image.' },
      { status: 415 },
    )
  }

  const admin = createAdminClient()

  // Remember the current file so it can be cleaned up after the new one lands.
  const { data: existing } = await admin
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .maybeSingle()
  const previousPath = storagePathFromPublicUrl(existing?.avatar_url ?? null)

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${randomUUID()}.${ext}`

  const buf = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, buf, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  })
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path)

  const { error: updateError } = await admin
    .from('profiles')
    .update({ avatar_url: pub.publicUrl })
    .eq('id', user.id)
  if (updateError) {
    // Roll the upload back so a failed write does not strand an orphan file.
    await admin.storage.from(BUCKET).remove([path])
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Only now is the old file safe to drop. Deliberately after the row update:
  // if this fails we leak one file, whereas deleting first would risk leaving
  // a member with a broken image.
  if (previousPath && previousPath !== path) {
    await admin.storage.from(BUCKET).remove([previousPath])
  }

  return NextResponse.json({ avatar_url: pub.publicUrl })
}

export async function DELETE() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const { error } = await admin
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', user.id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const path = storagePathFromPublicUrl(existing?.avatar_url ?? null)
  if (path) {
    await admin.storage.from(BUCKET).remove([path])
  }

  return NextResponse.json({ avatar_url: null })
}
