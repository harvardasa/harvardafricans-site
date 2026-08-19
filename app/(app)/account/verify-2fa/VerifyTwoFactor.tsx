'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import MfaChallenge, { type MfaOutcome } from '@/components/MfaChallenge'

// Raises a fresh TOTP challenge on mount. Unlike /login — where the challenge
// is created as part of the sign-in flow — a user lands here mid-session after
// the admin gate bounced them, so there's no challenge in flight yet.
export default function VerifyTwoFactor({ next }: { next: string }) {
  const [factorId, setFactorId] = useState<string | null>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const start = async () => {
      const supabase = createClient()
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors()
      if (listError) {
        if (!cancelled) setError(listError.message)
        return
      }

      const totp = (factors?.totp ?? []).find((f) => f.status === 'verified')
      if (!totp) {
        // No verified factor: nothing to challenge, and the gate would now let
        // them through. Send them on rather than stranding them here.
        window.location.href = next
        return
      }

      const challenge = await supabase.auth.mfa.challenge({ factorId: totp.id })
      if (challenge.error) {
        if (!cancelled) setError(challenge.error.message)
        return
      }
      if (cancelled) return
      setFactorId(totp.id)
      setChallengeId(challenge.data.id)
    }

    void start()
    return () => {
      cancelled = true
    }
  }, [next])

  const onVerified = async (outcome: MfaOutcome) => {
    // A backup code deletes the TOTP factor, so route to the security page to
    // re-enroll instead of on to the admin area.
    window.location.href = outcome.via === 'backup-code' ? '/account/security' : next
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3 text-sm text-red-700 dark:text-red-300">
        {error}
      </div>
    )
  }

  if (!factorId || !challengeId) {
    return <p className="text-sm text-muted-foreground">Preparing your two-factor challenge…</p>
  }

  return <MfaChallenge factorId={factorId} challengeId={challengeId} onVerified={onVerified} />
}
