// The Harvard Alumni–style profile header card. Avatar on the left, name
// + school code + country on the right, last-login indicator top-right.

import Link from 'next/link'
import MemberAvatar from './MemberAvatar'
import { relativeLastSignIn } from '@/lib/format-time'
import CountryFlag from './CountryFlag'
import type { Profile } from '@/lib/types'

const STATUS_LABEL: Record<string, string> = {
  undergrad: 'STUDENT',
  grad_student: 'STUDENT',
  alumni: 'ALUMNI',
  faculty_or_staff: 'FACULTY',
}

export default function ProfileHeaderCard({
  profile,
  isOwner,
}: {
  profile: Profile
  isOwner: boolean
}) {
  const namePieces = [
    profile.prefix,
    profile.first_name,
    profile.preferred_name ? `"${profile.preferred_name}"` : null,
    profile.last_name,
  ].filter(Boolean)

  const status = STATUS_LABEL[profile.affiliation_type]

  return (
    <div className="relative bg-muted/50 rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
      {/* Top-right meta */}
      <div className="absolute top-4 right-4 text-right">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Last login: {relativeLastSignIn(profile.last_signed_in_at)}
        </div>
        {isOwner && (
          <Link
            href="/profile"
            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline"
          >
            ✏ Edit profile
          </Link>
        )}
      </div>

      {/* Avatar */}
      <MemberAvatar
        firstName={profile.first_name}
        lastName={profile.last_name}
        avatarUrl={profile.avatar_url}
        size="lg"
      />

      {/* Name + meta lines */}
      <div className="flex-1 pr-24">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            {namePieces.join(' ')}
          </h1>
          {status && (
            <span className="text-xs uppercase tracking-wider font-semibold bg-foreground text-background px-2 py-0.5 rounded">
              {status}
            </span>
          )}
        </div>
        <p className="mt-1 text-muted-foreground">
          {profile.harvard_school_code}
          {profile.graduation_year && ` ${profile.graduation_year}`}
        </p>
        <p className="mt-0.5 text-muted-foreground">
          <CountryFlag country={profile.country_of_origin} className="mr-1.5 h-3.5 w-5" />
          {profile.country_of_origin}
        </p>
      </div>
    </div>
  )
}
