'use client'

import { useMemo, useState } from 'react'
import LeaderCard from '@/components/marketing/LeaderCard'
import { Leader } from '@/lib/marketing-types'
import { sortAcademicYearsDesc } from '@/lib/academic-years'

interface LeadershipBoardsProps {
  leaders: Leader[]
  currentAcademicYear: string
}

export default function LeadershipBoards({
  leaders,
  currentAcademicYear,
}: LeadershipBoardsProps) {
  // Group leaders by academic_year. Unlabeled leaders bucket under the
  // current AY so they show somewhere instead of being silently dropped.
  const grouped = useMemo(() => {
    return leaders.reduce<Record<string, Leader[]>>((acc, leader) => {
      const year = leader.academicYear || currentAcademicYear
      if (!acc[year]) acc[year] = []
      acc[year].push(leader)
      return acc
    }, {})
  }, [leaders, currentAcademicYear])

  // Every year that has people, sorted newest first. No silent cutoff —
  // every academic year from HASA's 1977 founding can show here.
  const allYearsWithLeaders = useMemo(
    () => sortAcademicYearsDesc(Object.keys(grouped)),
    [grouped],
  )
  const pastYears = allYearsWithLeaders.filter((y) => y !== currentAcademicYear)

  const [selectedPastYear, setSelectedPastYear] = useState<string>(pastYears[0] ?? '')
  const [showPastLeaders, setShowPastLeaders] = useState(false)

  const currentLeaders = grouped[currentAcademicYear] ?? []
  const selectedPastLeaders = selectedPastYear ? grouped[selectedPastYear] ?? [] : []

  return (
    <div className="space-y-14">
      <section>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-bold text-white">Current Board</h2>
          <span className="rounded-full border border-emerald-200/40 bg-emerald-100/20 px-3 py-1 text-sm font-semibold text-emerald-100">
            {currentAcademicYear}
          </span>
        </div>

        {currentLeaders.length === 0 ? (
          <p className="rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-gray-200">
            No leaders published yet for {currentAcademicYear}. Add members from the admin dashboard.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {currentLeaders.map((leader) => (
              <LeaderCard key={leader.id} leader={leader} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-bold text-white">Past Leaders</h2>
          {pastYears.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPastLeaders((p) => !p)}
              className="rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm text-white"
            >
              {showPastLeaders ? 'Hide Past Leaders' : 'Show Past Leaders'}
            </button>
          )}
        </div>

        {pastYears.length === 0 ? (
          <p className="rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-gray-200">
            Past boards will appear here once members from earlier years are added.
          </p>
        ) : !showPastLeaders ? (
          <p className="rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-gray-200">
            Past leaders are hidden by default. Use &quot;Show Past Leaders&quot; to browse archived boards.
          </p>
        ) : (
          <div className="space-y-6">
            <label className="text-sm text-gray-200 flex items-center gap-2 flex-wrap">
              <span>Academic Year</span>
              <select
                value={selectedPastYear}
                onChange={(e) => setSelectedPastYear(e.target.value)}
                className="rounded-md border border-white/20 bg-black/40 px-3 py-2 text-white"
              >
                {pastYears.map((year) => (
                  <option key={year} value={year} className="bg-black">
                    {year} ({grouped[year]?.length ?? 0})
                  </option>
                ))}
              </select>
            </label>

            {selectedPastLeaders.length === 0 ? (
              <p className="rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-gray-200">
                No leaders are listed for {selectedPastYear} yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {selectedPastLeaders.map((leader) => (
                  <LeaderCard key={leader.id} leader={leader} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
