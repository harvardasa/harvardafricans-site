// MFA backup-code helpers. Codes are user-friendly 10-character strings
// formatted like XXXX-XXXX-XX. We store sha256 hashes; plaintext never
// touches the database after enrollment.

import { createHash, randomBytes } from 'crypto'

const CODE_COUNT = 8

function rawCode(): string {
  // Base32-ish charset, no easily-confused glyphs (0/O, 1/I/L).
  const charset = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(10)
  let s = ''
  for (let i = 0; i < 10; i++) s += charset[bytes[i] % charset.length]
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 10)}`
}

export function hashCode(raw: string): string {
  return createHash('sha256').update(raw.replace(/-/g, '').toUpperCase()).digest('hex')
}

export function generateBackupCodes(): { plaintext: string[]; hashes: string[] } {
  const plaintext: string[] = []
  for (let i = 0; i < CODE_COUNT; i++) plaintext.push(rawCode())
  const hashes = plaintext.map(hashCode)
  return { plaintext, hashes }
}
