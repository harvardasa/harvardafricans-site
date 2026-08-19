import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = { title: 'Admin dashboard' }
import AdminApprovalQueue from '@/components/AdminApprovalQueue'
import AdminMembersTable from '@/components/AdminMembersTable'
import AdminShell from '@/components/admin/AdminShell'
import { Button } from '@/components/ui/button'
import { requireAdmin } from '@/lib/auth/admin'
import type { Profile } from '@/lib/types'

export default async function AdminPage() {
  const { user } = await requireAdmin()

  // Use admin client to fetch ALL profiles regardless of approval status
  const adminClient = createAdminClient()
  const { data: allProfiles } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const profiles = (allProfiles as Profile[]) ?? []
  const pending = profiles.filter((p) => p.approval_status === 'pending')

  return (
    <AdminShell email={user.email ?? ''}>
      <p className="text-sm text-muted-foreground mb-6">
        All actions are recorded in the audit log. Be thoughtful; this is real member data.
      </p>

      <Tabs defaultValue="approval">
        <TabsList>
          <TabsTrigger value="approval">
            Approval queue
            {pending.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="members">All members ({profiles.length})</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="approval" className="mt-4">
          <AdminApprovalQueue profiles={pending} />
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <AdminMembersTable profiles={profiles} />
        </TabsContent>

        <TabsContent value="export" className="mt-4">
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Export member directory</h2>
            <div className="rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-3 text-sm text-amber-800 dark:text-amber-300">
              <p className="font-medium">⚠️ This file contains personal data.</p>
              <p className="mt-1">
                Handle carefully and delete the local copy when you&apos;re done. Never upload
                to a public spreadsheet or share outside the HASA board.
              </p>
            </div>
            <a href="/api/admin/export" download>
              <Button>Download CSV (approved members only)</Button>
            </a>
          </div>
        </TabsContent>
      </Tabs>
    </AdminShell>
  )
}
