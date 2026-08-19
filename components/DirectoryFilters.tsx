'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ALL_SCHOOL_CODES, SCHOOL_CODE_TO_NAME } from '@/lib/email-domains'
import { AFRICAN_COUNTRY_NAMES } from '@/lib/countries'
import { INDUSTRIES } from '@/lib/constants'
import { AFFILIATION_OPTIONS, countActiveFilters } from '@/lib/directory-filters'

const selectClass =
  'flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export default function DirectoryFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Drawer state. Only relevant below `lg`, where the panel is hidden behind a
  // button so results are the first thing on screen instead of six controls.
  const [open, setOpen] = useState(false)

  const [q, setQ] = useState(params.get('q') ?? '')
  const [school, setSchool] = useState(params.get('school') ?? '')
  const [affiliation, setAffiliation] = useState(params.get('affiliation') ?? '')
  const [country, setCountry] = useState(params.get('country') ?? '')
  const [industry, setIndustry] = useState(params.get('industry') ?? '')
  const [mentorsOnly, setMentorsOnly] = useState(params.get('mentors') === '1')
  const [yearFrom, setYearFrom] = useState(params.get('year_from') ?? '')
  const [yearTo, setYearTo] = useState(params.get('year_to') ?? '')

  // These eight useStates seed from the URL once, on mount. Keeping them in
  // step with later URL changes (someone clearing a chip above the results) is
  // handled by the caller, which keys this component on the filter query
  // string so a change remounts it with fresh values. Syncing them in an
  // effect instead would work but costs a second render pass on every
  // navigation, and React lints against it for that reason.

  // Counted from the URL rather than local state, so the badge reflects what
  // is actually filtering the list, not what has been typed but not applied.
  const appliedCount = useMemo(
    () => countActiveFilters(Object.fromEntries(params.entries())),
    [params],
  )

  const close = useCallback(() => setOpen(false), [])

  // While the drawer is up, close on Escape and stop the page behind it from
  // scrolling under the finger.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, close])

  const apply = () => {
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (school) sp.set('school', school)
    if (affiliation) sp.set('affiliation', affiliation)
    if (country) sp.set('country', country)
    if (industry) sp.set('industry', industry)
    if (mentorsOnly) sp.set('mentors', '1')
    if (yearFrom) sp.set('year_from', yearFrom)
    if (yearTo) sp.set('year_to', yearTo)
    close()
    startTransition(() => router.push(`/directory?${sp.toString()}`))
  }

  const reset = () => {
    setQ('')
    setSchool('')
    setAffiliation('')
    setCountry('')
    setIndustry('')
    setMentorsOnly(false)
    setYearFrom('')
    setYearTo('')
    close()
    startTransition(() => router.push('/directory'))
  }

  // Rendered twice (sidebar on desktop, drawer on mobile) but never both at
  // once. Called as a function rather than used as a <Component/> so React
  // keeps these nodes in the parent's tree: as a nested component type it
  // would be a new type every render and would remount the inputs on every
  // keystroke. `idPrefix` keeps label/input ids unique across the two copies.
  const fields = (idPrefix: string) => (
    <div className="space-y-4 text-sm">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-q`}>Search</Label>
        <Input
          id={`${idPrefix}-q`}
          placeholder="Name, company, role…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-school`}>School</Label>
        <select
          id={`${idPrefix}-school`}
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          className={selectClass}
        >
          <option value="">All schools</option>
          {ALL_SCHOOL_CODES.map((s) => (
            <option key={s} value={s}>
              {SCHOOL_CODE_TO_NAME[s] ? `${s} · ${SCHOOL_CODE_TO_NAME[s]}` : s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-affiliation`}>Affiliation</Label>
        <select
          id={`${idPrefix}-affiliation`}
          value={affiliation}
          onChange={(e) => setAffiliation(e.target.value)}
          className={selectClass}
        >
          <option value="">All</option>
          {AFFILIATION_OPTIONS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-country`}>Country of origin</Label>
        <select
          id={`${idPrefix}-country`}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={selectClass}
        >
          <option value="">All countries</option>
          {AFRICAN_COUNTRY_NAMES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-industry`}>Industry</Label>
        <select
          id={`${idPrefix}-industry`}
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className={selectClass}
        >
          <option value="">All industries</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-year-from`}>Graduation year</Label>
        <div className="flex items-center gap-2">
          <Input
            id={`${idPrefix}-year-from`}
            type="number"
            inputMode="numeric"
            placeholder="From"
            aria-label="Graduation year from"
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
          />
          <span className="text-muted-foreground" aria-hidden="true">
            to
          </span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="To"
            aria-label="Graduation year to"
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Checkbox
          id={`${idPrefix}-mentors`}
          checked={mentorsOnly}
          onCheckedChange={(v) => setMentorsOnly(!!v)}
        />
        <Label htmlFor={`${idPrefix}-mentors`} className="font-normal">
          Mentors only
        </Label>
      </div>
    </div>
  )

  const actions = (
    <div className="flex gap-2">
      <Button onClick={apply} disabled={isPending} size="lg" className="flex-1">
        {isPending ? 'Applying…' : 'Apply'}
      </Button>
      <Button variant="outline" size="lg" onClick={reset} disabled={isPending}>
        Reset
      </Button>
    </div>
  )

  return (
    // One element so the parent grid sees a single item. Below `lg` this
    // collapses to just the trigger button, which is the whole point: on a
    // phone the member cards start near the top of the page instead of below
    // a full-height panel.
    <div className="lg:sticky lg:top-20 lg:self-start">
      <Button
        variant="outline"
        size="lg"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="w-full justify-center lg:hidden"
      >
        <SlidersHorizontal size={16} />
        Filters
        {appliedCount > 0 && (
          <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
            {appliedCount}
          </span>
        )}
      </Button>

      <aside className="hidden rounded-xl border border-border bg-card p-4 lg:block">
        <h2 className="mb-4 font-serif text-base font-semibold text-foreground">Filters</h2>
        {fields('desktop')}
        <div className="mt-4 border-t border-border pt-4">{actions}</div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <button
            type="button"
            aria-label="Close filters"
            onClick={close}
            className="absolute inset-0 h-full w-full cursor-default bg-foreground/40"
          />
          {/* Bottom sheet: capped so some results stay visible behind it, and
              the action row is pinned below the scrolling field list so Apply
              is always within reach of a thumb. */}
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="font-serif text-base font-semibold text-foreground">Filters</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close filters"
                className="-mr-2 rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">{fields('mobile')}</div>
            <div className="border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {actions}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
