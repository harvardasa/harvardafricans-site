// Canonical list of HASA academic years, from the org's founding (1977) to
// the current academic year. Both the admin editor and the public
// leadership page pull from here so the labels stay consistent and no year
// can fall outside the allowed set.

const HASA_FOUNDED = 1977

// HASA's "current" academic year as of the launch of this CMS.
// Bump this by one each summer when the new board is elected.
export const CURRENT_ACADEMIC_YEAR_START = 2026

function fmt(startFullYear: number): string {
  const start = String(startFullYear).slice(-2).padStart(2, '0')
  const end = String(startFullYear + 1).slice(-2).padStart(2, '0')
  return `AY ${start}-${end}`
}

// All academic years HASA has ever had, current first.
export const ACADEMIC_YEARS: string[] = (() => {
  const out: string[] = []
  for (let y = CURRENT_ACADEMIC_YEAR_START; y >= HASA_FOUNDED; y--) {
    out.push(fmt(y))
  }
  return out
})()

export const CURRENT_ACADEMIC_YEAR = fmt(CURRENT_ACADEMIC_YEAR_START)

// Parse "AY 77-78" / "AY 25-26" into the full start year (1977 / 2025) so we
// can sort consistently across the 1900/2000 boundary. Anything < 70 is
// treated as 20xx; anything >= 70 is 19xx. HASA's founding year (77) is the
// lower bound so this covers every legit value.
export function parseAcademicYearStartFull(label: string): number {
  const match = label.match(/(\d{2})\s*-\s*\d{2}/)
  if (!match) return -1
  const yy = Number(match[1])
  return yy >= 70 ? 1900 + yy : 2000 + yy
}

export function sortAcademicYearsDesc(years: string[]): string[] {
  return [...years].sort(
    (a, b) => parseAcademicYearStartFull(b) - parseAcademicYearStartFull(a),
  )
}

export function isValidAcademicYear(label: string): boolean {
  return ACADEMIC_YEARS.includes(label)
}
