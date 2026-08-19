import Link from 'next/link'
import Image from 'next/image'
import LogoutButton from './LogoutButton'
import MobileNav from './MobileNav'
import ThemeToggle from './ThemeToggle'

export default function Navbar({
  userName,
  isAdmin,
}: {
  userName: string
  isAdmin: boolean
}) {
  return (
    // Sticky so the search and nav stay reachable while scrolling a long
    // result list. `relative` positioning is what MobileNav's dropdown anchors
    // to, and sticky is also a positioned ancestor, so the dropdown still
    // lines up.
    <nav className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-6 min-w-0">
          <Link
            href="/directory"
            className="flex items-center gap-2 font-serif font-bold text-foreground shrink-0"
            aria-label="HASA Directory home"
          >
            <Image
              src="/hasa-logo.svg"
              alt=""
              width={225}
              height={264}
              className="h-8 w-auto"
              loading="eager"
            />
            <span>HASA Directory</span>
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <Link href="/directory" className="text-muted-foreground transition-colors hover:text-foreground">
              Directory
            </Link>
            <Link href="/profile" className="text-muted-foreground transition-colors hover:text-foreground">
              My profile
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="font-medium text-amber-700 transition-colors hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-sm text-muted-foreground truncate max-w-[12rem]">
            {userName}
          </span>
          <ThemeToggle />
          <div className="hidden sm:block">
            <LogoutButton variant="ghost" />
          </div>
          <MobileNav userName={userName} isAdmin={isAdmin} />
        </div>
      </div>
    </nav>
  )
}
