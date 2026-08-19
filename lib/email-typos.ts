// "Did you mean gmail.com?" for recovery addresses.
//
// A recovery email is the way back into an account once a Harvard address stops
// working, and it is also where two-factor backup codes are sent. A single
// mistyped letter therefore does real damage quietly: the address validates
// fine, the member never notices, and the mistake only surfaces years later at
// the exact moment they need it. One member had already saved "gmaill.com".
//
// Typo domains are also routinely registered by third parties to catch stray
// mail, so a slip is not merely a dead end.
//
// This only ever SUGGESTS. It never blocks submission, because the list below
// cannot know about every legitimate domain, and wrongly rejecting a real
// address is worse than the typo we are guarding against.

// The providers members actually use. Anything not on this list is left alone
// rather than guessed at.
const COMMON_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'hotmail.co.uk',
  'live.com',
  'msn.com',
  'yahoo.com',
  'yahoo.co.uk',
  'ymail.com',
  'icloud.com',
  'me.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'gmx.com',
  'zoho.com',
  'yandex.com',
  'mail.com',
  'comcast.net',
  'verizon.net',
]

// Standard Levenshtein distance, capped early. Two rows rather than a full
// matrix: the strings are domain names, so this stays trivial either way, but
// there is no reason to allocate more.
function editDistance(a: string, b: string): number {
  if (a === b) return 0
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  let curr = new Array<number>(b.length + 1)

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[b.length]
}

/**
 * Returns the whole corrected address when the domain looks like a near-miss
 * for a common provider, or null when there is nothing worth suggesting.
 *
 *   suggestEmailCorrection('me@gmaill.com')  -> 'me@gmail.com'
 *   suggestEmailCorrection('me@gmail.com')   -> null  (already exact)
 *   suggestEmailCorrection('me@hbs.edu')     -> null  (not close to anything)
 */
export function suggestEmailCorrection(email: string): string | null {
  const trimmed = email.trim().toLowerCase()
  const at = trimmed.lastIndexOf('@')
  if (at < 1 || at === trimmed.length - 1) return null

  const local = trimmed.slice(0, at)
  const domain = trimmed.slice(at + 1)

  // Exact match, nothing to say.
  if (COMMON_DOMAINS.includes(domain)) return null

  let best: string | null = null
  let bestDistance = Infinity
  for (const candidate of COMMON_DOMAINS) {
    const d = editDistance(domain, candidate)
    if (d < bestDistance) {
      bestDistance = d
      best = candidate
    }
  }

  if (!best) return null

  // One edit is a confident catch (gmaill, gmial, gmai). Two is only safe on a
  // longer domain, where the proportion of the name still matching is high;
  // allowing two edits on something short would "correct" me.com into
  // proton.me and similar nonsense.
  const allowed = best.length >= 9 ? 2 : 1
  if (bestDistance > allowed) return null

  return `${local}@${best}`
}
