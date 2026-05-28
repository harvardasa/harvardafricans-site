import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-6 flex items-center gap-2" aria-label="HASA home">
        <Image src="/hasa-mark.svg" alt="" width={40} height={40} priority />
        <span className="text-lg font-bold text-gray-900">HASA</span>
      </Link>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            {profile.approval_status === 'rejected'
              ? 'Application not approved'
              : "You're in line."}
          </CardTitle>
          <CardDescription>
            {profile.approval_status === 'rejected'
              ? "Your application wasn't approved this time. If you think that's a mistake, email inquiries@harvardafricans.com and we'll take another look."
              : "One of us is reviewing your profile — usually within a day. We'll email you the moment you're approved, and then you'll see the rest of the directory. In the meantime, you can keep editing your profile. The more you fill in, the easier it'll be for other members to find you."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            <p className="font-medium">What happens next?</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>A board member confirms you&apos;re part of the Harvard community</li>
              <li>You&apos;ll get an email — usually fast, sometimes a day</li>
              <li>Then you&apos;re in: browse, search, connect with whoever you want</li>
            </ul>
          </div>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  )
}
