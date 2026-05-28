import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TotpManager from './TotpManager'
import { getBackupCodeStatus } from '@/app/actions/mfa'

export default async function SecurityPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: factors } = await supabase.auth.mfa.listFactors()
  const verifiedTotp = (factors?.totp ?? []).find((f) => f.status === 'verified')
  const { unused } = await getBackupCodeStatus()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Security</h1>
      <p className="text-sm text-gray-500 mb-6">
        Two-factor authentication adds a second step to every sign-in using a code from your
        authenticator app. We recommend{' '}
        <a href="https://authy.com" target="_blank" rel="noreferrer" className="underline">
          Authy
        </a>{' '}
        or{' '}
        <a href="https://1password.com" target="_blank" rel="noreferrer" className="underline">
          1Password
        </a>{' '}
        because they sync across devices — losing your phone isn&apos;t a lockout. Google
        Authenticator works too if you also keep your backup codes safe.
      </p>
      <TotpManager
        enrolled={!!verifiedTotp}
        factorId={verifiedTotp?.id ?? null}
        unusedBackupCodes={unused}
      />
    </div>
  )
}
