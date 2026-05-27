'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ChangePasswordSection({
  email,
  passwordSetAt,
}: {
  email: string
  passwordSetAt: string | null
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({ resolver: zodResolver(changePasswordSchema) })

  const password = watch('password') ?? ''
  const rules = [
    { label: '12+ chars', ok: password.length >= 12 },
    { label: 'lowercase', ok: /[a-z]/.test(password) },
    { label: 'uppercase', ok: /[A-Z]/.test(password) },
    { label: 'number', ok: /[0-9]/.test(password) },
    { label: 'symbol', ok: /[^a-zA-Z0-9]/.test(password) },
  ]

  const onSubmit = async (data: ChangePasswordFormData) => {
    setStatus('loading')
    setErrorMsg(null)
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email,
        current_password: data.current_password,
        password: data.password,
      }),
    })
    if (!res.ok) {
      const { error } = (await res.json().catch(() => ({ error: 'Change failed' }))) as {
        error?: string
      }
      setStatus('error')
      setErrorMsg(error ?? 'Change failed')
      return
    }
    setStatus('success')
    reset()
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Change password</h2>
        {passwordSetAt && (
          <p className="text-xs text-gray-500 mt-0.5">
            Last changed {new Date(passwordSetAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="current_password">Current password</Label>
          <Input
            id="current_password"
            type="password"
            autoComplete="current-password"
            {...register('current_password')}
            disabled={status === 'loading'}
          />
          {errors.current_password && (
            <p className="text-sm text-red-600">{errors.current_password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="new_password">New password</Label>
          <Input
            id="new_password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            disabled={status === 'loading'}
          />
          <p className="text-xs text-gray-500">
            {rules.map((r) => (
              <span
                key={r.label}
                className={r.ok ? 'text-green-700 mr-2' : 'text-gray-400 mr-2'}
              >
                {r.ok ? '✓' : '•'} {r.label}
              </span>
            ))}
          </p>
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_new_password">Confirm new password</Label>
          <Input
            id="confirm_new_password"
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
        {status === 'success' && (
          <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
            Password updated.
          </div>
        )}

        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </section>
  )
}
