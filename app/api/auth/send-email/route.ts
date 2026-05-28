import { Resend } from 'resend'
import { createHmac, randomUUID, timingSafeEqual } from 'crypto'
import { renderEmail, type EmailActionType } from '@/lib/email-templates'

// Supabase Auth "Send Email Hook" endpoint. Once configured in
// Project Settings → Authentication → Hooks, Supabase calls THIS instead of
// sending mail itself. We render the template in code and send via Resend
// with a per-message X-Entity-Ref-ID header to defeat Gmail threading.

type HookPayload = {
  user: { id: string; email: string }
  email_data: {
    token: string
    token_hash: string
    redirect_to: string
    email_action_type: EmailActionType
    site_url: string
    token_new?: string
    token_hash_new?: string
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text()

  // Standard Webhooks signature verification.
  const secret = process.env.SUPABASE_AUTH_HOOK_SECRET
  if (!secret) {
    console.error('[send-email] SUPABASE_AUTH_HOOK_SECRET not set')
    return Response.json({ error: 'server misconfigured' }, { status: 500 })
  }

  const id = req.headers.get('webhook-id') ?? ''
  const timestamp = req.headers.get('webhook-timestamp') ?? ''
  const signatureHeader = req.headers.get('webhook-signature') ?? ''
  if (!id || !timestamp || !signatureHeader) {
    return Response.json({ error: 'missing webhook headers' }, { status: 401 })
  }

  // Secret format: `v1,whsec_<base64>`. Strip the prefix; decode the rest.
  const cleanSecret = secret.replace(/^v1,whsec_/, '')
  const keyBytes = Buffer.from(cleanSecret, 'base64')

  const expectedB64 = createHmac('sha256', keyBytes)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest('base64')
  const expected = Buffer.from(expectedB64)

  // Header may contain multiple space-separated `v1,<sig>` versions; accept any match.
  const candidates = signatureHeader
    .split(' ')
    .map((s) => s.trim())
    .filter((s) => s.startsWith('v1,'))
    .map((s) => Buffer.from(s.slice(3)))

  const ok = candidates.some(
    (provided) => provided.length === expected.length && timingSafeEqual(provided, expected),
  )
  if (!ok) {
    return Response.json({ error: 'invalid signature' }, { status: 401 })
  }

  let payload: HookPayload
  try {
    payload = JSON.parse(rawBody) as HookPayload
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }

  const { user, email_data } = payload
  const action = email_data.email_action_type

  // Confirmation URL.
  //
  // For signup / magic-link / recovery we point at OUR OWN /api/auth/confirm
  // route, which verifies the token_hash server-side (see that file for why).
  // This deliberately does NOT use Supabase's /auth/v1/verify + redirect_to,
  // because redirect_to is validated against the project's Redirect-URL
  // allowlist and silently collapses to the Site URL root when it doesn't
  // match — which is what was breaking signup-profile creation and password
  // resets (links landed on the homepage instead of the right page).
  //
  // email_data.site_url is the app's configured Site URL (e.g.
  // https://harvardafricans.com), so the link stays on the app domain.
  let confirmationUrl: string
  if (action === 'signup' || action === 'magiclink' || action === 'recovery') {
    const appBase = (email_data.site_url || '').replace(/\/+$/, '')
    confirmationUrl =
      `${appBase}/api/auth/confirm` +
      `?token_hash=${encodeURIComponent(email_data.token_hash)}` +
      `&type=${encodeURIComponent(action)}`
  } else {
    // Other actions (invite, email change) still use Supabase's verify endpoint.
    // IMPORTANT: that endpoint lives on the Supabase project (supabase.co), NOT
    // the app domain — use NEXT_PUBLIC_SUPABASE_URL, never site_url, as the base.
    const supabaseProjectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    confirmationUrl =
      `${supabaseProjectUrl}/auth/v1/verify` +
      `?token=${encodeURIComponent(email_data.token_hash)}` +
      `&type=${encodeURIComponent(action)}` +
      `&redirect_to=${encodeURIComponent(email_data.redirect_to)}`
  }

  const { subject, html } = renderEmail(action, {
    email: user.email,
    confirmationUrl,
    token: email_data.token,
    tokenHash: email_data.token_hash,
  })

  const resend = new Resend(process.env.RESEND_API_KEY!)
  const from = process.env.EMAIL_FROM
  if (!from) {
    console.error('[send-email] EMAIL_FROM not set')
    return Response.json({ error: 'server misconfigured' }, { status: 500 })
  }

  try {
    const result = await resend.emails.send({
      from,
      to: user.email,
      replyTo: process.env.EMAIL_REPLY_TO,
      subject,
      html,
      headers: {
        // The actual anti-threading signal Gmail respects.
        'X-Entity-Ref-ID': randomUUID(),
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
      },
    })
    if (result.error) {
      console.error('[send-email] Resend rejected:', result.error)
      return Response.json({ error: 'send failed' }, { status: 502 })
    }
    return Response.json({ ok: true })
  } catch (err) {
    console.error('[send-email] threw:', err)
    return Response.json({ error: 'send threw' }, { status: 502 })
  }
}
