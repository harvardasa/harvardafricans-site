'use client'

import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fullProfileSchema, type FullProfileData } from '@/lib/validations'
import { upsertProfile } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { Profile } from '@/lib/types'
import {
  IdentityFields,
  HarvardAffiliationFields,
  AfricanConnectionFields,
  CareerFields,
  ContactBioFields,
  MentorshipFields,
} from '@/components/profile/fields'

export default function ProfileEditForm({ profile }: { profile: Profile }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FullProfileData>({
    resolver: zodResolver(fullProfileSchema) as Resolver<FullProfileData>,
    defaultValues: {
      prefix: profile.prefix ?? '',
      first_name: profile.first_name,
      last_name: profile.last_name,
      preferred_name: profile.preferred_name ?? '',
      harvard_school: profile.harvard_school,
      harvard_school_code: profile.harvard_school_code ?? '',
      degree_abbreviation: profile.degree_abbreviation ?? '',
      concentration_field: profile.concentration_field ?? '',
      graduation_year: profile.graduation_year ?? undefined,
      is_current_student: profile.is_current_student,
      house: profile.house ?? '',
      country_of_origin: profile.country_of_origin,
      africa_region: profile.africa_region,
      languages: profile.languages ?? [],
      job_title: profile.job_title ?? '',
      current_company: profile.current_company ?? '',
      industry: profile.industry ?? '',
      city: profile.city ?? '',
      country_of_residence: profile.country_of_residence ?? '',
      contact_email: profile.contact_email ?? profile.email,
      linkedin_url: profile.linkedin_url ?? '',
      personal_website: profile.personal_website ?? '',
      short_bio: profile.short_bio ?? '',
      willing_to_mentor: profile.willing_to_mentor,
      open_to_coffee_chats: profile.open_to_coffee_chats,
      show_email_to_members: profile.show_email_to_members,
    },
  })

  const { handleSubmit } = form

  const onSubmit = async (data: FullProfileData) => {
    setSubmitting(true)
    setServerError(null)
    setSuccess(false)
    const result = await upsertProfile(data)
    if (result && 'error' in result && result.error) {
      setServerError(result.error)
    } else if (result && 'success' in result) {
      setSuccess(true)
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Accordion multiple defaultValue={['identity']} className="bg-white rounded-lg border">
        <AccordionItem value="identity">
          <AccordionTrigger className="px-4">Identity</AccordionTrigger>
          <AccordionContent className="px-4 space-y-3 pb-4">
            <IdentityFields form={form} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="harvard">
          <AccordionTrigger className="px-4">Harvard affiliation</AccordionTrigger>
          <AccordionContent className="px-4 space-y-3 pb-4">
            <HarvardAffiliationFields
              form={form}
              displaySchool={profile.harvard_school}
              toggleId="edit-is-student"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="african">
          <AccordionTrigger className="px-4">African connection</AccordionTrigger>
          <AccordionContent className="px-4 space-y-3 pb-4">
            <AfricanConnectionFields form={form} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="career">
          <AccordionTrigger className="px-4">Career</AccordionTrigger>
          <AccordionContent className="px-4 space-y-3 pb-4">
            <CareerFields form={form} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="contact">
          <AccordionTrigger className="px-4">Contact & bio</AccordionTrigger>
          <AccordionContent className="px-4 space-y-3 pb-4">
            <ContactBioFields form={form} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mentorship">
          <AccordionTrigger className="px-4">Mentorship preferences</AccordionTrigger>
          <AccordionContent className="px-4 space-y-3 pb-4">
            <MentorshipFields form={form} idPrefix="edit" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          Profile updated.
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
