import AdminShell from '@/components/admin/AdminShell'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import GalleryEditor from './GalleryEditor'

export default async function AdminGalleryPage() {
  const { user } = await requireAdmin()
  const admin = createAdminClient()

  const { data: albums } = await admin
    .from('gallery_albums')
    .select('id, title, slug, description, cover_image_url, is_published, created_at')
    .order('created_at', { ascending: false })

  const albumIds = (albums ?? []).map((a) => a.id)
  const { data: images } = albumIds.length
    ? await admin
        .from('gallery_images')
        .select('id, album_id, image_url, caption, display_order')
        .in('album_id', albumIds)
        .order('display_order', { ascending: true })
    : { data: [] as Array<{ id: string; album_id: string; image_url: string; caption: string | null }> }

  const albumsWithImages = (albums ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    description: a.description,
    cover_image_url: a.cover_image_url,
    is_published: a.is_published,
    images: (images ?? [])
      .filter((img) => img.album_id === a.id)
      .map((img) => ({ id: img.id, image_url: img.image_url, caption: img.caption })),
  }))

  return (
    <AdminShell email={user.email ?? ''}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Gallery</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Create albums and upload photos. Changes update the live{' '}
        <a className="underline" href="/gallery">gallery page</a>.{' '}
        <a className="underline text-amber-700" href="/gallery?preview=1" target="_blank" rel="noreferrer">
          Preview drafts ↗
        </a>{' '}
        Drag-select multiple files when uploading to add them all at once.
      </p>
      <GalleryEditor albums={albumsWithImages} />
    </AdminShell>
  )
}
