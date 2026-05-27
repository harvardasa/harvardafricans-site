// Degree options per school code — used by the onboarding wizard dropdown.
// User can always pick "Other" and type freely.

export const DEGREES_BY_SCHOOL_CODE: Record<string, string[]> = {
  COL:  ['AB', 'SB'],
  GSAS: ['AM', 'PhD'],
  HBS:  ['MBA', 'DBA'],
  HKS:  ['MPP', 'MPA', 'MC/MPA'],
  HLS:  ['JD', 'LLM', 'SJD'],
  HMS:  ['MD', 'MMSc'],
  HSPH: ['MPH', 'SM', 'DrPH', 'ScD'],
  GSE:  ['EdM', 'EdD', 'EdLD'],
  GSD:  ['MArch', 'MUP', 'MLA', 'DDes'],
  HDS:  ['MDiv', 'MTS', 'ThD'],
  ALUM: ['AB', 'SB', 'MBA', 'JD', 'MD', 'PhD', 'EdM', 'MPH'],
  FAS:  [],
  SEAS: [],
  HU:   [],
}

// Used in the EDUCATION section to label "Concentration" vs "Field"
export function fieldLabelForTrack(track: string): string {
  return track === 'undergrad' ? 'Concentration' : 'Field'
}
