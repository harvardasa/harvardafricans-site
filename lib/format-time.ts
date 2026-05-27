// Relative time formatter for the "LAST LOGIN" indicator on profile cards.
// Returns ALL-CAPS strings to match Harvard Alumni Association layout.

export function relativeLastSignIn(iso: string | null | undefined): string {
  if (!iso) return 'NEVER'
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffMs = now - then
  const diffH = diffMs / (1000 * 60 * 60)
  const diffD = diffH / 24

  if (diffH < 24) return 'TODAY'
  if (diffH < 48) return 'YESTERDAY'
  if (diffD < 7) return `${Math.floor(diffD)} DAYS AGO`
  if (diffD < 14) return 'LAST WEEK'
  if (diffD < 60) return `${Math.floor(diffD / 7)} WEEKS AGO`
  if (diffD < 365) return 'OVER A MONTH AGO'
  return 'OVER A YEAR AGO'
}
