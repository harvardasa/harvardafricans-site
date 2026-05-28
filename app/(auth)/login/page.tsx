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
  const [mfaCode, setMfaCode] = useState('')
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

  const submitMfaCode = async () => {
    if (!mfaFactorId || !mfaChallengeId || !postMfaRedirect) return
    setStatus('loading')
    setErrorMsg(null)
    const supabase = createClient()
    const { error } = await supabase.auth.mfa.verify({
      factorId: mfaFactorId,
      challengeId: mfaChallengeId,
      code: mfaCode,
    })
    if (error) {
      setStatus('mfa')
      setErrorMsg("Code didn't match. Codes refresh every 30 seconds — try a fresh one.")
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
          <Link href="/signup" className="text-green-700 underline">
            Make an account →
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resetParam === 'success' && (
          <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
            Password updated. Sign in with your new password.
          </div>
        )}
        {idleParam === '1' && (
          <div className="mb-4 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
            You were signed out after 20 minutes of inactivity. Sign in again to continue.
          </div>
        )}

        {status === 'mfa' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Enter the 6-digit code from your authenticator app.
            </p>
            <div className="space-y-2">
              <Label htmlFor="mfa">Code</Label>
              <Input
                id="mfa"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                autoComplete="one-time-code"
                inputMode="numeric"
                className="font-mono text-lg tracking-widest text-center"
              />
            </div>
            {errorMsg && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}
            <Button type="button" onClick={submitMfaCode} disabled={mfaCode.length !== 6}>
              Verify and sign in
            </Button>
          </div>
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
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
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
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {errorMsg && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in…' : 'Sign in'}
          </Button>

          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-green-700 underline">
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
