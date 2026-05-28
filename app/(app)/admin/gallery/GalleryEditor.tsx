'use client'

import { useState, useTransition, useRef } from 'react'
import {
  upsertAlbum,
  deleteAlbum,
  addGalleryImage,
  deleteGalleryImage,
} from '@/app/actions/cms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ImageUploadField from '@/components/admin/ImageUploadField'

type Album = {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image_url: string | null
  is_published: boolean
  images: Array<{ id: string; image_url: string; caption: string | null }>
}

type AlbumForm = {
  id?: string
  title: string
  slug: string
  description: string
  cover_image_url: string
  is_published: boolean
}

const emptyAlbum: AlbumForm = {
  title: '',
  slug: '',
  description: '',
  cover_image_url: '',
  is_published: true,
}

export default function GalleryEditor({ albums }: { albums: Album[] }) {
  const [form, setForm] = useState<AlbumForm>(emptyAlbum)
  const [editing, setEditing] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const reset = () => {
    setForm(emptyAlbum)
    setEditing(null)
  }

  const loadForEdit = (a: Album) => {
    setEditing(a.id)
    setForm({
      id: a.id,
      title: a.title,
      slug: a.slug,
      description: a.description ?? '',
      cover_image_url: a.cover_image_url ?? '',
      is_published: a.is_published,
    })
    setMsg(null)
    setErr(null)
  }

  const onSaveAlbum = () => {
    setErr(null)
    setMsg(null)
    if (!form.title || !form.slug) {
      setErr('Title and slug are required.')
      return
    }
    startTransition(async () => {
      const res = await upsertAlbum({
        id: form.id,
        title: form.title,
        slug: form.slug,
        description: form.description || null,
        cover_image_url: form.cover_image_url || null,
        is_published: form.is_published,
      })
      if (res.error) setErr(res.error)
      else {
        setMsg(form.id ? 'Album updated.' : 'Album created.')
        reset()
      }
    })
  }

  const onDeleteAlbum = (id: string) => {
    if (!confirm('Delete this album AND all its images? This cannot be undone.')) return
    startTransition(async () => {
      const res = await deleteAlbum(id)
      if (res.error) setErr(res.error)
      else setMsg('Album deleted.')
    })
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">{msg}</div>
      )}
      {err && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>
      )}

      {/* Album form */}
      <div className="rounded-md border bg-gray-50 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">
          {editing ? 'Edit album' : 'New album'}
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Africa Night 2026"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="africa-night-2026"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <ImageUploadField
          label="Cover image (optional)"
          bucket="gallery-images"
          value={form.cover_image_url}
          onChange={(url) => setForm({ ...form, cover_image_url: url })}
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_published"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
          />
          <Label htmlFor="is_published" className="font-normal">Published</Label>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={onSaveAlbum} disabled={isPending}>
            {isPending ? 'Saving…' : editing ? 'Save album' : 'Create album'}
          </Button>
          {editing && (
            <Button variant="outline" onClick={reset} disabled={isPending}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Albums + their images */}
      <div className="space-y-4">
        {albums.length === 0 && (
          <p className="text-sm text-gray-500">No albums yet. Create one above.</p>
        )}
        {albums.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            onEdit={() => loadForEdit(album)}
            onDelete={() => onDeleteAlbum(album.id)}
            onMessage={(m: string) => setMsg(m)}
            onError={(e: string) => setErr(e)}
            disabled={isPending}
          />
        ))}
      </div>
    </div>
  )
}

function AlbumCard({
  album,
  onEdit,
  onDelete,
  onMessage,
  onError,
  disabled,
}: {
  album: Album
  onEdit: () => void
  onDelete: () => void
  onMessage: (m: string) => void
  onError: (e: string) => void
  disabled: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleFiles = async (files: FileList) => {
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('bucket', 'gallery-images')
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string }
          onError(j.error ?? `Upload failed for ${file.name}`)
          continue
        }
        const { url } = (await res.json()) as { url: string }
        const addRes = await addGalleryImage({ album_id: album.id, image_url: url })
        if (addRes.error) onError(addRes.error)
      }
      onMessage(`Uploaded ${files.length} image${files.length === 1 ? '' : 's'}.`)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeImage = (id: string) => {
    if (!confirm('Remove this image from the album?')) return
    startTransition(async () => {
      const res = await deleteGalleryImage(id)
      if (res.error) onError(res.error)
      else onMessage('Image removed.')
    })
  }

  return (
    <div className="rounded-md border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="font-medium text-gray-900">
            {album.title}{' '}
            <span className="text-xs text-gray-400">({album.slug})</span>
            {!album.is_published && (
              <span className="text-xs text-amber-700 ml-2">DRAFT</span>
            )}
          </h4>
          <p className="text-xs text-gray-500">
            {album.images.length} image{album.images.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} disabled={disabled || uploading}>
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={disabled || uploading}
            className="text-red-700 border-red-200 hover:bg-red-50"
          >
            Delete album
          </Button>
        </div>
      </div>

      <div className="border-t pt-3">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm">Images in this album</Label>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files)
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading || isPending}
            >
              {uploading ? 'Uploading…' : '+ Upload images'}
            </Button>
          </div>
        </div>
        {album.images.length === 0 ? (
          <p className="text-xs text-gray-400">No images yet.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {album.images.map((img) => (
              <div key={img.id} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt={img.caption ?? ''}
                  className="w-full aspect-square object-cover rounded-md border bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isPending}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
