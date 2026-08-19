import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import SupportFooter from '@/components/SupportFooter'
import IdleLogout from '@/components/IdleLogout'
import { getProfileLayout, isProfileComplete } from '@/lib/profiles'

export const metadata: Metadata = {
  title: {
    default: 'HASA Alumni Directory',
    template: '%s · HASA Alumni',
  },
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfileLayout(supabase, user.id)
  if (!profile) redirect('/onboarding')

  // Finish onboarding before anything else. This catches two groups: anyone who
  // closed the browser mid-wizard, and the members who were approved back when
  // the wizard was unreachable and so have an empty profile. Their signup is
  // over, so the only place left to ask them is here, on next use.
  //
  // Deliberately ahead of the approval check: an approved-but-empty member
  // would otherwise sail straight through to the directory as a nameless card,
  // which is exactly the bug this fixes. Safe for admins, since /admin sits
  // under this layout and every admin profile is complete.
  if (!isProfileComplete(profile)) redirect('/onboarding')

  // Approved status is required for /directory and /profile.
  // Pending/rejected users get bounced to /pending here.
  if (profile.approval_status !== 'approved') redirect('/pending')

  const displayName = profile.first_name
    ? `${profile.first_name} ${profile.last_name?.[0] ?? ''}`.trim()
    : (user.email ?? '')

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <IdleLogout />
      <Navbar userName={displayName} isAdmin={profile.role === 'admin'} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">{children}</main>
      <SupportFooter />
    </div>
  )
}
