'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { recoveryEmailSchema, type RecoveryEmailFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import EmailTypoHint from '@/components/EmailTypoHint'

// Lets a member change their recovery address. Previously it was set once at
// signup and then frozen, which left anyone who mistyped it, or who simply
// changed email provider, with no way back into their account after their
// Harvard address expired.
export default function RecoveryEmailSection({ current }: { current: string | null }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [saved, setSaved] = useState(current)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RecoveryEmailFormData>({
    resolver: zodResolver(recoveryEmailSchema),
    defaultValues: { recovery_email: current ?? '' },
  })

  const onSubmit = async (data: RecoveryEmailFormData) => {
    setStatus('loading')
    setErrorMsg(null)
    const res = await fetch('/api/auth/recovery-email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ recovery_email: data.recovery_email }),
    })
    if (!res.ok) {
      const { error } = (await res.json().catch(() => ({ error: 'Update failed' }))) as {
        error?: string
      }
      setStatus('error')
      setErrorMsg(error ?? 'Update failed')
      return
    }
    const { recovery_email } = (await res.json()) as { recovery_email: string }
    setSaved(recovery_email)
    reset({ recovery_email })
    setStatus('success')
  }

  return (
    <section className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Recovery email</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {saved ? `Currently ${saved}` : 'Not set yet'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="account_recovery_email">Email address</Label>
          <Input
            id="account_recovery_email"
            type="email"
            autoComplete="email"
            placeholder="you@gmail.com"
            {...register('recovery_email')}
            disabled={status === 'loading'}
          />
          <p className="text-xs text-muted-foreground">
            A personal address, not your Harvard one. This is how you get back in if you forget
            your password, and where your two-factor backup codes are sent. It needs to still work
            after you graduate and your @college.harvard.edu stops.
          </p>
          <EmailTypoHint
            email={watch('recovery_email')}
            onAccept={(corrected) =>
              setValue('recovery_email', corrected, { shouldValidate: true })
            }
          />
          {errors.recovery_email && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.recovery_email.message}
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3 text-sm text-red-700 dark:text-red-300">
            {errorMsg}
          </div>
        )}
        {status === 'success' && (
          <div className="rounded-md bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 p-3 text-sm text-green-800 dark:text-green-300">
            Recovery email updated.
          </div>
        )}

        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Saving…' : 'Save recovery email'}
        </Button>
      </form>
    </section>
  )
}
