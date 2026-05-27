'use client'

import { Input } from '@/components/ui/input'
import { Field, PREFIX_OPTIONS, SELECT_CLASSES, type ProfileFormProps } from './_shared'

export function IdentityFields({ form }: ProfileFormProps) {
  const { register, formState: { errors } } = form
  return (
    <>
      <Field label="Prefix">
        <select {...register('prefix')} className={SELECT_CLASSES}>
          {PREFIX_OPTIONS.map((p) => (
            <option key={p} value={p}>{p || '(none)'}</option>
          ))}
        </select>
      </Field>
      <Field label="First name" error={errors.first_name?.message}>
        <Input {...register('first_name')} />
      </Field>
      <Field label="Last name" error={errors.last_name?.message}>
        <Input {...register('last_name')} />
      </Field>
      <Field label="Preferred name (optional)">
        <Input {...register('preferred_name')} placeholder="What people actually call you" />
      </Field>
    </>
  )
}
