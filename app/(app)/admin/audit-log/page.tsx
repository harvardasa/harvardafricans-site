import type { Metadata } from 'next'
import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = { title: 'Audit log · Admin' }

const PAGE_SIZE = 50

type ActionRow = {
  id: number
  admin_id: string
  entity_type: string
  entity_id: string
  action: string
  diff: Record<string, unknown> | null
  created_at: string
}

const ENTITY_FILTERS = ['all', 'event', 'album', 'gallery_image', 'leader', 'site_content'] as const
type EntityFilter = (typeof ENTITY_FILTERS)[number]

const ACTION_COLOR: Record<string, string> = {
  create: 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300',
  update: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300',
  delete: 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300',
  publish: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300',
  unpublish: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300',
  bulk_import: 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300',
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const { user } = await requireAdmin()
  const admin = createAdminClient()

  const entityParam = (typeof sp.entity === 'string' ? sp.entity : 'all') as EntityFilter
  const entity = ENTITY_FILTERS.includes(entityParam) ? entityParam : 'all'
  const page = typeof sp.page === 'string' ? Math.max(1, parseInt(sp.page)) : 1
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = admin
    .from('cms_actions')
    .select('id, admin_id, entity_type, entity_id, action, diff, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)
  if (entity !== 'all') query = query.eq('entity_type', entity)

  const { data: rows, count } = await query
  const actions = (rows ?? []) as ActionRow[]
  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1

  // Resolve admin emails in one round-trip
  const adminIds = Array.from(new Set(actions.map((a) => a.admin_id)))
  const { data: adminProfiles } = adminIds.length
    ? await admin.from('profiles').select('id, email').in('id', adminIds)
    : { data: [] as Array<{ id: string; email: string }> }
  const adminEmailById = new Map((adminProfiles ?? []).map((p) => [p.id, p.email] as const))

  return (
    <AdminShell email={user.email ?? ''}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-foreground">Audit log</h2>
        <div className="flex gap-1 flex-wrap">
          {ENTITY_FILTERS.map((f) => (
            <Link
              key={f}
              href={f === 'all' ? '/admin/audit-log' : `/admin/audit-log?entity=${f}`}
              className={`px-3 py-1 text-xs rounded-full border ${
                entity === f
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-foreground hover:bg-muted'
              }`}
            >
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </Link>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Every CMS change is recorded here. {count != null && <>Showing {actions.length} of {count.toLocaleString()} entries.</>}
      </p>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2 font-medium">When</th>
              <th className="text-left px-4 py-2 font-medium">Admin</th>
              <th className="text-left px-4 py-2 font-medium">Action</th>
              <th className="text-left px-4 py-2 font-medium">Entity</th>
              <th className="text-left px-4 py-2 font-medium">ID</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {actions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No actions{entity !== 'all' ? ` for ${entity}` : ''} yet.
                </td>
              </tr>
            )}
            {actions.map((a) => (
              <tr key={a.id} className="hover:bg-muted">
                <td className="px-4 py-2 text-foreground whitespace-nowrap">
                  {new Date(a.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-foreground">
                  {adminEmailById.get(a.admin_id) ?? <code className="text-xs text-muted-foreground/70">{a.admin_id.slice(0, 8)}…</code>}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLOR[a.action] ?? 'bg-muted text-foreground'}`}>
                    {a.action}
                  </span>
                </td>
                <td className="px-4 py-2 text-foreground">{a.entity_type.replace('_', ' ')}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground font-mono">{a.entity_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center gap-2 text-sm">
          {page > 1 && (
            <Link
              href={`/admin/audit-log?${new URLSearchParams({ ...(entity !== 'all' ? { entity } : {}), page: String(page - 1) }).toString()}`}
              className="px-3 py-1 border rounded hover:bg-muted"
            >
              ← Prev
            </Link>
          )}
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link
              href={`/admin/audit-log?${new URLSearchParams({ ...(entity !== 'all' ? { entity } : {}), page: String(page + 1) }).toString()}`}
              className="px-3 py-1 border rounded hover:bg-muted"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </AdminShell>
  )
}
