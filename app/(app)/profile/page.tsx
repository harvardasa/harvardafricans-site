import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileEditForm from '@/components/ProfileEditForm'
import ChangePasswordSection from '@/components/ChangePasswordSection'
import type { Profile } from '@/lib/types'

export const metadata: Metadata = { title: 'Your profile' }

export default async function ProfilePage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !user.email) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit your profile</h1>
        <p className="text-sm text-gray-500 mb-6">
          Changes are saved instantly. Your approval status won&apos;t change when you edit.
        </p>
        <ProfileEditForm profile={profile as Profile} />
      </div>

      <ChangePasswordSection
        email={user.email}
        passwordSetAt={(profile as Profile).password_set_at}
      />

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Two-factor authentication</h2>
        <p className="text-sm text-gray-500 mb-3">
          Add a second sign-in step using your authenticator app. Recommended for admin accounts.
        </p>
        <Link href="/account/security" className="text-sm text-green-700 underline">
          Manage two-factor settings →
        </Link>
      </section>
    </div>
  )
}
