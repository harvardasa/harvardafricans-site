// The 12 Harvard undergraduate houses + the freshman / non-house option.
// Shown in the onboarding wizard only if school_code === 'COL'.

export const HARVARD_HOUSES = [
  'Adams',
  'Cabot',
  'Currier',
  'Dunster',
  'Eliot',
  'Kirkland',
  'Leverett',
  'Lowell',
  'Mather',
  'Pforzheimer',
  'Quincy',
  'Winthrop',
  'DeWolfe / off-campus / N/A',
] as const

export type HarvardHouse = (typeof HARVARD_HOUSES)[number]
