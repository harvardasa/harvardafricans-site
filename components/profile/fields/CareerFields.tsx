'use client'

import { Input } from '@/components/ui/input'
import { INDUSTRIES } from '@/lib/constants'
import { Field, SELECT_CLASSES, type ProfileFormProps } from './_shared'

export function CareerFields({ form }: ProfileFormProps) {
  const { register } = form
  return (
    <>
      <Field label="What do you do?">
        <Input {...register('job_title')} placeholder="Software engineer, grad student, founder…" />
      </Field>
      <Field label="Where?">
        <Input {...register('current_company')} placeholder="Company, school, organization" />
      </Field>
      <Field label="Industry">
        <select {...register('industry')} className={SELECT_CLASSES}>
          <option value="">— Select —</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </Field>
      <Field label="City">
        <Input {...register('city')} placeholder="Cambridge, Lagos, Nairobi…" />
      </Field>
      <Field label="Where do you live now?">
        <Input {...register('country_of_residence')} placeholder="United States, Kenya, UK…" />
      </Field>
    </>
  )
}
