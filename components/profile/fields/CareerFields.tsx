'use client'

import { Input } from '@/components/ui/input'
import { INDUSTRIES } from '@/lib/constants'
import { Field, SELECT_CLASSES, type ProfileFormProps } from './_shared'

export function CareerFields({ form }: ProfileFormProps) {
  const { register } = form
  return (
    <>
      <Field label="Current role / title">
        <Input {...register('job_title')} placeholder="e.g., Software Engineer" />
      </Field>
      <Field label="Current company / organization">
        <Input {...register('current_company')} placeholder="e.g., Google" />
      </Field>
      <Field label="Industry">
        <select {...register('industry')} className={SELECT_CLASSES}>
          <option value="">— Select —</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </Field>
      <Field label="City">
        <Input {...register('city')} placeholder="e.g., Cambridge" />
      </Field>
      <Field label="Country of residence">
        <Input {...register('country_of_residence')} placeholder="e.g., United States" />
      </Field>
    </>
  )
}
