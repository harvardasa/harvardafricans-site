export type Track = 'undergrad' | 'grad_student' | 'alumni' | 'faculty_or_staff'

export type DomainConfig = {
  track: Track
  school: string         // full name, e.g., "Harvard College"
  school_code: string    // short code for "COL 2028" display
  auto_approve: boolean  // false → admin must approve
}

export const HARVARD_DOMAINS: Record<string, DomainConfig> = {
  'college.harvard.edu':  { track: 'undergrad',        school: 'Harvard College',                              school_code: 'COL',  auto_approve: false },
  'g.harvard.edu':        { track: 'grad_student',     school: 'Graduate School of Arts and Sciences',         school_code: 'GSAS', auto_approve: false },
  'hbs.edu':              { track: 'grad_student',     school: 'Harvard Business School',                      school_code: 'HBS',  auto_approve: false },
  'hks.harvard.edu':      { track: 'grad_student',     school: 'Harvard Kennedy School',                       school_code: 'HKS',  auto_approve: false },
  'hls.harvard.edu':      { track: 'grad_student',     school: 'Harvard Law School',                           school_code: 'HLS',  auto_approve: false },
  'hms.harvard.edu':      { track: 'grad_student',     school: 'Harvard Medical School',                       school_code: 'HMS',  auto_approve: false },
  'hsph.harvard.edu':     { track: 'grad_student',     school: 'Harvard T.H. Chan School of Public Health',    school_code: 'HSPH', auto_approve: false },
  'gse.harvard.edu':      { track: 'grad_student',     school: 'Harvard Graduate School of Education',         school_code: 'GSE',  auto_approve: false },
  'gsd.harvard.edu':      { track: 'grad_student',     school: 'Harvard Graduate School of Design',            school_code: 'GSD',  auto_approve: false },
  'hds.harvard.edu':      { track: 'grad_student',     school: 'Harvard Divinity School',                      school_code: 'HDS',  auto_approve: false },
  'mail.harvard.edu':     { track: 'grad_student',     school: 'Harvard University',                           school_code: 'HU',   auto_approve: false },
  'alumni.harvard.edu':   { track: 'alumni',           school: 'Harvard Alumni',                               school_code: 'ALUM', auto_approve: false },
  'post.harvard.edu':     { track: 'alumni',           school: 'Harvard Alumni',                               school_code: 'ALUM', auto_approve: false },
  'harvard.edu':          { track: 'faculty_or_staff', school: 'Harvard University',                           school_code: 'HU',   auto_approve: false },
  'fas.harvard.edu':      { track: 'faculty_or_staff', school: 'Faculty of Arts and Sciences',                 school_code: 'FAS',  auto_approve: false },
  'seas.harvard.edu':     { track: 'faculty_or_staff', school: 'School of Engineering and Applied Sciences',   school_code: 'SEAS', auto_approve: false },
}

export function getDomainConfig(email: string): DomainConfig | null {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return null
  return HARVARD_DOMAINS[domain] ?? null
}

export function isHarvardEmail(email: string): boolean {
  return getDomainConfig(email) !== null
}

export function isNonHarvardEmail(email: string): boolean {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  return isValid && !isHarvardEmail(email)
}

// Used by the directory filters dropdown
export const ALL_SCHOOL_CODES = Array.from(
  new Set(Object.values(HARVARD_DOMAINS).map((d) => d.school_code))
).sort()

// Map school name → school code (for the filters / dropdowns)
export const SCHOOL_NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.values(HARVARD_DOMAINS).map((d) => [d.school, d.school_code])
)

// Sorted, deduped list of school NAMES for dropdowns
export const HARVARD_SCHOOLS = Array.from(
  new Set(Object.values(HARVARD_DOMAINS).map((d) => d.school))
).sort()

// Map school code → full name (reverse of SCHOOL_NAME_TO_CODE)
export const SCHOOL_CODE_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.values(HARVARD_DOMAINS).map((d) => [d.school_code, d.school])
)
