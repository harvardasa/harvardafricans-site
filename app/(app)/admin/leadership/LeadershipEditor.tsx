'use client'

import { useState, useTransition } from 'react'
import { upsertLeader, deleteLeader, bulkImportLeaders } from '@/app/actions/cms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ImageUploadField from '@/components/admin/ImageUploadField'

type LeaderRow = {
  id: string
  name: string
  role: string
  bio: string | null
  photo_url: string | null
  linkedin_url: string | null
  email: string | null
  display_order: number
  is_active: boolean
  academic_year: string | null
}

type FormState = {
  id?: string
  name: string
  role: string
  bio: string
  photo_url: string
  linkedin_url: string
  email: string
  display_order: number
  is_active: boolean
  academic_year: string
}

const emptyForm: FormState = {
  name: '',
  role: '',
  bio: '',
  photo_url: '',
  linkedin_url: '',
  email: '',
  display_order: 0,
  is_active: true,
  academic_year: '',
}

export default function LeadershipEditor({
  leaders,
  dbEmpty,
}: {
  leaders: LeaderRow[]
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

  const loadForEdit = (l: LeaderRow) => {
    setEditing(l.id)
    setForm({
      id: l.id,
      name: l.name,
      role: l.role,
      bio: l.bio ?? '',
      photo_url: l.photo_url ?? '',
      linkedin_url: l.linkedin_url ?? '',
      email: l.email ?? '',
      display_order: l.display_order,
      is_active: l.is_active,
      academic_year: l.academic_year ?? '',
    })
    setMsg(null)
    setErr(null)
  }

  const onSave = () => {
    setErr(null)
    setMsg(null)
    if (!form.name || !form.role) {
      setErr('Name and role are required.')
      return
    }
    startTransition(async () => {
      const res = await upsertLeader({
        id: form.id,
        name: form.name,
        role: form.role,
        bio: form.bio || null,
        photo_url: form.photo_url || null,
        linkedin_url: form.linkedin_url || null,
        email: form.email || null,
        display_order: form.display_order,
        is_active: form.is_active,
        academic_year: form.academic_year || null,
      })
      if (res.error) setErr(res.error)
      else {
        setMsg(form.id ? 'Updated.' : 'Created.')
        reset()
      }
    })
  }

  const onDelete = (id: string) => {
    if (!confirm('Delete this board member?')) return
    startTransition(async () => {
      const res = await deleteLeader(id)
      if (res.error) setErr(res.error)
      else setMsg('Deleted.')
    })
  }

  const onBulkImport = () => {
    if (!confirm('Import all board members from content/leaders.json?')) return
    startTransition(async () => {
      const res = await bulkImportLeaders()
      if (res.error) setErr(res.error)
      else setMsg(`Imported ${res.imported} board members.`)
    })
  }

  return (
    <div className="space-y-6">
      {dbEmpty && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 flex items-center justify-between gap-4">
          <p>
            board_members table is empty. Live site is reading from{' '}
            <code className="text-xs bg-amber-100 px-1 rounded">content/leaders.json</code>.
            Import once to make it editable.
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

      <div className="rounded-md border bg-gray-50 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">
          {editing ? 'Edit board member' : 'Add board member'}
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Role *</Label>
            <Input
              id="role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="President, Treasurer, …"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="academic_year">Academic year</Label>
            <Input
              id="academic_year"
              value={form.academic_year}
              onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
              placeholder="AY 26-27"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="display_order">Display order</Label>
            <Input
              id="display_order"
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              value={form.linkedin_url}
              onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
            />
          </div>
        </div>
        <ImageUploadField
          label="Photo"
          bucket="leader-photos"
          value={form.photo_url}
          onChange={(url) => setForm({ ...form, photo_url: url })}
          helpText="Headshot. JPG/PNG/WebP up to 10MB. Square crops best."
        />
        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={4}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Short bio or blurb that appears on the leadership page."
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          <Label htmlFor="is_active" className="font-normal">
            Active (visible on the public leadership page)
          </Label>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={onSave} disabled={isPending}>
            {isPending ? 'Saving…' : editing ? 'Save changes' : 'Add member'}
          </Button>
          {editing && (
            <Button variant="outline" onClick={reset} disabled={isPending}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border divide-y">
        {leaders.length === 0 && <p className="p-4 text-sm text-gray-500">No board members.</p>}
        {leaders.map((l) => (
          <div key={l.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {l.photo_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={l.photo_url}
                  alt={l.name}
                  className="w-12 h-12 object-cover rounded-full bg-gray-100"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {l.name}{' '}
                  {!l.is_active && (
                    <span className="text-xs text-gray-400 ml-1">(hidden)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">{l.role}</p>
                {l.academic_year && <p className="text-xs text-gray-400">{l.academic_year}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => loadForEdit(l)} disabled={isPending}>
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(l.id)}
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
