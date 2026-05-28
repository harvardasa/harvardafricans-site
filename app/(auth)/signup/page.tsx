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
        "That doesn't look like a Harvard email — our directory is for current Harvard students, alumni, faculty, and staff. If you think we should accept your domain, email directory@hasa-harvard.org.",
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
          <CardTitle>Sent.</CardTitle>
          <CardDescription>
            Check your Harvard inbox at <strong>{sentTo}</strong> for the sign-in link — it
            lands in a minute or two. (If it&apos;s not there, peek in spam.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Used the wrong email?{' '}
            <button className="text-green-700 underline" onClick={() => setStatus('idle')}>
              try a different one
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
        <CardTitle>Join HASA&apos;s directory.</CardTitle>
        <CardDescription>
          Already in?{' '}
          <Link href="/login" className="text-green-700 underline">
            Sign in →
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Harvard email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@college.harvard.edu"
              autoComplete="email"
              {...register('email')}
              disabled={status === 'loading'}
            />
            <p className="text-xs text-gray-500">
              We check that you&apos;re really at Harvard (or were). One email, one verification —
              then you set a password and use that from now on.
            </p>
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          {status === 'duplicate' && (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
              You already have an account.{' '}
              <Link href="/login" className="underline font-medium">
                Sign in →
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
