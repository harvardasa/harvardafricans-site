'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const customToken = params.get('token') // recovery-email flow
  const supabaseCode = params.get('code')  // Supabase PKCE recovery flow

  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(!!customToken)

  useEffect(() => {
    if (customToken) return
    const supabase = createClient()

    const setup = async () => {
      // PKCE flow — Supabase put a ?code=XYZ in the URL. Exchange it for a session.
      if (supabaseCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(supabaseCode)
        if (error) {
          setErrorMsg('Reset link is invalid or expired. Request a new one.')
          setSessionReady(true)
          return
        }
        setSessionReady(true)
        return
      }

      // Fragment/implicit flow. Register the listener BEFORE checking the
      // session — supabase-js processes the #access_token hash asynchronously,
      // so PASSWORD_RECOVERY can fire before we subscribe if we check first.
      // INITIAL_SESSION fires synchronously on subscription with the current
      // session, so we handle that too in case the hash was already consumed.
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (
          (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY' ||
            event === 'INITIAL_SESSION') &&
          session
        ) {
          setSessionReady(true)
          sub.subscription.unsubscribe()
        }
      })

      // Belt-and-suspenders: if the session is already set by the time we
      // reach here, no further events will fire, so check directly.
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        sub.subscription.unsubscribe()
        setSessionReady(true)
        return
      }

      // Give supabase-js up to 10 s to process the fragment on slow connections.
      setTimeout(() => {
        sub.subscription.unsubscribe()
        setSessionReady((ready) => {
          if (!ready) {
            setErrorMsg('Reset link is invalid or expired. Request a new one.')
            return true
          }
          return ready
        })
      }, 10_000)
    }

    setup()
  }, [customToken, supabaseCode])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) })

  const password = watch('password') ?? ''
  const rules = [
    { label: '12+ characters', ok: password.length >= 12 },
    { label: 'Lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
    { label: 'Symbol', ok: /[^a-zA-Z0-9]/.test(password) },
  ]

  const onSubmit = async (data: ResetPasswordFormData) => {
    setStatus('loading')
    setErrorMsg(null)

    if (customToken) {
      // Recovery-email path: hit our own server route which validates the token
      // and updates the password via service-role.
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: customToken, password: data.password }),
      })
      if (!res.ok) {
        const { error } = (await res.json().catch(() => ({ error: 'Reset failed' }))) as {
          error?: string
        }
        setStatus('error')
        setErrorMsg(error ?? 'Reset failed')
        return
      }
    } else {
      // Supabase-built-in path: session is already set from the recovery link.
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: data.password })
      if (error) {
        setStatus('error')
        setErrorMsg(error.message)
        return
      }
      // SECURITY: invalidate the recovery session so the same email link can't
      // grant access again. The access token's residual lifetime (~1 hour) is
      // mitigated by lowering OTP_EXPIRY in the Supabase dashboard.
      await supabase.auth.signOut()
    }

    window.location.href = '/login?reset=success'
  }

  if (!sessionReady && !customToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verifying reset link…</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pick a new password.</CardTitle>
        <CardDescription>Something strong you don&apos;t use anywhere else.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              disabled={status === 'loading'}
            />
            <ul className="text-xs space-y-0.5 mt-1">
              {rules.map((r) => (
                <li key={r.label} className={r.ok ? 'text-green-700' : 'text-gray-500'}>
                  {r.ok ? '✓' : '•'} {r.label}
                </li>
              ))}
            </ul>
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              {...register('confirm')}
              disabled={status === 'loading'}
            />
            {errors.confirm && <p className="text-sm text-red-600">{errors.confirm.message}</p>}
          </div>

          {errorMsg && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Updating…' : 'Update password'}
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-green-700 underline">
              Back to login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
