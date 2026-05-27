'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { UseFormReturn } from 'react-hook-form'
import type { FullProfileData } from '@/lib/validations'

export type ProfileFormProps = {
  form: UseFormReturn<FullProfileData>
}

export function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

export function ToggleRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <Label htmlFor={id} className="font-normal">{label}</Label>
    </div>
  )
}

export const PREFIX_OPTIONS = ['', 'Mr.', 'Ms.', 'Mx.', 'Dr.', 'Prof.']

export const SELECT_CLASSES =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm'
