import type { Metadata } from 'next'
import AdminShell from '@/components/admin/AdminShell'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSiteContent } from '@/lib/marketing-content'
import SiteContentEditor from './SiteContentEditor'

export const metadata: Metadata = { title: 'Site content — Admin' }

export default async function AdminSiteContentPage() {
  const { user } = await requireAdmin()
  const admin = createAdminClient()
  const { count } = await admin.from('site_content').select('id', { count: 'exact', head: true })
  const content = await getSiteContent()

  return (
    <AdminShell email={user.email ?? ''}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Site content</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Edit the headings, mission text, and intro copy across the marketing site. Each field
        saves independently.
      </p>
      <SiteContentEditor
        content={content as unknown as Record<string, string | string[]>}
      />
    </AdminShell>
  )
}
