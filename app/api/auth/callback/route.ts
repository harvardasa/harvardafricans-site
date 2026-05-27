import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const intent = searchParams.get('intent')

  if (code) {
    const supabase = await createServerClient()

    // exchangeCodeForSession replaces the session cookies on success, which
    // already covers the legitimate case of a different user taking over the
    // browser. We don't pre-signOut here because that wipes the PKCE verifier
    // cookies (code_verifier) that some flows need to complete the exchange.
    // The defensive signOut runs ONLY on the error path below, which is the
    // case that caused the May 2026 session-leak incident.
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('approval_status, password_set_at')
          .eq('id', user.id)
          .maybeSingle()

        if (profile) {
          await supabase
            .from('profiles')
            .update({ last_signed_in_at: new Date().toISOString() })
            .eq('id', user.id)
        }

        // Recovery flow — user clicked the link from /forgot-password.
        // Session is now in cookies; send them to /reset-password to pick a new password.
        if (intent === 'recovery') {
          return NextResponse.redirect(`${origin}/reset-password`)
        }

        // Signup flow — user clicked the verification link from /signup.
        // Send them to /signup/account to pick a password and recovery email.
        if (intent === 'signup') {
          if (!profile || !profile.password_set_at) {
            return NextResponse.redirect(`${origin}/signup/account`)
          }
          // They already have a password → treat as login.
          if (profile.approval_status === 'approved') {
            return NextResponse.redirect(`${origin}/directory`)
          }
          return NextResponse.redirect(`${origin}/pending`)
        }

        // Legacy / non-signup callback (e.g. magic-link migration path).
        if (!profile) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
        if (!profile.password_set_at) {
          return NextResponse.redirect(`${origin}/account/set-password`)
        }
        if (profile.approval_status === 'pending' || profile.approval_status === 'rejected') {
          return NextResponse.redirect(`${origin}/pending`)
        }
        return NextResponse.redirect(`${origin}/directory`)
      }
    }
  }

  // Defense in depth: if we somehow reach this fallback, make sure no session
  // leaks through. supabase.auth.signOut on the server clears cookies on the
  // response we'll return.
  try {
    const supabase = await createServerClient()
    await supabase.auth.signOut()
  } catch {
    // ignore — we're already on the error path
  }
  return NextResponse.redirect(`${origin}/login?error=auth-failed`)
}
