import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VerifyTwoFactor from './VerifyTwoFactor'

export const metadata: Metadata = { title: 'Two-factor verification' }

// Lives under /account rather than /admin on purpose: /account is protected by
// the proxy but not admin-gated, so bouncing here from lib/auth/admin.ts can't
// loop. /login isn't an option either — proxy.ts redirects signed-in users off
// it.

// Only same-origin relative paths are accepted, so a crafted
// ?next=https://evil.example link can't turn this into an open redirect.
function safeNext(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value !== 'string') return '/admin'
  if (!value.startsWith('/') || value.startsWith('//')) return '/admin'
  return value
}

export default async function VerifyTwoFactorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const next = safeNext(sp.next)

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Already elevated? Nothing to do here.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal?.currentLevel === 'aal2') redirect(next)

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Two-factor verification</h1>
      <p className="text-sm text-muted-foreground mb-6">
        The admin area needs your second factor before it will open.
      </p>
      <VerifyTwoFactor next={next} />
    </div>
  )
}
