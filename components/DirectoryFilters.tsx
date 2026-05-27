'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ALL_SCHOOL_CODES } from '@/lib/email-domains'
import { AFRICAN_COUNTRY_NAMES } from '@/lib/countries'
import { INDUSTRIES } from '@/lib/constants'

export default function DirectoryFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [q, setQ] = useState(params.get('q') ?? '')
  const [school, setSchool] = useState(params.get('school') ?? '')
  const [affiliation, setAffiliation] = useState(params.get('affiliation') ?? '')
  const [country, setCountry] = useState(params.get('country') ?? '')
  const [industry, setIndustry] = useState(params.get('industry') ?? '')
  const [mentorsOnly, setMentorsOnly] = useState(params.get('mentors') === '1')
  const [yearFrom, setYearFrom] = useState(params.get('year_from') ?? '')
  const [yearTo, setYearTo] = useState(params.get('year_to') ?? '')

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
    startTransition(() => router.push('/directory'))
  }

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4 text-sm">
      <h2 className="font-semibold text-gray-900">Filters</h2>

      <div className="space-y-1.5">
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          placeholder="Name, company, role…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
        />
      </div>

      <div className="space-y-1.5">
        <Label>School</Label>
        <select
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="">All schools</option>
          {ALL_SCHOOL_CODES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label>Affiliation</Label>
        <select
          value={affiliation}
          onChange={(e) => setAffiliation(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="">All</option>
          <option value="undergrad">Undergrad</option>
          <option value="grad_student">Grad student</option>
          <option value="alumni">Alum</option>
          <option value="faculty_or_staff">Faculty / staff</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label>Country of origin</Label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="">All countries</option>
          {AFRICAN_COUNTRY_NAMES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label>Industry</Label>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="">All industries</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label>Graduation year</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="From"
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
          />
          <Input
            type="number"
            placeholder="To"
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Checkbox
          id="mentors"
          checked={mentorsOnly}
          onCheckedChange={(v) => setMentorsOnly(!!v)}
        />
        <Label htmlFor="mentors" className="font-normal">
          Mentors only
        </Label>
      </div>

      <div className="flex gap-2 pt-2 border-t">
        <Button onClick={apply} disabled={isPending} className="flex-1">
          {isPending ? 'Applying…' : 'Apply'}
        </Button>
        <Button variant="outline" onClick={reset} disabled={isPending}>
          Reset
        </Button>
      </div>
    </div>
  )
}
