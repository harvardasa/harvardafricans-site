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
      <Field label="Best email to reach you" error={errors.contact_email?.message}>
        <Input {...register('contact_email')} placeholder="you@example.com" />
        {showEmailHelper && (
          <p className="text-xs text-gray-500 mt-1">
            We use your Harvard email to verify you, but this is the one members will see.
            Pick one you&apos;ll still check after graduation.
          </p>
        )}
      </Field>
      <Field label="LinkedIn (optional)" error={errors.linkedin_url?.message}>
        <Input {...register('linkedin_url')} placeholder="https://linkedin.com/in/yourname" />
      </Field>
      <Field label="Personal website (optional)" error={errors.personal_website?.message}>
        <Input {...register('personal_website')} placeholder="https://yoursite.com" />
      </Field>
      <Field
        label={`Tell us about yourself (optional) — ${bio.length}/600`}
        error={errors.short_bio?.message}
      >
        <Textarea
          {...register('short_bio')}
          rows={4}
          maxLength={600}
          placeholder="Up to 600 characters. The more specific, the easier it is for someone to find you."
        />
      </Field>
    </>
  )
}
