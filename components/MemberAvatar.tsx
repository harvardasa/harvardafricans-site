// A member's face, or their initials when they have not uploaded one.
//
// Was InitialsAvatar. Renamed once it learned to show photographs, because the
// old name would have been a lie at every call site.
//
// The initials fallback keeps its deterministic colour: the same person always
// gets the same one, derived from a hash of their name, so the grid stays
// recognisable rather than becoming a wall of identical grey circles. That
// colour also sits behind a photo while it loads, so nothing flashes white.
//
// Each palette entry carries a dark-mode pair. The light tints are far too
// bright against a dark page, so dark mode uses a translucent wash of the same
// hue with light text, which keeps a person's colour recognisable in both
// themes rather than giving them a different identity at night.

const PALETTE = [
  'bg-rose-200 text-rose-900 dark:bg-rose-400/20 dark:text-rose-200',
  'bg-amber-200 text-amber-900 dark:bg-amber-400/20 dark:text-amber-200',
  'bg-emerald-200 text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-200',
  'bg-teal-200 text-teal-900 dark:bg-teal-400/20 dark:text-teal-200',
  'bg-sky-200 text-sky-900 dark:bg-sky-400/20 dark:text-sky-200',
  'bg-indigo-200 text-indigo-900 dark:bg-indigo-400/20 dark:text-indigo-200',
  'bg-purple-200 text-purple-900 dark:bg-purple-400/20 dark:text-purple-200',
  'bg-pink-200 text-pink-900 dark:bg-pink-400/20 dark:text-pink-200',
]

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

const SIZE_CLASSES = {
  sm: 'w-11 h-11 text-sm',
  md: 'w-14 h-14 text-lg',
  lg: 'w-20 h-20 text-2xl sm:w-28 sm:h-28 sm:text-3xl',
  xl: 'w-28 h-28 text-3xl sm:w-32 sm:h-32 sm:text-4xl',
} as const

export default function MemberAvatar({
  firstName,
  lastName,
  avatarUrl,
  size = 'lg',
}: {
  firstName: string
  lastName: string
  avatarUrl?: string | null
  size?: keyof typeof SIZE_CLASSES
}) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
  const seed = `${firstName} ${lastName}`
  const colors = PALETTE[hashString(seed) % PALETTE.length]
  const sizeClasses = SIZE_CLASSES[size]

  const base = `${sizeClasses} ${colors} flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-serif font-bold tracking-wide`

  if (avatarUrl) {
    return (
      <div className={base}>
        {/* Plain <img>, not next/image: these are already downscaled on upload
            and served from Supabase storage, so the image pipeline has nothing
            left to optimise and would only add a round trip per member on a
            grid of 24 cards. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className={base} aria-hidden="true">
      {initials}
    </div>
  )
}
