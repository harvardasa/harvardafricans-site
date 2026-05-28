import AdminShell from '@/components/admin/AdminShell'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import EventsEditor from './EventsEditor'

export default async function AdminEventsPage() {
  const { user } = await requireAdmin()
  const admin = createAdminClient()
  const { data } = await admin
    .from('events')
    .select('id, slug, title, description, starts_at, ends_at, location, cover_image_url, status, is_published')
    .order('starts_at', { ascending: false })

  const events = data ?? []

  return (
    <AdminShell email={user.email ?? ''}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Events</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Changes here update the live <a className="underline" href="/events">events page</a>.
        {' '}
        <a className="underline text-amber-700" href="/events?preview=1" target="_blank" rel="noreferrer">
          Preview drafts ↗
        </a>
      </p>
      <EventsEditor events={events} />
    </AdminShell>
  )
}
