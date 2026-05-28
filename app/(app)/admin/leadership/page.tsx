import AdminShell from '@/components/admin/AdminShell'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import LeadershipEditor from './LeadershipEditor'

export default async function AdminLeadershipPage() {
  const { user } = await requireAdmin()
  const admin = createAdminClient()
  const { data } = await admin
    .from('board_members')
    .select('id, name, role, bio, photo_url, photo_position, linkedin_url, email, display_order, is_active, academic_year')
    .order('display_order', { ascending: true })

  const leaders = data ?? []
  return (
    <AdminShell email={user.email ?? ''}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Board members</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Changes here update the live{' '}
        <a className="underline" href="/leadership">leadership page</a>.
      </p>
      <LeadershipEditor leaders={leaders} />
    </AdminShell>
  )
}
