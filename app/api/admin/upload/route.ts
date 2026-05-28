import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/admin'
import { randomUUID } from 'crypto'

const ALLOWED_BUCKETS = ['events-images', 'leader-photos', 'gallery-images'] as const
type AllowedBucket = (typeof ALLOWED_BUCKETS)[number]

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

// POST multipart/form-data with fields:
//   file:   the image
//   bucket: one of events-images | leader-photos | gallery-images
// Returns: { url: <public-url>, path: <storage-path> }
export async function POST(request: Request) {
  await requireAdmin()

  const form = await request.formData()
  const file = form.get('file')
  const bucket = form.get('bucket')

  if (typeof bucket !== 'string' || !ALLOWED_BUCKETS.includes(bucket as AllowedBucket)) {
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 })
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}` },
      { status: 415 },
    )
  }

  // Random filename keeps uploads idempotent and avoids collisions / overwrites.
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const path = `${randomUUID()}.${ext}`

  const admin = createAdminClient()
  const buf = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(path, buf, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = admin.storage.from(bucket).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl, path })
}
