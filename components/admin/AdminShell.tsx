import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/gallery', label: 'Gallery' },
  { href: '/admin/leadership', label: 'Board' },
  { href: '/admin/site-content', label: 'Site content' },
] as const

export default function AdminShell({
  email,
  children,
}: {
  email: string
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">HASA Admin</h1>
          <p className="text-sm text-gray-500">Signed in as {email}</p>
        </div>
        <LogoutButton />
      </header>

      <nav className="rounded-lg border border-gray-200 bg-white px-2 py-2 shadow-sm flex flex-wrap gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        {children}
      </section>
    </div>
  )
}
