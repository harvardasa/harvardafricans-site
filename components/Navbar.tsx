import Link from 'next/link'
import LogoutButton from './LogoutButton'

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
      <nav className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/directory" className="font-bold text-gray-900">
              HASA Directory
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
            <LogoutButton variant="ghost" />
          </div>
        </div>
      </nav>
    </>
  )
}
