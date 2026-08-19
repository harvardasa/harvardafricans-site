'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import MemberAvatar from '@/components/MemberAvatar'
import { resizeImage } from '@/lib/image-resize'

// Profile photo upload, on the member's own profile page.
//
// Saves the moment a file is chosen rather than on a Save button. It sits
// outside ProfileEditForm for exactly that reason: that form submits as a
// batch, and a photo folded into it would be silently lost by anyone who
// uploaded one and then navigated away without pressing Save.
export default function AvatarUploadField({
  firstName,
  lastName,
  current,
}: {
  firstName: string
  lastName: string
  current: string | null
}) {
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(current)
  const [busy, setBusy] = useState<'upload' | 'remove' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setBusy('upload')
    try {
      // 512px is generous for a circle that renders at 44px on a directory
      // card and 112px on a profile header, and it leaves room for retina
      // screens. skipUnderBytes is dropped to 40KB so that even a modest
      // photo still gets squared down, rather than the 600KB default letting
      // most phone screenshots through untouched.
      const resized = await resizeImage(file, {
        maxLongSide: 512,
        skipUnderBytes: 40 * 1024,
      }).catch(() => file)

      const fd = new FormData()
      fd.append('file', resized)
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? `Upload failed (HTTP ${res.status})`)
        return
      }
      const { avatar_url } = (await res.json()) as { avatar_url: string }
      setAvatarUrl(avatar_url)
      // The directory grid and profile header are server-rendered, so refresh
      // to pull the new photo through rather than leaving stale ones behind.
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemove = async () => {
    setError(null)
    setBusy('remove')
    try {
      const res = await fetch('/api/profile/avatar', { method: 'DELETE' })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? 'Could not remove the photo')
        return
      }
      setAvatarUrl(null)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove the photo')
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground">Profile photo</h2>
      <p className="text-sm text-muted-foreground mt-0.5 mb-4">
        Optional, but it makes you far easier to recognise. Without one, other members see your
        initials.
      </p>

      <div className="flex items-center gap-5">
        <MemberAvatar
          firstName={firstName}
          lastName={lastName}
          avatarUrl={avatarUrl}
          size="md"
        />

        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy !== null}
            >
              {busy === 'upload' ? 'Uploading…' : avatarUrl ? 'Replace photo' : 'Upload photo'}
            </Button>
            {avatarUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={busy !== null}
                className="text-red-700 dark:text-red-300"
              >
                {busy === 'remove' ? 'Removing…' : 'Remove'}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPEG, PNG or WebP. Saved straight away.</p>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </section>
  )
}
