import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TotpManager from './TotpManager'

export default async function SecurityPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // List MFA factors currently enrolled for this user. supabase-js returns
  // an array; we care about TOTP factors with status 'verified'.
  const { data: factors } = await supabase.auth.mfa.listFactors()
  const verifiedTotp = (factors?.totp ?? []).find((f) => f.status === 'verified')

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Security</h1>
      <p className="text-sm text-gray-500 mb-6">
        Two-factor authentication adds a second step to every sign-in using a code from your
        authenticator app (Google Authenticator, 1Password, Authy, etc.).
      </p>
      <TotpManager
        enrolled={!!verifiedTotp}
        factorId={verifiedTotp?.id ?? null}
      />
    </div>
  )
}
