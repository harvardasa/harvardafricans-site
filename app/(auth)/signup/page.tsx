'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupEmailSchema, type SignupEmailFormData } from '@/lib/validations'
import { getDomainConfig } from '@/lib/email-domains'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Status = 'idle' | 'loading' | 'sent' | 'duplicate' | 'error'

export default function SignupPage() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupEmailFormData>({ resolver: zodResolver(signupEmailSchema) })

  const onSubmit = async ({ email }: SignupEmailFormData) => {
    setErrorMsg(null)

    if (!getDomainConfig(email)) {
      setErrorMsg(
        "We didn't recognize this as a Harvard email. The directory is for current Harvard affiliates and alumni. If you think this is wrong, contact directory@hasa-harvard.org.",
      )
      return
    }

    setStatus('loading')

    // 1. Check duplicates first — never send a magic link for an existing account.
    const checkRes = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!checkRes.ok) {
      setStatus('error')
      setErrorMsg('Something went wrong. Please try again.')
      return
    }
    const { exists } = (await checkRes.json()) as { exists: boolean }
    if (exists) {
      setStatus('duplicate')
      return
    }

    // 2. Send the one-time Harvard-email verification link.
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/api/auth/callback?intent=signup`,
      },
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
      return
    }

    setSentTo(email)
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check your Harvard inbox</CardTitle>
          <CardDescription>
            We sent a verification link to <strong>{sentTo}</strong>. Click it to continue setting
            up your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Didn&apos;t get it? Check your spam folder, or{' '}
            <button className="text-green-700 underline" onClick={() => setStatus('idle')}>
              try a different email
            </button>
            .
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your HASA Directory account</CardTitle>
        <CardDescription>
          Already have an account?{' '}
          <Link href="/login" className="text-green-700 underline">
            Log in instead →
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Harvard email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@college.harvard.edu"
              autoComplete="email"
              {...register('email')}
              disabled={status === 'loading'}
            />
            <p className="text-xs text-gray-500">
              We use your Harvard email to verify you&apos;re a Harvard affiliate. After signup,
              you&apos;ll log in with a password.
            </p>
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          {status === 'duplicate' && (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
              This email is already registered.{' '}
              <Link href="/login" className="underline font-medium">
                Log in instead →
              </Link>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Checking…' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
