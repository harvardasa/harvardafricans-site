import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import DirectoryCard from '@/components/DirectoryCard'
import DirectoryFilters from '@/components/DirectoryFilters'
import { Search } from 'lucide-react'
import type { Profile } from '@/lib/types'

export const metadata: Metadata = { title: 'Directory' }

const PAGE_SIZE = 24

// URL params that count as an "active search". If none are present, we render
// the empty state and skip the DB query entirely.
const SEARCH_PARAM_KEYS = [
  'q',
  'school',
  'affiliation',
  'country',
  'industry',
  'mentors',
  'year_from',
  'year_to',
] as const

function hasActiveSearch(sp: { [k: string]: string | string[] | undefined }): boolean {
  return SEARCH_PARAM_KEYS.some((k) => {
    const v = sp[k]
    return typeof v === 'string' && v.length > 0
  })
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const active = hasActiveSearch(sp)

  // Empty state — no DB call, no profile data leaves the server.
  if (!active) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <DirectoryFilters />
        </aside>
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-4">Directory</h1>
          <DirectoryEmptyState />
        </div>
      </div>
    )
  }

  const supabase = await createServerClient()

  const q = typeof sp.q === 'string' ? sp.q : ''
  const school = typeof sp.school === 'string' ? sp.school : ''
  const affiliation = typeof sp.affiliation === 'string' ? sp.affiliation : ''
  const country = typeof sp.country === 'string' ? sp.country : ''
  const industry = typeof sp.industry === 'string' ? sp.industry : ''
  const mentorsOnly = sp.mentors === '1'
  const yearFrom = typeof sp.year_from === 'string' ? parseInt(sp.year_from) : null
  const yearTo = typeof sp.year_to === 'string' ? parseInt(sp.year_to) : null
  const page = typeof sp.page === 'string' ? Math.max(1, parseInt(sp.page)) : 1

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('approval_status', 'approved')

  if (school) query = query.eq('harvard_school_code', school)
  if (affiliation) query = query.eq('affiliation_type', affiliation)
  if (country) query = query.eq('country_of_origin', country)
  if (industry) query = query.eq('industry', industry)
  if (mentorsOnly) query = query.eq('willing_to_mentor', true)
  if (yearFrom && !isNaN(yearFrom)) query = query.gte('graduation_year', yearFrom)
  if (yearTo && !isNaN(yearTo)) query = query.lte('graduation_year', yearTo)
  if (q) {
    const like = `%${q}%`
    query = query.or(
      `first_name.ilike.${like},last_name.ilike.${like},preferred_name.ilike.${like},current_company.ilike.${like},job_title.ilike.${like},concentration_field.ilike.${like}`
    )
  }

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  query = query.order('last_name', { ascending: true }).range(from, to)

  const { data: profiles, count } = await query
  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <DirectoryFilters />
      </aside>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">
            Directory
            {count != null && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({count.toLocaleString()} {count === 1 ? 'member' : 'members'})
              </span>
            )}
          </h1>
        </div>

        {profiles && profiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {profiles.map((p) => (
              <DirectoryCard key={p.id} profile={p as Profile} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
            Nobody matches those filters. Try loosening one.
          </div>
        )}

        {totalPages > 1 && (
          <Pagination current={page} total={totalPages} sp={sp} />
        )}
      </div>
    </div>
  )
}

function DirectoryEmptyState() {
  return (
    <div className="bg-white rounded-lg border py-20 px-6 text-center">
      <Search className="mx-auto mb-4 text-gray-300" size={40} strokeWidth={1.5} />
      <p className="text-gray-500 text-lg font-medium">
        Search to find someone in HASA.
      </p>
      <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
        Type a name in the search box, or pick a school, country, or industry to start.
      </p>
    </div>
  )
}

function Pagination({
  current,
  total,
  sp,
}: {
  current: number
  total: number
  sp: { [k: string]: string | string[] | undefined }
}) {
  const buildHref = (page: number) => {
    const params = new URLSearchParams()
    Object.entries(sp).forEach(([k, v]) => {
      if (typeof v === 'string' && k !== 'page') params.set(k, v)
    })
    params.set('page', String(page))
    return `?${params.toString()}`
  }

  return (
    <div className="mt-6 flex justify-center items-center gap-2 text-sm">
      {current > 1 && (
        <a href={buildHref(current - 1)} className="px-3 py-1 border rounded hover:bg-gray-100">
          ← Prev
        </a>
      )}
      <span className="text-gray-500">
        Page {current} of {total}
      </span>
      {current < total && (
        <a href={buildHref(current + 1)} className="px-3 py-1 border rounded hover:bg-gray-100">
          Next →
        </a>
      )}
    </div>
  )
}
