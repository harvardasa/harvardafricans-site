'use server'

import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateBackupCodes } from '@/lib/mfa-backup'
import { Resend } from 'resend'
import { shell } from '@/lib/email-templates/_shared'

// Called from /account/security after TOTP enrollment verifies. Wipes any
// prior backup codes for this user, mints N fresh ones, stores hashes,
// emails them to the user's recovery_email, and returns the plaintext list
// so the UI can show it once.
export async function generateAndEmailBackupCodes(): Promise<
  { ok: true; codes: string[] } | { ok: false; error: string }
> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const admin = createAdminClient()

  // Look up recovery_email (where the codes get emailed).
  const { data: profile } = await admin
    .from('profiles')
    .select('recovery_email')
    .eq('id', user.id)
    .maybeSingle()
  const recoveryEmail = profile?.recovery_email

  // Mint codes.
  const { plaintext, hashes } = generateBackupCodes()

  // Replace any prior codes (idempotent regeneration).
  await admin.from('mfa_backup_codes').delete().eq('user_id', user.id)
  const { error: insertError } = await admin.from('mfa_backup_codes').insert(
    hashes.map((h) => ({ user_id: user.id, code_hash: h })),
  )
  if (insertError) return { ok: false, error: insertError.message }

  // Email if we have a destination + a Resend key configured. Failure to email
  // is non-fatal — the user still sees the codes on screen.
  if (recoveryEmail && process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const html = shell({
        heading: 'Your HASA admin backup codes',
        body: `<p style="margin:0 0 12px;">
          Keep these somewhere safe. Each one lets you sign in once if you ever
          lose access to your authenticator app.
        </p>
        <pre style="background:#f3f4f6;padding:12px;border-radius:6px;font-family:monospace;font-size:14px;line-height:1.6;">${plaintext.join('\n')}</pre>
        <p style="margin:12px 0 0;color:#6b7280;font-size:13px;">
          Codes are one-time use. After you use one, it cannot be used again.
          Treat the list like a password. Anyone who has these can bypass two-factor.
        </p>`,
        buttonLabel: 'Open HASA admin',
        buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://harvardafricans.com'}/admin`,
        token: 'backup-codes',
      })
      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: recoveryEmail,
        subject: 'HASA admin: your two-factor backup codes',
        html,
      })
    } catch {
      // Non-fatal — UI still shows the codes
    }
  }

  return { ok: true, codes: plaintext }
}

// Called from the login flow's MFA prompt when the user types a backup code
// instead of a TOTP code. Marks the code used and elevates the session to
// aal2 by way of the admin API. Returns whether the code was valid.
export async function consumeBackupCode(
  rawCode: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { hashCode } = await import('@/lib/mfa-backup')
  const hash = hashCode(rawCode)

  const admin = createAdminClient()
  const { data: row } = await admin
    .from('mfa_backup_codes')
    .select('id, used_at')
    .eq('user_id', user.id)
    .eq('code_hash', hash)
    .maybeSingle()

  if (!row || row.used_at) {
    return { ok: false, error: "That code didn't match or has already been used." }
  }

  await admin
    .from('mfa_backup_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('id', row.id)

  // A backup code can't elevate the session to aal2 — that requires the user's
  // TOTP challenge, which is exactly what they've lost. So instead of leaving
  // them stuck at aal1 in front of an aal2 gate, we treat a backup code as what
  // it's for: "I lost my device." Retiring the factor drops nextLevel back to
  // aal1, so the gate in lib/auth/admin.ts passes honestly rather than via a
  // bypass, and the caller sends them to /account/security to re-enroll.
  const { data: factorList } = await admin.auth.admin.mfa.listFactors({ userId: user.id })
  for (const factor of factorList?.factors ?? []) {
    await admin.auth.admin.mfa.deleteFactor({ id: factor.id, userId: user.id })
  }

  // Remaining codes are meaningless once the factor is gone, and leaving them
  // would let an old code apply against a freshly enrolled factor.
  // generateAndEmailBackupCodes mints a clean set on re-enrollment.
  await admin.from('mfa_backup_codes').delete().eq('user_id', user.id)

  return { ok: true }
}

// /account/security calls this to show "X codes remaining" without exposing
// the codes themselves.
export async function getBackupCodeStatus(): Promise<{
  total: number
  unused: number
}> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { total: 0, unused: 0 }
  const admin = createAdminClient()
  const { data } = await admin
    .from('mfa_backup_codes')
    .select('used_at')
    .eq('user_id', user.id)
  const rows = data ?? []
  return {
    total: rows.length,
    unused: rows.filter((r) => !r.used_at).length,
  }
}
