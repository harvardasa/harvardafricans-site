'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import MfaChallenge, { type MfaOutcome } from '@/components/MfaChallenge'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const resetParam = searchParams.get('reset')
  const idleParam = searchParams.get('idle')

  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'mfa'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(
    errorParam === 'auth-failed' ? 'Authentication failed. Please try again.' : null,
  )
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null)
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null)
  const [postMfaRedirect, setPostMfaRedirect] = useState<{ userId: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async ({ email, password }: LoginFormData) => {
    setStatus('loading')
    setErrorMsg(null)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.user) {
      setStatus('error')
      setErrorMsg("That email and password don't match. Try again, or use forgot password.")
      return
    }

    // If the user has TOTP enrolled, supabase.auth.mfa.getAuthenticatorAssuranceLevel
    // will report aal1 (signed in but not MFA-verified). Challenge them before
    // we route anywhere.
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal?.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const totp = (factors?.totp ?? []).find((f) => f.status === 'verified')
      if (totp) {
        const challenge = await supabase.auth.mfa.challenge({ factorId: totp.id })
        if (challenge.error) {
          setStatus('error')
          setErrorMsg(challenge.error.message)
          return
        }
        setMfaFactorId(totp.id)
        setMfaChallengeId(challenge.data.id)
        setPostMfaRedirect({ userId: data.user.id })
        setStatus('mfa')
        return
      }
    }

    await routeAfterAuth(data.user.id)
  }

  const onMfaVerified = async (outcome: MfaOutcome) => {
    if (!postMfaRedirect) return

    // A backup code retires the TOTP factor (see consumeBackupCode), so send
    // them straight to re-enroll rather than on to their destination.
    if (outcome.via === 'backup-code') {
      window.location.href = '/account/security?reenroll=1'
      return
    }

    await routeAfterAuth(postMfaRedirect.userId)
  }

  const routeAfterAuth = async (userId: string) => {
    const supabase = createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('approval_status, password_set_at')
      .eq('id', userId)
      .maybeSingle()

    // Force migration of legacy magic-link-only users.
    if (profile && !profile.password_set_at) {
      window.location.href = '/account/set-password'
      return
    }

    if (!profile) {
      window.location.href = '/onboarding'
      return
    }

    // Fire-and-forget — don't block the redirect on this update.
    void supabase
      .from('profiles')
      .update({ last_signed_in_at: new Date().toISOString() })
      .eq('id', userId)

    // Hard navigation, not router.push: a router.push relies on Next's route
    // cache which was populated BEFORE the user logged in, so the server
    // component on the destination still sees "no user" and bounces back to
    // /login (looks like an infinite spinner). window.location.href forces a
    // real GET with the new auth cookies attached.
    if (profile.approval_status === 'pending' || profile.approval_status === 'rejected') {
      window.location.href = '/pending'
    } else {
      window.location.href = '/directory'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back.</CardTitle>
        <CardDescription>
          Sign in to find your people. New here?{' '}
          <Link href="/signup" className="text-green-700 dark:text-green-300 underline">
            Make an account →
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resetParam === 'success' && (
          <div className="mb-4 rounded-md bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 p-3 text-sm text-green-800">
            Password updated. Sign in with your new password.
          </div>
        )}
        {idleParam === '1' && (
          <div className="mb-4 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-3 text-sm text-amber-900 dark:text-amber-200">
            You were signed out after 20 minutes of inactivity. Sign in again to continue.
          </div>
        )}

        {status === 'mfa' && mfaFactorId && mfaChallengeId ? (
          <MfaChallenge
            factorId={mfaFactorId}
            challengeId={mfaChallengeId}
            onVerified={onMfaVerified}
          />
        ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@college.harvard.edu"
              {...register('email')}
              disabled={status === 'loading'}
            />
            {errors.email && <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              disabled={status === 'loading'}
            />
            {errors.password && <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>}
          </div>

          {errorMsg && (
            <div className="rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3 text-sm text-red-700 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in…' : 'Sign in'}
          </Button>

          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-green-700 dark:text-green-300 underline">
              Forgot password?
            </Link>
          </div>
        </form>
        )}
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
