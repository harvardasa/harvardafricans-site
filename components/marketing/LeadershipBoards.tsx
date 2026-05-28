'use client';

import { useMemo, useState } from 'react';
import LeaderCard from '@/components/marketing/LeaderCard';
import { Leader } from '@/lib/marketing-types';

interface LeadershipBoardsProps {
  leaders: Leader[];
  currentAcademicYear: string;
}

function parseAcademicYearStart(yearLabel: string) {
  const match = yearLabel.match(/(\d{2})\s*-\s*(\d{2})/);
  if (!match) {
    return -1;
  }

  return Number(match[1]);
}

function sortAcademicYears(years: string[]) {
  return [...years].sort((a, b) => parseAcademicYearStart(b) - parseAcademicYearStart(a));
}

export default function LeadershipBoards({
  leaders,
  currentAcademicYear,
}: LeadershipBoardsProps) {
  const grouped = useMemo(() => {
    return leaders.reduce<Record<string, Leader[]>>((accumulator, leader) => {
      const year = leader.academicYear || 'AY 25-26';
      if (!accumulator[year]) {
        accumulator[year] = [];
      }
      accumulator[year].push(leader);
      return accumulator;
    }, {});
  }, [leaders]);

  const allYears = useMemo(
    () => sortAcademicYears(Object.keys(grouped).filter((year) => parseAcademicYearStart(year) >= 25)),
    [grouped]
  );

  const pastYears = allYears.filter((year) => year !== currentAcademicYear);
  const [selectedPastYear, setSelectedPastYear] = useState<string>(pastYears[0] || 'AY 25-26');
  const [showPastLeaders, setShowPastLeaders] = useState(false);

  const currentLeaders = grouped[currentAcademicYear] || [];
  const selectedPastLeaders = grouped[selectedPastYear] || [];

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
            No leaders are published yet for {currentAcademicYear}. Add members from the admin dashboard.
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
          {pastYears.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowPastLeaders((previous) => !previous)}
              className="rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm text-white"
            >
              {showPastLeaders ? 'Hide Past Leaders' : 'Show Past Leaders'}
            </button>
          ) : null}
        </div>

        {pastYears.length === 0 ? (
          <p className="rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-gray-200">
            Past boards will appear here once a new current board is selected.
          </p>
        ) : !showPastLeaders ? (
          <p className="rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-gray-200">
            Past leaders are hidden by default. Use &quot;Show Past Leaders&quot; to browse archived boards.
          </p>
        ) : selectedPastLeaders.length === 0 ? (
          <p className="rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-gray-200">
            No published leaders are available for {selectedPastYear}.
          </p>
        ) : (
          <div className="space-y-4">
            <label className="text-sm text-gray-200">
              <span className="mr-2">Academic Year</span>
              <select
                value={selectedPastYear}
                onChange={(event) => setSelectedPastYear(event.target.value)}
                className="rounded-md border border-white/20 bg-black/40 px-3 py-2 text-white"
              >
                {pastYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {selectedPastLeaders.map((leader) => (
                <LeaderCard key={leader.id} leader={leader} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
