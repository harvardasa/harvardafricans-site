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

  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(
    errorParam === 'auth-failed' ? 'Authentication failed. Please try again.' : null,
  )

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

    // Look up the profile to figure out where to send them.
    const { data: profile } = await supabase
      .from('profiles')
      .select('approval_status, password_set_at')
      .eq('id', data.user.id)
      .maybeSingle()

    // Force migration of legacy magic-link-only users.
    if (profile && !profile.password_set_at) {
      router.push('/account/set-password')
      return
    }

    if (!profile) {
      router.push('/onboarding')
      return
    }

    // Fire-and-forget — don't block the redirect on this update.
    void supabase
      .from('profiles')
      .update({ last_signed_in_at: new Date().toISOString() })
      .eq('id', data.user.id)

    if (profile.approval_status === 'pending' || profile.approval_status === 'rejected') {
      router.push('/pending')
    } else {
      router.push('/directory')
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
