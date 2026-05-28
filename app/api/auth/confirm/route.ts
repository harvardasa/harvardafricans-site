import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { getProfileGating, updateLastSignIn } from '@/lib/profiles'

// Email-link confirmation endpoint.
//
// Why this exists instead of linking emails straight at Supabase's
// /auth/v1/verify: that endpoint validates `redirect_to` against the project's
// Redirect-URL allowlist and, when it doesn't match, silently rewrites it to
// the Site URL root. With the allowlist unconfigured every signup/recovery link
// dumped the user on the marketing homepage with the session stuck in the URL
// fragment — so signups never created a profile and password resets never
// reached /reset-password.
//
// Here we render OUR OWN url in the email (see send-email/route.ts), verify the
// one-time token_hash server-side with verifyOtp (no redirect_to, no allowlist
// involved), which writes the session into cookies, then redirect ourselves.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  if (tokenHash && type) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const profile = await getProfileGating(supabase, user.id)
        if (profile) updateLastSignIn(supabase, user.id)

        // Recovery — session is now in cookies; the reset-password page reads it
        // via the browser client and lets the user pick a new password.
        if (type === 'recovery') {
          return NextResponse.redirect(`${origin}/reset-password`)
        }

        // Signup / magic-link email confirmation. First-timers have no profile
        // (or no password yet) → finish account setup, which creates the
        // profiles row that the admin approval queue reads from.
        if (!profile || !profile.password_set_at) {
          return NextResponse.redirect(`${origin}/signup/account`)
        }
        if (profile.approval_status === 'approved') {
          return NextResponse.redirect(`${origin}/directory`)
        }
        return NextResponse.redirect(`${origin}/pending`)
      }
    }
  }

  // Token missing / expired / already used. Send recovery users back to request
  // a fresh link; everyone else to login with a readable error.
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/forgot-password?error=expired`)
  }
  return NextResponse.redirect(`${origin}/login?error=link-expired`)
}
