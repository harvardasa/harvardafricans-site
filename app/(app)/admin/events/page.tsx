import AdminShell from '@/components/admin/AdminShell'
import { requireAdmin } from '@/lib/auth/admin'
import { getEvents } from '@/lib/marketing-content'

export default async function AdminEventsPage() {
  const { user } = await requireAdmin()
  const events = await getEvents()

  return (
    <AdminShell email={user.email ?? ''}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Events</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-900">
          Read-only — editor coming soon
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        These are the events shown on the public site. To edit, the actual CMS form
        (date picker, image upload, RSVP link, etc.) needs to be built — flag this for
        the next dev sprint.
      </p>
      <div className="border rounded-md divide-y">
        {events.length === 0 && <p className="p-4 text-sm text-gray-500">No events.</p>}
        {events.map((e) => (
          <div key={e.id} className="p-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900">{e.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(e.date).toLocaleDateString()} · {e.category}
              </p>
            </div>
            <span className="text-xs text-gray-400">{e.id}</span>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
