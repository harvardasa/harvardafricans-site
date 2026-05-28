'use client'

import { useState, useTransition } from 'react'
import { upsertEvent, deleteEvent, bulkImportEvents } from '@/app/actions/cms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ImageUploadField from '@/components/admin/ImageUploadField'

type EventRow = {
  id: string
  slug: string
  title: string
  description: string | null
  starts_at: string
  ends_at: string | null
  location: string | null
  cover_image_url: string | null
  status: 'upcoming' | 'past' | 'cancelled'
  is_published: boolean
}

type FormState = {
  id?: string
  slug: string
  title: string
  description: string
  starts_at: string
  ends_at: string
  location: string
  cover_image_url: string
  status: 'upcoming' | 'past' | 'cancelled'
  is_published: boolean
}

const emptyForm: FormState = {
  slug: '',
  title: '',
  description: '',
  starts_at: '',
  ends_at: '',
  location: '',
  cover_image_url: '',
  status: 'upcoming',
  is_published: true,
}

function toDateTimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  // Convert to local datetime-local format (YYYY-MM-DDTHH:MM)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EventsEditor({
  events,
  dbEmpty,
}: {
  events: EventRow[]
  dbEmpty: boolean
}) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editing, setEditing] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const reset = () => {
    setForm(emptyForm)
    setEditing(null)
  }

  const loadForEdit = (e: EventRow) => {
    setEditing(e.id)
    setForm({
      id: e.id,
      slug: e.slug,
      title: e.title,
      description: e.description ?? '',
      starts_at: toDateTimeLocal(e.starts_at),
      ends_at: toDateTimeLocal(e.ends_at),
      location: e.location ?? '',
      cover_image_url: e.cover_image_url ?? '',
      status: e.status,
      is_published: e.is_published,
    })
    setMsg(null)
    setErr(null)
  }

  const onSave = () => {
    setErr(null)
    setMsg(null)
    if (!form.slug || !form.title || !form.starts_at) {
      setErr('Slug, title, and start date are required.')
      return
    }
    startTransition(async () => {
      const res = await upsertEvent({
        id: form.id,
        slug: form.slug,
        title: form.title,
        description: form.description || null,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        location: form.location || null,
        cover_image_url: form.cover_image_url || null,
        is_published: form.is_published,
        status: form.status,
      })
      if (res.error) {
        setErr(res.error)
      } else {
        setMsg(form.id ? 'Updated.' : 'Created.')
        reset()
      }
    })
  }

  const onDelete = (id: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    startTransition(async () => {
      const res = await deleteEvent(id)
      if (res.error) setErr(res.error)
      else setMsg('Deleted.')
    })
  }

  const onBulkImport = () => {
    if (
      !confirm(
        'Import all events from content/events.json into the database? Only works if the events table is currently empty.',
      )
    )
      return
    startTransition(async () => {
      const res = await bulkImportEvents()
      if (res.error) setErr(res.error)
      else setMsg(`Imported ${res.imported} events.`)
    })
  }

  return (
    <div className="space-y-6">
      {dbEmpty && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 flex items-center justify-between gap-4">
          <p>
            The events table is empty. The public site is currently showing events from{' '}
            <code className="text-xs bg-amber-100 px-1 rounded">content/events.json</code>. Click
            import to copy that into the database — after that, edits here take effect on the
            live site.
          </p>
          <Button onClick={onBulkImport} disabled={isPending}>
            {isPending ? 'Importing…' : 'Import from JSON'}
          </Button>
        </div>
      )}

      {msg && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">{msg}</div>
      )}
      {err && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>
      )}

      {/* Form */}
      <div className="rounded-md border bg-gray-50 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">
          {editing ? 'Edit event' : 'Add new event'}
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug * (URL-safe, unique)</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="welcome-event-2026"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="starts_at">Starts at *</Label>
            <Input
              id="starts_at"
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ends_at">Ends at (optional)</Label>
            <Input
              id="ends_at"
              type="datetime-local"
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="TBD"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as FormState['status'] })
              }
              className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm"
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <ImageUploadField
          label="Cover image"
          bucket="events-images"
          value={form.cover_image_url}
          onChange={(url) => setForm({ ...form, cover_image_url: url })}
          helpText="Upload an image or paste a URL. JPG/PNG/WebP/GIF up to 10MB."
        />
        <div className="space-y-1.5">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
          />
          <Label htmlFor="published" className="font-normal">
            Published (visible on the public site)
          </Label>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={onSave} disabled={isPending}>
            {isPending ? 'Saving…' : editing ? 'Save changes' : 'Create event'}
          </Button>
          {editing && (
            <Button variant="outline" onClick={reset} disabled={isPending}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="rounded-md border divide-y">
        {events.length === 0 && (
          <p className="p-4 text-sm text-gray-500">No events in the database yet.</p>
        )}
        {events.map((e) => (
          <div key={e.id} className="p-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900">
                {e.title}{' '}
                <span className="text-xs text-gray-400">({e.slug})</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(e.starts_at).toLocaleString()} · {e.status}
                {!e.is_published && ' · DRAFT'}
              </p>
              {e.location && (
                <p className="text-xs text-gray-500">{e.location}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => loadForEdit(e)} disabled={isPending}>
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(e.id)}
                disabled={isPending}
                className="text-red-700 border-red-200 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
