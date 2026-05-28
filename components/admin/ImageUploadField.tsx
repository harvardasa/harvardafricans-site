'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resizeImage } from '@/lib/image-resize'

export default function ImageUploadField({
  label,
  bucket,
  value,
  onChange,
  helpText,
}: {
  label: string
  bucket: 'events-images' | 'leader-photos' | 'gallery-images'
  value: string
  onChange: (url: string) => void
  helpText?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setErr(null)
    setUploading(true)
    try {
      // Downscale + re-encode locally so a 5MB phone photo becomes a few
      // hundred KB before we even hit the upload endpoint. Saves storage,
      // saves bandwidth, makes pages load faster.
      const resized = await resizeImage(file).catch(() => file)
      const fd = new FormData()
      fd.append('file', resized)
      fd.append('bucket', bucket)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        setErr(j.error ?? `Upload failed (HTTP ${res.status})`)
        return
      }
      const { url } = (await res.json()) as { url: string }
      onChange(url)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2 items-start">
        {value && (
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Current"
              className="w-20 h-20 object-cover rounded-md border bg-gray-100"
            />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste URL or upload below"
          />
          <div className="flex gap-2 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
            </Button>
            {value && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange('')}
                disabled={uploading}
                className="text-red-700"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  )
}
