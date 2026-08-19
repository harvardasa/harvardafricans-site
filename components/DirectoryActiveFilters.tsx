import Link from 'next/link'
import { X } from 'lucide-react'
import {
  describeActiveFilters,
  directoryHrefWithout,
  type SearchParamRecord,
} from '@/lib/directory-filters'

// Removable chips showing what is currently filtering the results.
//
// Server component on purpose: the filter state lives entirely in the URL, so
// each chip is a plain link to the same page minus one param. No client state,
// no hydration, and the chips keep working with JavaScript disabled.
export default function DirectoryActiveFilters({ sp }: { sp: SearchParamRecord }) {
  const active = describeActiveFilters(sp)
  if (active.length === 0) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Filtered by</span>

      {active.map((f) => (
        <Link
          key={f.id}
          href={directoryHrefWithout(sp, f.keys)}
          // The chip as a whole is the control, so the label has to carry the
          // action for anyone using a screen reader. Without this it just
          // announces the filter name and gives no hint that it clears it.
          aria-label={`Remove filter ${f.label}`}
          className="group inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-card py-1 pl-2.5 pr-1.5 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-muted"
        >
          <span className="truncate">{f.label}</span>
          <X
            size={13}
            aria-hidden="true"
            className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
          />
        </Link>
      ))}

      {active.length > 1 && (
        <Link
          href="/directory"
          className="text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
        >
          Clear all
        </Link>
      )}
    </div>
  )
}
