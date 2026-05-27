import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import SetPasswordForm from './SetPasswordForm'

// One-time page for users who signed up before email+password existed. The
// proxy forces them here until they set a password and a recovery email.
export default async function SetPasswordPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('password_set_at, recovery_email')
    .eq('id', user.id)
    .maybeSingle()

  // Already migrated — bounce them out.
  if (profile?.password_set_at) redirect('/directory')

  return (
    <div className="max-w-md mx-auto pt-12">
      <SetPasswordForm
        email={user.email}
        hasRecoveryEmail={!!profile?.recovery_email}
      />
    </div>
  )
}
