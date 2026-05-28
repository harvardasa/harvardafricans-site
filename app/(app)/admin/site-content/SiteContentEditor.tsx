'use client'

import { useState, useTransition } from 'react'
import { updateSiteContent } from '@/app/actions/cms'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

type ContentMap = Record<string, string | string[]>

export default function SiteContentEditor({
  content,
}: {
  content: ContentMap
}) {
  const [draft, setDraft] = useState<ContentMap>(content)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const saveOne = (key: string) => {
    setErr(null)
    setMsg(null)
    setSavingKey(key)
    startTransition(async () => {
      const res = await updateSiteContent(key, draft[key])
      setSavingKey(null)
      if (res.error) setErr(res.error)
      else setMsg(`Saved "${key}".`)
    })
  }

  const updateString = (key: string, value: string) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const updateArrayItem = (key: string, i: number, value: string) =>
    setDraft((d) => {
      const arr = Array.isArray(d[key]) ? [...(d[key] as string[])] : []
      arr[i] = value
      return { ...d, [key]: arr }
    })

  const addArrayItem = (key: string) =>
    setDraft((d) => ({
      ...d,
      [key]: [...(Array.isArray(d[key]) ? (d[key] as string[]) : []), ''],
    }))

  const removeArrayItem = (key: string, i: number) =>
    setDraft((d) => {
      const arr = Array.isArray(d[key]) ? [...(d[key] as string[])] : []
      arr.splice(i, 1)
      return { ...d, [key]: arr }
    })

  return (
    <div className="space-y-4">
      {msg && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">{msg}</div>
      )}
      {err && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>
      )}

      {Object.entries(draft).map(([key, value]) => {
        const isArray = Array.isArray(value)
        const isLong = !isArray && typeof value === 'string' && value.length > 80
        return (
          <div key={key} className="rounded-md border bg-white p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-mono text-xs text-gray-500">{key}</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveOne(key)}
                disabled={isPending && savingKey === key}
              >
                {isPending && savingKey === key ? 'Saving…' : 'Save'}
              </Button>
            </div>
            {isArray ? (
              <div className="space-y-2">
                {(value as string[]).map((v: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={v}
                      onChange={(e) => updateArrayItem(key, i, e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem(key, i)}
                      className="text-red-700"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addArrayItem(key)}>
                  + Add item
                </Button>
              </div>
            ) : isLong ? (
              <Textarea
                rows={4}
                value={value as string}
                onChange={(e) => updateString(key, e.target.value)}
              />
            ) : (
              <Input
                value={value as string}
                onChange={(e) => updateString(key, e.target.value)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
