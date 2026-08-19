'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Shared TOTP / backup-code prompt. Used by /login (after a password sign-in
// when the account has a verified factor) and by /account/verify-2fa (when the
// admin gate finds a session still at aal1).
//
// Verification has to happen client-side: supabase.auth.mfa.verify() writes the
// elevated aal2 session back to cookies, which is what the server-side gate in
// lib/auth/admin.ts then reads.

export type MfaOutcome =
  | { via: 'totp' }
  // A backup code retires the TOTP factor, so the caller should send the user
  // somewhere they can re-enroll rather than on to their original destination.
  | { via: 'backup-code' }

export default function MfaChallenge({
  factorId,
  challengeId,
  onVerified,
}: {
  factorId: string
  challengeId: string
  onVerified: (outcome: MfaOutcome) => void | Promise<void>
}) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const submit = async () => {
    setBusy(true)
    setErrorMsg(null)

    // A 6-digit numeric input is a TOTP code; anything else is treated as a
    // backup code.
    const isTotp = /^\d{6}$/.test(code)

    if (isTotp) {
      const supabase = createClient()
      const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code })
      if (error) {
        setBusy(false)
        setErrorMsg(
          "Code didn't match. Codes refresh every 30 seconds, so try a fresh one, or paste a backup code.",
        )
        return
      }
      await onVerified({ via: 'totp' })
      return
    }

    const { consumeBackupCode } = await import('@/app/actions/mfa')
    const result = await consumeBackupCode(code)
    if (!result.ok) {
      setBusy(false)
      setErrorMsg(result.error)
      return
    }
    await onVerified({ via: 'backup-code' })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground">
        Enter the 6-digit code from your authenticator app, or paste a backup code if you
        lost access.
      </p>
      <div className="space-y-2">
        <Label htmlFor="mfa">Code or backup code</Label>
        <Input
          id="mfa"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 12))}
          placeholder="123456  or  ABCD-EFGH-IJ"
          autoComplete="one-time-code"
          className="font-mono text-lg tracking-widest text-center"
          disabled={busy}
        />
      </div>
      {errorMsg && (
        <div className="rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3 text-sm text-red-700 dark:text-red-300">
          {errorMsg}
        </div>
      )}
      <Button type="button" onClick={submit} disabled={busy || code.length < 6}>
        {busy ? 'Verifying…' : 'Verify and continue'}
      </Button>
    </div>
  )
}
