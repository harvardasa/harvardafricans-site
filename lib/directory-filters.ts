// Shared vocabulary for the directory's filters.
//
// Three places need to agree on what a filter is called and which URL params
// carry it: the filter panel (DirectoryFilters), the removable chips above the
// results (DirectoryActiveFilters), and the page itself, which decides whether
// a search is active at all. Keeping the list here means adding a filter is a
// one-line change rather than three that can drift apart.

import { SCHOOL_CODE_TO_NAME } from '@/lib/email-domains'

export type SearchParamRecord = { [key: string]: string | string[] | undefined }

// Params that count as an "active search". `page` is deliberately absent: on
// its own it is not a search, and treating it as one would run a query for
// someone who only ever hit the empty state.
export const DIRECTORY_FILTER_KEYS = [
  'q',
  'school',
  'affiliation',
  'country',
  'industry',
  'mentors',
  'year_from',
  'year_to',
] as const

export type DirectoryFilterKey = (typeof DIRECTORY_FILTER_KEYS)[number]

export const AFFILIATION_LABELS: Record<string, string> = {
  undergrad: 'Undergrad',
  grad_student: 'Grad student',
  alumni: 'Alum',
  faculty_or_staff: 'Faculty / staff',
}

export const AFFILIATION_OPTIONS = Object.entries(AFFILIATION_LABELS).map(
  ([value, label]) => ({ value, label }),
)

// Reads a param that should be a single string. Next hands us `string[]` when
// a key appears twice in the URL, which we treat as absent rather than
// guessing which copy was meant.
export function param(sp: SearchParamRecord, key: string): string {
  const v = sp[key]
  return typeof v === 'string' ? v : ''
}

export function hasActiveSearch(sp: SearchParamRecord): boolean {
  return DIRECTORY_FILTER_KEYS.some((k) => param(sp, k).length > 0)
}

export function countActiveFilters(sp: SearchParamRecord): number {
  return describeActiveFilters(sp).length
}

// One entry per chip. `keys` is what clearing the chip removes from the URL,
// which is why it is a list: the graduation-year range reads as a single idea
// to a member but is carried by two params.
export type ActiveFilter = {
  id: string
  label: string
  keys: DirectoryFilterKey[]
}

export function describeActiveFilters(sp: SearchParamRecord): ActiveFilter[] {
  const out: ActiveFilter[] = []

  const q = param(sp, 'q')
  if (q) out.push({ id: 'q', label: `"${q}"`, keys: ['q'] })

  const school = param(sp, 'school')
  if (school) {
    out.push({ id: 'school', label: SCHOOL_CODE_TO_NAME[school] ?? school, keys: ['school'] })
  }

  const affiliation = param(sp, 'affiliation')
  if (affiliation) {
    out.push({
      id: 'affiliation',
      label: AFFILIATION_LABELS[affiliation] ?? affiliation,
      keys: ['affiliation'],
    })
  }

  const country = param(sp, 'country')
  if (country) out.push({ id: 'country', label: country, keys: ['country'] })

  const industry = param(sp, 'industry')
  if (industry) out.push({ id: 'industry', label: industry, keys: ['industry'] })

  if (param(sp, 'mentors') === '1') {
    out.push({ id: 'mentors', label: 'Mentors only', keys: ['mentors'] })
  }

  const from = param(sp, 'year_from')
  const to = param(sp, 'year_to')
  if (from || to) {
    const label = from && to ? `Class of ${from} to ${to}` : from ? `Class of ${from} onward` : `Up to ${to}`
    out.push({ id: 'years', label, keys: ['year_from', 'year_to'] })
  }

  return out
}

// Builds a directory URL with `drop` removed. Used by the chips to clear one
// filter without disturbing the others. `page` is always dropped: after
// changing the filters, page 4 of the old result set is meaningless.
export function directoryHrefWithout(
  sp: SearchParamRecord,
  drop: readonly string[],
): string {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v !== 'string' || !v) continue
    if (k === 'page' || drop.includes(k)) continue
    params.set(k, v)
  }
  const qs = params.toString()
  return qs ? `/directory?${qs}` : '/directory'
}
