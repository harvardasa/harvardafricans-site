import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import AccountSetupForm from './AccountSetupForm'

export default async function SignupAccountPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) redirect('/login')

  // If they already have a password set, skip this step.
  const { data: profile } = await supabase
    .from('profiles')
    .select('password_set_at, approval_status')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.password_set_at) {
    if (profile.approval_status === 'approved') redirect('/directory')
    if (profile.approval_status === 'pending') redirect('/pending')
    redirect('/onboarding')
  }

  return <AccountSetupForm email={user.email} />
}
