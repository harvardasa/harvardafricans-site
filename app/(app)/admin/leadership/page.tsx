import AdminShell from '@/components/admin/AdminShell'
import { requireAdmin } from '@/lib/auth/admin'
import { getLeaders } from '@/lib/marketing-content'

export default async function AdminLeadershipPage() {
  const { user } = await requireAdmin()
  const leaders = await getLeaders()

  return (
    <AdminShell email={user.email ?? ''}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Board members</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-900">
          Read-only — editor coming soon
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Board members shown on the leadership page. Editing names, roles, bios, photos,
        and academic-year groupings needs a real form + photo uploader.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {leaders.length === 0 && <p className="text-sm text-gray-500">No board members.</p>}
        {leaders.map((l) => (
          <div key={l.id} className="border rounded-md p-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={l.photo ?? l.image}
              alt={l.name}
              className="w-12 h-12 rounded-full object-cover bg-gray-100"
            />
            <div>
              <p className="font-medium text-gray-900">{l.name}</p>
              <p className="text-xs text-gray-500">{l.role}</p>
              {l.academicYear && (
                <p className="text-xs text-gray-400">{l.academicYear}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
