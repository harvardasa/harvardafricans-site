'use client'

import { suggestEmailCorrection } from '@/lib/email-typos'

// Inline "did you mean" nudge for an email field. Renders nothing at all unless
// the domain looks like a near-miss for a common provider.
//
// Deliberately a suggestion and not a validation error: the domain list cannot
// know every legitimate address, and blocking a real one is worse than the typo
// this guards against. The member can ignore it and submit regardless.
export default function EmailTypoHint({
  email,
  onAccept,
}: {
  email: string | undefined
  onAccept: (corrected: string) => void
}) {
  const suggestion = email ? suggestEmailCorrection(email) : null
  if (!suggestion) return null

  return (
    <p className="text-sm text-amber-800 dark:text-amber-300">
      Did you mean{' '}
      <button
        type="button"
        onClick={() => onAccept(suggestion)}
        className="font-medium underline underline-offset-2 hover:no-underline"
      >
        {suggestion}
      </button>
      ?
    </p>
  )
}
