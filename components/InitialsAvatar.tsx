// Fallback avatar showing user's initials on a deterministic color.
// Color is derived from a simple hash of the seed string so the same person
// always gets the same color across sessions.

const PALETTE = [
  'bg-rose-200 text-rose-900',
  'bg-amber-200 text-amber-900',
  'bg-emerald-200 text-emerald-900',
  'bg-teal-200 text-teal-900',
  'bg-sky-200 text-sky-900',
  'bg-indigo-200 text-indigo-900',
  'bg-purple-200 text-purple-900',
  'bg-pink-200 text-pink-900',
]

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export default function InitialsAvatar({
  firstName,
  lastName,
  size = 'lg',
}: {
  firstName: string
  lastName: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
  const seed = `${firstName} ${lastName}`
  const colors = PALETTE[hashString(seed) % PALETTE.length]

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-20 h-20 text-2xl sm:w-28 sm:h-28 sm:text-3xl',
    xl: 'w-28 h-28 text-3xl sm:w-32 sm:h-32 sm:text-4xl',
  }[size]

  return (
    <div
      className={`${sizeClasses} ${colors} rounded-full flex items-center justify-center font-serif font-bold select-none`}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}
