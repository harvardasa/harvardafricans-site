import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDomainConfig } from '@/lib/email-domains'
import OnboardingWizard from '@/components/OnboardingWizard'

export default async function OnboardingPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) redirect('/login')

  // If profile already exists, send them to the right place
  const { data: existing } = await supabase
    .from('profiles')
    .select('approval_status')
    .eq('id', user.id)
    .maybeSingle()

  if (existing) {
    if (existing.approval_status === 'approved') redirect('/directory')
    redirect('/pending')
  }

  const cfg = getDomainConfig(user.email)
  if (!cfg) {
    redirect('/login?error=invalid-domain')
  }

  return (
    <OnboardingWizard
      email={user.email}
      defaultSchool={cfg.school}
      defaultSchoolCode={cfg.school_code}
      affiliationType={cfg.track}
    />
  )
}
