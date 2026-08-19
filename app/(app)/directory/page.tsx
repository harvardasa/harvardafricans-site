import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import DirectoryCard from '@/components/DirectoryCard'
import DirectoryFilters from '@/components/DirectoryFilters'
import DirectoryActiveFilters from '@/components/DirectoryActiveFilters'
import { Search, UserSearch } from 'lucide-react'
import {
  directoryHrefWithout,
  hasActiveSearch,
  param,
  type SearchParamRecord,
} from '@/lib/directory-filters'
import type { Profile } from '@/lib/types'

export const metadata: Metadata = { title: 'Directory' }

const PAGE_SIZE = 24

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>
}) {
  const sp = await searchParams
  const active = hasActiveSearch(sp)

  // Empty state: no DB call, no profile data leaves the server.
  if (!active) {
    return (
      <Shell sp={sp}>
        <DirectoryEmptyState />
      </Shell>
    )
  }

  const supabase = await createServerClient()

  const q = param(sp, 'q')
  const school = param(sp, 'school')
  const affiliation = param(sp, 'affiliation')
  const country = param(sp, 'country')
  const industry = param(sp, 'industry')
  const mentorsOnly = param(sp, 'mentors') === '1'
  const yearFrom = param(sp, 'year_from') ? parseInt(param(sp, 'year_from')) : null
  const yearTo = param(sp, 'year_to') ? parseInt(param(sp, 'year_to')) : null
  const page = param(sp, 'page') ? Math.max(1, parseInt(param(sp, 'page'))) : 1

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('approval_status', 'approved')
    // Skip anyone who never finished onboarding. Their row exists but the name
    // columns are the empty strings /api/auth/account-setup stubs in, so they
    // would render as a blank card with an empty avatar. The layout gate now
    // walks them through the wizard, and they reappear here once done.
    .neq('first_name', '')
    .neq('last_name', '')

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
    <Shell sp={sp} count={count}>
      {profiles && profiles.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {profiles.map((p) => (
            <DirectoryCard key={p.id} profile={p as Profile} />
          ))}
        </div>
      ) : (
        <NoMatches />
      )}

      {totalPages > 1 && <Pagination current={page} total={totalPages} sp={sp} />}
    </Shell>
  )
}

// Page chrome shared by the empty state and the result list, so the filter
// panel and heading do not have to be repeated (and cannot drift) between the
// two return paths.
function Shell({
  sp,
  count,
  children,
}: {
  sp: SearchParamRecord
  count?: number | null
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
      {/* Keyed on the filter query string (page number excluded, since paging
          does not change the filters). Clearing a chip changes the key, which
          remounts the panel so its inputs reseed from the new URL instead of
          holding the value that was just removed. */}
      <DirectoryFilters key={directoryHrefWithout(sp, [])} />

      <div className="min-w-0">
        <div className="mb-4 flex items-baseline gap-2">
          <h1 className="font-serif text-2xl font-bold text-foreground">Directory</h1>
          {count != null && (
            <span className="text-sm tabular-nums text-muted-foreground">
              {count.toLocaleString()} {count === 1 ? 'member' : 'members'}
            </span>
          )}
        </div>

        <DirectoryActiveFilters sp={sp} />

        {children}
      </div>
    </div>
  )
}

function DirectoryEmptyState() {
  return (
    <div className="rounded-xl border border-border bg-card px-6 py-20 text-center">
      <Search
        className="mx-auto mb-4 text-muted-foreground/40"
        size={40}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <p className="text-lg font-medium text-foreground">Search to find someone in HASA.</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Type a name in the search box, or pick a school, country, or industry to start.
      </p>
    </div>
  )
}

function NoMatches() {
  return (
    <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
      <UserSearch
        className="mx-auto mb-4 text-muted-foreground/40"
        size={36}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <p className="font-medium text-foreground">Nobody matches those filters.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Try removing one of the filters above.
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
  sp: SearchParamRecord
}) {
  const buildHref = (page: number) => {
    const params = new URLSearchParams()
    Object.entries(sp).forEach(([k, v]) => {
      if (typeof v === 'string' && k !== 'page') params.set(k, v)
    })
    params.set('page', String(page))
    return `?${params.toString()}`
  }

  const linkClass =
    'rounded-lg border border-border bg-card px-3 py-1.5 transition-colors hover:bg-muted'

  return (
    <nav className="mt-6 flex items-center justify-center gap-3 text-sm" aria-label="Pagination">
      {current > 1 ? (
        <a href={buildHref(current - 1)} className={linkClass} rel="prev">
          ← Prev
        </a>
      ) : (
        <span className="px-3 py-1.5 text-muted-foreground/50">← Prev</span>
      )}

      <span className="tabular-nums text-muted-foreground">
        Page {current} of {total}
      </span>

      {current < total ? (
        <a href={buildHref(current + 1)} className={linkClass} rel="next">
          Next →
        </a>
      ) : (
        <span className="px-3 py-1.5 text-muted-foreground/50">Next →</span>
      )}
    </nav>
  )
}
