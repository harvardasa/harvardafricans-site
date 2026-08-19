// All 54 African countries (UN list) + diaspora.
// Includes flag emoji and region (for auto-deriving africa_region).

export type AfricaRegion = 'north' | 'west' | 'east' | 'central' | 'southern' | 'diaspora'

type CountryEntry = {
  name: string
  flag: string
  region: AfricaRegion
}

export const AFRICAN_COUNTRIES_LIST: CountryEntry[] = [
  // North Africa
  { name: 'Algeria',      flag: '🇩🇿', region: 'north' },
  { name: 'Egypt',        flag: '🇪🇬', region: 'north' },
  { name: 'Libya',        flag: '🇱🇾', region: 'north' },
  { name: 'Morocco',      flag: '🇲🇦', region: 'north' },
  { name: 'Sudan',        flag: '🇸🇩', region: 'north' },
  { name: 'Tunisia',      flag: '🇹🇳', region: 'north' },
  // West Africa
  { name: 'Benin',        flag: '🇧🇯', region: 'west' },
  { name: 'Burkina Faso', flag: '🇧🇫', region: 'west' },
  { name: 'Cabo Verde',   flag: '🇨🇻', region: 'west' },
  { name: 'Gambia',       flag: '🇬🇲', region: 'west' },
  { name: 'Ghana',        flag: '🇬🇭', region: 'west' },
  { name: 'Guinea',       flag: '🇬🇳', region: 'west' },
  { name: 'Guinea-Bissau',flag: '🇬🇼', region: 'west' },
  { name: 'Ivory Coast',  flag: '🇨🇮', region: 'west' },
  { name: 'Liberia',      flag: '🇱🇷', region: 'west' },
  { name: 'Mali',         flag: '🇲🇱', region: 'west' },
  { name: 'Mauritania',   flag: '🇲🇷', region: 'west' },
  { name: 'Niger',        flag: '🇳🇪', region: 'west' },
  { name: 'Nigeria',      flag: '🇳🇬', region: 'west' },
  { name: 'Senegal',      flag: '🇸🇳', region: 'west' },
  { name: 'Sierra Leone', flag: '🇸🇱', region: 'west' },
  { name: 'Togo',         flag: '🇹🇬', region: 'west' },
  // East Africa
  { name: 'Burundi',      flag: '🇧🇮', region: 'east' },
  { name: 'Comoros',      flag: '🇰🇲', region: 'east' },
  { name: 'Djibouti',     flag: '🇩🇯', region: 'east' },
  { name: 'Eritrea',      flag: '🇪🇷', region: 'east' },
  { name: 'Ethiopia',     flag: '🇪🇹', region: 'east' },
  { name: 'Kenya',        flag: '🇰🇪', region: 'east' },
  { name: 'Madagascar',   flag: '🇲🇬', region: 'east' },
  { name: 'Malawi',       flag: '🇲🇼', region: 'east' },
  { name: 'Mauritius',    flag: '🇲🇺', region: 'east' },
  { name: 'Mozambique',   flag: '🇲🇿', region: 'east' },
  { name: 'Rwanda',       flag: '🇷🇼', region: 'east' },
  { name: 'Seychelles',   flag: '🇸🇨', region: 'east' },
  { name: 'Somalia',      flag: '🇸🇴', region: 'east' },
  { name: 'South Sudan',  flag: '🇸🇸', region: 'east' },
  { name: 'Tanzania',     flag: '🇹🇿', region: 'east' },
  { name: 'Uganda',       flag: '🇺🇬', region: 'east' },
  // Central Africa
  { name: 'Cameroon',                  flag: '🇨🇲', region: 'central' },
  { name: 'Central African Republic',  flag: '🇨🇫', region: 'central' },
  { name: 'Chad',                      flag: '🇹🇩', region: 'central' },
  { name: 'Congo (Brazzaville)',       flag: '🇨🇬', region: 'central' },
  { name: 'Congo (Kinshasa)',          flag: '🇨🇩', region: 'central' },
  { name: 'Equatorial Guinea',         flag: '🇬🇶', region: 'central' },
  { name: 'Gabon',                     flag: '🇬🇦', region: 'central' },
  { name: 'São Tomé and Príncipe',     flag: '🇸🇹', region: 'central' },
  // Southern Africa
  { name: 'Angola',       flag: '🇦🇴', region: 'southern' },
  { name: 'Botswana',     flag: '🇧🇼', region: 'southern' },
  { name: 'Eswatini',     flag: '🇸🇿', region: 'southern' },
  { name: 'Lesotho',      flag: '🇱🇸', region: 'southern' },
  { name: 'Namibia',      flag: '🇳🇦', region: 'southern' },
  { name: 'South Africa', flag: '🇿🇦', region: 'southern' },
  { name: 'Zambia',       flag: '🇿🇲', region: 'southern' },
  { name: 'Zimbabwe',     flag: '🇿🇼', region: 'southern' },
  // Diaspora catch-all
  { name: 'African Diaspora (not born in Africa)', flag: '🌍', region: 'diaspora' },
]

export const AFRICAN_COUNTRY_NAMES = AFRICAN_COUNTRIES_LIST.map((c) => c.name)

export const COUNTRY_TO_REGION: Record<string, AfricaRegion> = Object.fromEntries(
  AFRICAN_COUNTRIES_LIST.map((c) => [c.name, c.region])
)

export const COUNTRY_FLAG: Record<string, string> = Object.fromEntries(
  AFRICAN_COUNTRIES_LIST.map((c) => [c.name, c.flag])
)

export const REGION_LABEL: Record<AfricaRegion, string> = {
  north: 'North Africa',
  west: 'West Africa',
  east: 'East Africa',
  central: 'Central Africa',
  southern: 'Southern Africa',
  diaspora: 'African Diaspora',
}

// Country flags are stored above as emoji, which is the natural way to write
// them but does not survive contact with Windows: Segoe UI Emoji ships glyphs
// for the individual regional-indicator letters and no country flags at all,
// so the browser renders 🇪🇹 as a literal "ET" rather than falling through to
// another font. Every Windows browser does this. The fix is to draw flags as
// SVG (see components/CountryFlag.tsx and public/flags/), and this derives the
// ISO 3166-1 alpha-2 code the artwork is filed under straight from the emoji,
// so the list above stays the single source of truth.
//
// A flag emoji is two regional-indicator codepoints: 🇪🇹 is U+1F1EA U+1F1F9,
// which map to E and T. Anything that is not exactly two such codepoints (the
// 🌍 used for the diaspora entry) returns null, and the caller falls back to
// rendering the emoji as-is. That is safe because 🌍 is an ordinary emoji that
// Windows does render.
const REGIONAL_INDICATOR_A = 0x1f1e6

export function countryCodeFromFlag(flag: string): string | null {
  const codePoints = [...flag].map((c) => c.codePointAt(0) ?? 0)
  if (codePoints.length !== 2) return null
  if (codePoints.some((c) => c < REGIONAL_INDICATOR_A || c > REGIONAL_INDICATOR_A + 25)) {
    return null
  }
  return String.fromCharCode(
    ...codePoints.map((c) => c - REGIONAL_INDICATOR_A + 'A'.charCodeAt(0)),
  ).toLowerCase()
}
