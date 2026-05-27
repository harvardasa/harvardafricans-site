'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, type ProfileFormProps } from './_shared'

export function ContactBioFields({
  form,
  showEmailHelper = true,
}: ProfileFormProps & { showEmailHelper?: boolean }) {
  const { register, watch, formState: { errors } } = form
  const bio = watch('short_bio') ?? ''
  return (
    <>
      <Field label="Preferred contact email" error={errors.contact_email?.message}>
        <Input {...register('contact_email')} placeholder="you@example.com" />
        {showEmailHelper && (
          <p className="text-xs text-gray-500 mt-1">
            We use your Harvard email to verify you, but this is where members will reach you.
            Use a personal email you&apos;ll keep checking after you graduate.
          </p>
        )}
      </Field>
      <Field label="LinkedIn URL (optional)" error={errors.linkedin_url?.message}>
        <Input {...register('linkedin_url')} placeholder="https://linkedin.com/in/yourname" />
      </Field>
      <Field label="Personal website (optional)" error={errors.personal_website?.message}>
        <Input {...register('personal_website')} placeholder="https://yoursite.com" />
      </Field>
      <Field
        label={`Short bio (optional) — ${bio.length}/600`}
        error={errors.short_bio?.message}
      >
        <Textarea
          {...register('short_bio')}
          rows={4}
          maxLength={600}
          placeholder="A few sentences about you — research interests, projects, what you'd want other HASA members to know."
        />
      </Field>
    </>
  )
}
