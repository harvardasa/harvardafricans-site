// Generic neutral shield SVG (NOT Harvard's actual crest — no Harvard wordmark,
// no Veritas text, no Harvard branding). Used as a small decorative divider
// below the profile header card.

export default function HarvardShield({
  className = 'w-8 h-10 text-gray-400',
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 32 40"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16 2 C 8 2, 2 5, 2 5 L 2 18 C 2 28, 9 36, 16 38 C 23 36, 30 28, 30 18 L 30 5 C 30 5, 24 2, 16 2 Z" />
    </svg>
  )
}
