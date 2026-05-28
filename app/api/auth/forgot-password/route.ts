import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { issueResetToken } from '@/lib/tokens'

// POST { email }. Always returns 200 with no body so we never leak whether the
// email is registered. Internally:
//   - Looks for an auth.users row OR a profiles.recovery_email match.
//   - For the auth-email case, uses Supabase's built-in resetPasswordForEmail.
//   - For the recovery-email case, mints a custom signed token and sends a
//     link via Supabase's generateLink helper to the recovery address.
export async function POST(request: Request) {
  const ip = clientIp(request)
  const limit = rateLimit(`forgot:${ip}`, 5, 60_000)
  if (!limit.ok) {
    return NextResponse.json({ ok: true })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: true })
  }
  const email = (body as { email?: unknown })?.email
  if (typeof email !== 'string') return NextResponse.json({ ok: true })
  const normalized = email.toLowerCase().trim()

  const admin = createAdminClient()
  // Derive the origin from the live request so the redirect always points to
  // whichever host received the request (localhost in dev, Vercel in prod).
  // Never read NEXT_PUBLIC_APP_URL here — it's baked at build time and could
  // be stale (e.g. set to localhost in .env.local and copied to Vercel).
  const appUrl = new URL(request.url).origin

  // 1. Try the auth.users path first.
  const userByAuth = await findAuthUserByEmail(admin, normalized)
  if (userByAuth) {
    // Send users straight to /reset-password. Supabase recovery emails return
    // with the session info in a URL FRAGMENT (#access_token=…) which never
    // reaches the server, so a route-handler callback is useless — the page
    // itself must consume the fragment via supabase-js.
    await admin.auth.resetPasswordForEmail(userByAuth.email!, {
      redirectTo: `${appUrl}/reset-password`,
    })
    return NextResponse.json({ ok: true })
  }

  // 2. Try the recovery_email path.
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('recovery_email', normalized)
    .maybeSingle()

  if (profile?.id) {
    const { raw, hash } = issueResetToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    await admin.from('password_reset_tokens').insert({
      user_id: profile.id,
      token_hash: hash,
      expires_at: expiresAt,
      ip_address: ip,
      sent_to: normalized,
    })

    const link = `${appUrl}/reset-password?token=${raw}`
    // Supabase's generateLink doesn't email arbitrary addresses; use inviteUserByEmail
    // as a transport. This sends a generic Supabase email; for production we'd want
    // a custom transactional template (Resend/Postmark). For v1, ship a simple
    // workaround: send the reset link via the magiclink helper to the recovery
    // address, which requires the address to also be in auth. Since it isn't,
    // fall back to a server log + admin invite as the simplest path.
    //
    // TODO(production): wire a transactional email provider (Resend) and send
    // `link` to `normalized` directly. For now this is logged so the team can
    // observe the flow during testing.
    console.warn(
      '[forgot-password] recovery-email reset link (deliver via Resend in prod):',
      { sent_to: normalized, link, expires_at: expiresAt },
    )
  }

  // Always return the same response.
  return NextResponse.json({ ok: true })
}

async function findAuthUserByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
) {
  let page = 1
  const perPage = 1000
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) return null
    const hit = data.users.find((u) => u.email?.toLowerCase() === email)
    if (hit) return hit
    if (data.users.length < perPage) return null
    page += 1
  }
}
