import AdminShell from '@/components/admin/AdminShell'
import { requireAdmin } from '@/lib/auth/admin'
import { getGallery } from '@/lib/marketing-content'

export default async function AdminGalleryPage() {
  const { user } = await requireAdmin()
  const albums = await getGallery()

  return (
    <AdminShell email={user.email ?? ''}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Gallery</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-900">
          Read-only — uploader coming soon
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Albums currently shown on the gallery page. Image uploads need to go to Supabase
        Storage with a real upload form — flag for next sprint.
      </p>
      <div className="border rounded-md divide-y">
        {albums.length === 0 && <p className="p-4 text-sm text-gray-500">No albums.</p>}
        {albums.map((a) => (
          <div key={a.id} className="p-4">
            <p className="font-medium text-gray-900">{a.eventName}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(a.date).toLocaleDateString()} · {a.images.length} photo
              {a.images.length === 1 ? '' : 's'}
            </p>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
