import AdminShell from '@/components/admin/AdminShell'
import { requireAdmin } from '@/lib/auth/admin'
import { getSiteContent } from '@/lib/marketing-content'

export default async function AdminSiteContentPage() {
  const { user } = await requireAdmin()
  const content = await getSiteContent()
  const entries: Array<[string, string | string[]]> = Object.entries(content) as Array<
    [string, string | string[]]
  >

  return (
    <AdminShell email={user.email ?? ''}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Site content</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-900">
          Read-only — editor coming soon
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Editable copy across the marketing site (story page, mission, intros). Currently
        sourced from <code className="text-xs bg-gray-100 px-1 rounded">content/site-content.json</code>.
        An inline editor would replace this read-only view.
      </p>
      <div className="border rounded-md divide-y">
        {entries.map(([key, value]) => (
          <div key={key} className="p-4">
            <p className="text-xs font-mono text-gray-500 mb-1">{key}</p>
            {Array.isArray(value) ? (
              <ul className="list-disc pl-5 text-sm text-gray-800">
                {value.map((v: string) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{value}</p>
            )}
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
