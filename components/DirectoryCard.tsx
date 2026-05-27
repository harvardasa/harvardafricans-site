import Link from 'next/link'
import { Card } from '@/components/ui/card'
import InitialsAvatar from './InitialsAvatar'
import { COUNTRY_FLAG } from '@/lib/countries'
import type { Profile } from '@/lib/types'

export default function DirectoryCard({ profile }: { profile: Profile }) {
  const displayName = profile.preferred_name
    ? `${profile.preferred_name} ${profile.last_name}`
    : `${profile.first_name} ${profile.last_name}`

  const flag = COUNTRY_FLAG[profile.country_of_origin] ?? '🌍'

  const roleLine = profile.job_title && profile.current_company
    ? `${profile.job_title} at ${profile.current_company}`
    : profile.job_title || profile.current_company || (profile.is_current_student ? 'Current student' : null)

  return (
    <Link href={`/directory/${profile.id}`}>
      <Card className="h-full p-4 hover:shadow-md transition-shadow cursor-pointer relative">
        {profile.willing_to_mentor && (
          <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-semibold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">
            Mentor
          </span>
        )}

        <div className="flex items-center gap-3">
          <InitialsAvatar
            firstName={profile.first_name}
            lastName={profile.last_name}
            size="sm"
          />
          <div className="min-w-0 flex-1 pr-12">
            <h3 className="font-serif font-semibold text-gray-900 truncate">{displayName}</h3>
            <p className="text-xs text-gray-500 truncate">
              {profile.harvard_school_code}
              {profile.graduation_year && ` ${profile.graduation_year}`}
            </p>
          </div>
        </div>

        <p className="mt-2 text-xs text-gray-600 truncate">
          <span className="mr-1" aria-hidden="true">{flag}</span>
          {profile.country_of_origin}
        </p>

        {roleLine && (
          <p className="mt-2 text-sm text-gray-700 line-clamp-2">{roleLine}</p>
        )}
      </Card>
    </Link>
  )
}
