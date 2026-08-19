import Link from 'next/link'
import { Card } from '@/components/ui/card'
import MemberAvatar from './MemberAvatar'
import CountryFlag from './CountryFlag'
import { SCHOOL_CODE_TO_NAME } from '@/lib/email-domains'
import type { Profile } from '@/lib/types'

export default function DirectoryCard({ profile }: { profile: Profile }) {
  const displayName = profile.preferred_name
    ? `${profile.preferred_name} ${profile.last_name}`
    : `${profile.first_name} ${profile.last_name}`

  const roleLine =
    profile.job_title && profile.current_company
      ? `${profile.job_title} at ${profile.current_company}`
      : profile.job_title ||
        profile.current_company ||
        (profile.is_current_student ? 'Current student' : null)

  // Codes are what fits on a card, but they are opaque to anyone who did not
  // attend that school, so the full name rides along as a tooltip. The filter
  // dropdown spells both out, which is where people learn them.
  const schoolCode = profile.harvard_school_code
  const schoolName = schoolCode ? SCHOOL_CODE_TO_NAME[schoolCode] : undefined

  return (
    <Link
      href={`/directory/${profile.id}`}
      className="group block h-full rounded-xl outline-none"
    >
      <Card className="relative h-full gap-0 p-4 transition-shadow group-hover:shadow-md group-focus-visible:ring-3 group-focus-visible:ring-ring/50">
        {profile.willing_to_mentor && (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-300">
            Mentor
          </span>
        )}

        <div className="flex items-center gap-3">
          <MemberAvatar
            firstName={profile.first_name}
            lastName={profile.last_name}
            avatarUrl={profile.avatar_url}
            size="sm"
          />
          {/* The right padding keeps long names clear of the mentor pill. */}
          <div className="min-w-0 flex-1 pr-14">
            <h3 className="truncate font-serif text-base font-semibold leading-tight text-foreground">
              {displayName}
            </h3>
            {roleLine && (
              <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
                {roleLine}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
          <CountryFlag country={profile.country_of_origin} />
          <span className="truncate">{profile.country_of_origin}</span>
          {schoolCode && (
            <>
              <span aria-hidden="true" className="text-border">
                ·
              </span>
              <span className="shrink-0 tabular-nums" title={schoolName}>
                {schoolCode}
                {profile.graduation_year ? ` ${profile.graduation_year}` : ''}
              </span>
            </>
          )}
        </div>
      </Card>
    </Link>
  )
}
