# Country flag SVGs

Flags are stored in `lib/countries.ts` as emoji, which Windows cannot render:
its emoji font has glyphs for the individual regional-indicator letters but no
country flags, so every Windows browser draws 🇪🇹 as the letters "ET". These
SVGs are what actually gets displayed instead.

- **Source:** [flag-icons](https://github.com/lipis/flag-icons) v7.5.0, `flags/4x3/`
- **Licence:** MIT (the flag artwork itself is public domain)
- **Filed under:** ISO 3166-1 alpha-2, lowercase, e.g. `et.svg` for Ethiopia

Only the 54 countries listed in `lib/countries.ts` are vendored here, not the
full 271-flag set. The diaspora entry uses 🌍, an ordinary emoji that Windows
does render, so it has no SVG.

## Adding a country

Add it to `AFRICAN_COUNTRIES_LIST` in `lib/countries.ts` with its flag emoji,
then drop the matching `<code>.svg` in here. `countryCodeFromFlag()` derives the
filename from the emoji, so the country list stays the single source of truth
and nothing else needs changing.
