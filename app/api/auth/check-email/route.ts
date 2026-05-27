import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { clientIp, rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = clientIp(request)
  const limit = rateLimit(`check-email:${ip}`, 10, 60_000)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Try again in a minute.' },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = (body as { email?: unknown })?.email
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const normalized = email.toLowerCase().trim()
  const admin = createAdminClient()

  // Paginated lookup against auth.users — listUsers is the only supported
  // way to find an auth user by email without a filter param. For HASA's size
  // this is fine; revisit if the user base passes ~10k.
  let page = 1
  const perPage = 1000
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) {
      console.error('[check-email] listUsers failed:', error)
      return NextResponse.json({ error: 'Lookup failed', detail: error.message }, { status: 500 })
    }
    const found = data.users.some((u) => u.email?.toLowerCase() === normalized)
    if (found) return NextResponse.json({ exists: true })
    if (data.users.length < perPage) break
    page += 1
  }

  return NextResponse.json({ exists: false })
}
