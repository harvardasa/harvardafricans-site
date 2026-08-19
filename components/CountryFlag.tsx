import { COUNTRY_FLAG, countryCodeFromFlag } from '@/lib/countries'

// Draws a country flag as an SVG rather than an emoji.
//
// Windows has no country-flag emoji at all: its emoji font covers the
// individual regional-indicator letters, so the browser happily renders those
// instead of falling through to a font that has the flag, and 🇪🇹 comes out as
// "ET". Every browser on Windows behaves this way, so roughly half the members
// were seeing letter pairs instead of flags.
//
// Deliberately a plain <img> and not next/image: these are 1-3KB static SVGs
// already in their final form, so there is no resizing or format conversion for
// the image pipeline to do, and routing them through it would add a server
// round-trip per flag for no gain.
export default function CountryFlag({
  country,
  className = 'h-3 w-4',
}: {
  country: string | null | undefined
  className?: string
}) {
  const emoji = (country && COUNTRY_FLAG[country]) || '🌍'
  const code = countryCodeFromFlag(emoji)

  // The diaspora entry is a globe, not a two-letter flag, and Windows renders
  // that one fine. Anything else unrecognised lands here too.
  if (!code) {
    return (
      <span className="leading-none" aria-hidden="true">
        {emoji}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- see note above
    <img
      src={`/flags/${code}.svg`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      // The ring matters: flags with white edges (Nigeria, Sierra Leone) would
      // otherwise bleed into a light card and look like the wrong shape.
      className={`inline-block shrink-0 rounded-[2px] object-cover align-[-0.1em] ring-1 ring-foreground/15 ${className}`}
    />
  )
}
