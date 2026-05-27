import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import LogoutButton from '@/components/LogoutButton'

export default async function PendingPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('approval_status, first_name')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')
  if (profile.approval_status === 'approved') redirect('/directory')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            {profile.approval_status === 'rejected'
              ? 'Application not approved'
              : 'Thanks for signing up!'}
          </CardTitle>
          <CardDescription>
            {profile.approval_status === 'rejected'
              ? "Your application was not approved at this time. If you believe this is a mistake, please email directory@hasa-harvard.org."
              : 'A HASA admin will review your profile within ~24 hours. You\'ll get an email at your Harvard address when you\'re approved.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            <p className="font-medium">What happens next?</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>An admin verifies you&apos;re a current Harvard affiliate or alum</li>
              <li>You get an email when you&apos;re approved</li>
              <li>Then you can browse and connect with other HASA members</li>
            </ul>
          </div>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  )
}
