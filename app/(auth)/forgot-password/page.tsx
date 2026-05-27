'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async ({ email }: ForgotPasswordFormData) => {
    setStatus('loading')
    // Always succeed visually so we don't leak which emails exist.
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => {})
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check your inbox</CardTitle>
          <CardDescription>
            If an account exists with that email, we&apos;ve sent a reset link. The link expires
            in 1 hour.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="text-sm text-green-700 underline">
            Back to login
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter the email you use to sign in (or your recovery email) and we&apos;ll send you a
          reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              disabled={status === 'loading'}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending…' : 'Send reset link'}
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
