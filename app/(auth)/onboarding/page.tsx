import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDomainConfig } from '@/lib/email-domains'
import { isProfileComplete } from '@/lib/profiles'
import OnboardingWizard from '@/components/OnboardingWizard'

export default async function OnboardingPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) redirect('/login')

  // Only bounce people who have actually FINISHED onboarding.
  //
  // This used to test for the mere existence of a profiles row, which broke
  // every password-flow signup: /api/auth/account-setup creates a partial row
  // at the password step and then sends the user straight here, so the guard
  // fired on the stub it had just made and redirected them to /pending with an
  // empty profile. The wizard was unreachable and members entered the directory
  // as nameless cards. Asking whether the row is COMPLETE is the fix.
  const { data: existing } = await supabase
    .from('profiles')
    .select('approval_status, first_name, last_name, country_of_origin')
    .eq('id', user.id)
    .maybeSingle()

  if (existing && isProfileComplete(existing)) {
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
