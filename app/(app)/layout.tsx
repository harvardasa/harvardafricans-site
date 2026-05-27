import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getProfileLayout } from '@/lib/profiles'

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

  // Approved status is required for /directory and /profile.
  // Pending/rejected users get bounced to /pending here.
  if (profile.approval_status !== 'approved') redirect('/pending')

  const displayName = profile.first_name
    ? `${profile.first_name} ${profile.last_name?.[0] ?? ''}`.trim()
    : (user.email ?? '')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={displayName} isAdmin={profile.role === 'admin'} />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
