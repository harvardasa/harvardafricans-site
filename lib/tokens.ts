import { createHash, randomBytes } from 'crypto'

// Issues a random URL-safe token and the sha256 hash to store in the DB.
// We store the hash so a DB leak doesn't expose live reset tokens.
export function issueResetToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString('base64url')
  const hash = createHash('sha256').update(raw).digest('hex')
  return { raw, hash }
}

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}
