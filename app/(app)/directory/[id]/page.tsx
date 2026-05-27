import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ProfileHeaderCard from '@/components/ProfileHeaderCard'
import ProfileSection, { ProfileField } from '@/components/ProfileSection'
import HarvardShield from '@/components/HarvardShield'
import { COUNTRY_FLAG, REGION_LABEL } from '@/lib/countries'
import { fieldLabelForTrack } from '@/lib/schools'
import type { Profile } from '@/lib/types'

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()
  const p = profile as Profile

  const isOwner = user?.id === p.id
  const showEmail = p.show_email_to_members && !!p.contact_email
  const isUndergrad = p.affiliation_type === 'undergrad'

  // Conditionally rendered sections
  const showContact =
    showEmail || p.city || p.country_of_residence || p.linkedin_url || p.personal_website
  const showCareer = p.job_title || p.current_company || p.industry
  const showAbout = !!p.short_bio?.trim()
  const showMentorship = p.willing_to_mentor || p.open_to_coffee_chats

  const stripUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '')

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/directory" className="text-sm text-gray-500 hover:text-gray-900">
        ← Back to directory
      </Link>

      {/* Header card */}
      <div className="mt-3">
        <ProfileHeaderCard profile={p} isOwner={isOwner} />
      </div>

      {/* Neutral shield divider */}
      <div className="flex justify-center mt-6 mb-2">
        <HarvardShield />
      </div>

      {/* CONTACT INFORMATION */}
      {showContact && (
        <ProfileSection title="Contact Information">
          {showEmail && (
            <ProfileField label="Email">
              <a href={`mailto:${p.contact_email}`} className="text-gray-900 hover:underline">
                {p.contact_email}
              </a>
            </ProfileField>
          )}
          {(p.city || p.country_of_residence) && (
            <ProfileField label="Location">
              {[p.city, p.country_of_residence].filter(Boolean).join(', ')}
            </ProfileField>
          )}
          {p.linkedin_url && (
            <ProfileField label="LinkedIn">
              <a
                href={p.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 hover:underline"
              >
                {stripUrl(p.linkedin_url)}
              </a>
            </ProfileField>
          )}
          {p.personal_website && (
            <ProfileField label="Personal Website">
              <a
                href={p.personal_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 hover:underline"
              >
                {stripUrl(p.personal_website)}
              </a>
            </ProfileField>
          )}
        </ProfileSection>
      )}

      {/* EDUCATION */}
      <ProfileSection title="Education">
        <h3 className="text-[#A51C30] font-bold mb-1">Harvard</h3>
        <p className="font-semibold">{p.harvard_school}</p>
        <p className="text-gray-700">
          {[p.degree_abbreviation, p.graduation_year].filter(Boolean).join(' | ')}
        </p>
        {p.house && isUndergrad && (
          <p className="text-gray-700 mt-1">{p.house} House</p>
        )}
        {p.concentration_field && (
          <p className="text-gray-700 italic mt-1">
            {fieldLabelForTrack(p.affiliation_type)}: {p.concentration_field}
          </p>
        )}
      </ProfileSection>

      {/* AFRICAN CONNECTION */}
      <ProfileSection title="African Connection">
        <ProfileField label="Country of Origin">
          <span className="mr-1" aria-hidden="true">
            {COUNTRY_FLAG[p.country_of_origin] ?? '🌍'}
          </span>
          {p.country_of_origin}
        </ProfileField>
        {p.africa_region && (
          <ProfileField label="Region">{REGION_LABEL[p.africa_region]}</ProfileField>
        )}
        {p.languages && p.languages.length > 0 && (
          <ProfileField label="Languages">
            <div className="flex flex-wrap gap-1.5">
              {p.languages.map((lang) => (
                <span
                  key={lang}
                  className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full"
                >
                  {lang}
                </span>
              ))}
            </div>
          </ProfileField>
        )}
      </ProfileSection>

      {/* CAREER */}
      {showCareer && (
        <ProfileSection title="Career">
          {(p.job_title || p.current_company) && (
            <ProfileField label="Current Role">
              {[p.job_title, p.current_company].filter(Boolean).join(' at ')}
            </ProfileField>
          )}
          {p.industry && <ProfileField label="Industry">{p.industry}</ProfileField>}
        </ProfileSection>
      )}

      {/* ABOUT */}
      {showAbout && (
        <ProfileSection title="About">
          <p className="leading-relaxed text-gray-800 whitespace-pre-wrap">
            {p.short_bio?.replace(/<[^>]*>/g, '')}
          </p>
        </ProfileSection>
      )}

      {/* MENTORSHIP & CONNECTIONS */}
      {showMentorship && (
        <ProfileSection title="Mentorship & Connections">
          <div className="flex flex-wrap gap-2">
            {p.willing_to_mentor && (
              <span className="inline-block bg-emerald-100 text-emerald-900 text-sm px-3 py-1 rounded-full font-medium">
                Open to mentoring
              </span>
            )}
            {p.open_to_coffee_chats && (
              <span className="inline-block bg-sky-100 text-sky-900 text-sm px-3 py-1 rounded-full font-medium">
                Available for coffee chats
              </span>
            )}
          </div>
        </ProfileSection>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t">
        {p.linkedin_url && (
          <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer">
            <Button>Connect on LinkedIn</Button>
          </a>
        )}
        {showEmail && p.contact_email && (
          <a href={`mailto:${p.contact_email}`}>
            <Button variant="outline">Email</Button>
          </a>
        )}
      </div>
    </div>
  )
}
