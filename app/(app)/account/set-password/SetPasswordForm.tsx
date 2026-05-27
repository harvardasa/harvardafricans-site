'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSetupSchema, type AccountSetupFormData } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SetPasswordForm({
  email,
  hasRecoveryEmail,
}: {
  email: string
  hasRecoveryEmail: boolean
}) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const signOutAndRestart = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AccountSetupFormData>({
    resolver: zodResolver(accountSetupSchema),
  })

  const password = watch('password') ?? ''
  const rules = [
    { label: '12+ characters', ok: password.length >= 12 },
    { label: 'Lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
    { label: 'Symbol', ok: /[^a-zA-Z0-9]/.test(password) },
  ]

  const onSubmit = async (data: AccountSetupFormData) => {
    setStatus('loading')
    setErrorMsg(null)

    const supabase = createClient()
    const { error: pwError } = await supabase.auth.updateUser({ password: data.password })
    if (pwError) {
      setStatus('error')
      setErrorMsg(pwError.message)
      return
    }

    const res = await fetch('/api/auth/account-setup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ recovery_email: data.recovery_email }),
    })
    if (!res.ok) {
      const { error } = (await res.json().catch(() => ({ error: 'Save failed' }))) as {
        error?: string
      }
      setStatus('error')
      setErrorMsg(error ?? 'Save failed')
      return
    }

    // The proxy will now let them through — send them to the directory.
    router.push('/directory')
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up your password</CardTitle>
        <CardDescription>
          We&apos;ve upgraded the login to email + password. Pick a password and a recovery email
          to keep using <strong>{email}</strong>.
          <span className="block mt-2 text-xs">
            <button type="button" onClick={signOutAndRestart} className="text-amber-700 underline">
              Not you? Sign out and start over →
            </button>
          </span>
          {hasRecoveryEmail && (
            <span className="block mt-2 text-xs text-gray-500">
              You already have a recovery email on file, but please re-enter it to confirm.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              {...register('confirm')}
              disabled={status === 'loading'}
            />
            {errors.confirm && <p className="text-sm text-red-600">{errors.confirm.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="recovery_email">Recovery email</Label>
            <Input
              id="recovery_email"
              type="email"
              autoComplete="email"
              {...register('recovery_email')}
              disabled={status === 'loading'}
            />
            <p className="text-xs text-gray-500">
              Use a personal email — Gmail, Outlook, etc. — that you&apos;ll keep using forever.
              Must NOT be a Harvard email.
            </p>
            {errors.recovery_email && (
              <p className="text-sm text-red-600">{errors.recovery_email.message}</p>
            )}
          </div>

          {errorMsg && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Saving…' : 'Save and continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
