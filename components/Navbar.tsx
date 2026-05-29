import Link from 'next/link'
import Image from 'next/image'
import LogoutButton from './LogoutButton'
import MobileNav from './MobileNav'

export default function Navbar({
  userName,
  isAdmin,
}: {
  userName: string
  isAdmin: boolean
}) {
  return (
    <>
      <div className="h-1 bg-gradient-to-r from-red-600 via-amber-500 to-green-700" />
      <nav className="relative border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/directory" className="flex items-center gap-2 font-bold text-gray-900" aria-label="HASA Directory home">
              <Image src="/hasa-mark.svg" alt="" width={28} height={28} priority />
              <span>HASA Directory</span>
            </Link>
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <Link href="/directory" className="text-gray-700 hover:text-gray-900">
                Directory
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-gray-900">
                My profile
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-amber-700 hover:text-amber-800 font-medium"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-gray-500">{userName}</span>
            <div className="hidden sm:block">
              <LogoutButton variant="ghost" />
            </div>
            <MobileNav userName={userName} isAdmin={isAdmin} />
          </div>
        </div>
      </nav>
    </>
  )
}
