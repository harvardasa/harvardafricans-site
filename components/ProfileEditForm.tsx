'use client'

import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fullProfileSchema, type FullProfileData } from '@/lib/validations'
import { upsertProfile } from '@/app/actions/profile'
import { AFRICAN_COUNTRY_NAMES, COUNTRY_TO_REGION, REGION_LABEL } from '@/lib/countries'
import { INDUSTRIES } from '@/lib/constants'
import { DEGREES_BY_SCHOOL_CODE } from '@/lib/schools'
import { HARVARD_HOUSES } from '@/lib/houses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { Profile, AfricaRegion } from '@/lib/types'

const PREFIX_OPTIONS = ['', 'Mr.', 'Ms.', 'Mx.', 'Dr.', 'Prof.']

export default function ProfileEditForm({ profile }: { profile: Profile }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [languagesInput, setLanguagesInput] = useState('')

  const schoolCode = profile.harvard_school_code ?? ''
  const isUndergrad = schoolCode === 'COL'

  const form = useForm<FullProfileData>({
    resolver: zodResolver(fullProfileSchema) as Resolver<FullProfileData>,
    defaultValues: {
      prefix: profile.prefix ?? '',
      first_name: profile.first_name,
      last_name: profile.last_name,
      preferred_name: profile.preferred_name ?? '',
      harvard_school: profile.harvard_school,
      harvard_school_code: schoolCode,
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

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form
  const values = watch()
  const bio = watch('short_bio') ?? ''
  const isCurrentStudent = watch('is_current_student')
  const country = watch('country_of_origin')
  const degreeOptions = DEGREES_BY_SCHOOL_CODE[schoolCode] ?? []

  const handleCountryChange = (newCountry: string) => {
    setValue('country_of_origin', newCountry)
    if (newCountry && COUNTRY_TO_REGION[newCountry]) {
      setValue('africa_region', COUNTRY_TO_REGION[newCountry])
    }
  }

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

  const addLanguage = () => {
    const lang = languagesInput.trim()
    if (lang && !values.languages.includes(lang)) {
      setValue('languages', [...values.languages, lang])
      setLanguagesInput('')
    }
  }

  const removeLanguage = (lang: string) => {
    setValue('languages', values.languages.filter((l) => l !== lang))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Accordion multiple defaultValue={['identity']} className="bg-white rounded-lg border">
        <AccordionItem value="identity">
          <AccordionTrigger className="px-4">Identity</AccordionTrigger>
          <AccordionContent className="px-4 space-y-3 pb-4">
            <Field label="Prefix">
              <select
                {...register('prefix')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
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
            <Field label="Preferred name">
              <Input {...register('preferred_name')} />
            </Field>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="harvard">
          <AccordionTrigger className="px-4">Harvard affiliation</AccordionTrigger>
          <AccordionContent className="px-4 space-y-3 pb-4">
            <Field label="School (verified — cannot change)">
              <Input value={profile.harvard_school} disabled className="bg-gray-50" />
              <input type="hidden" {...register('harvard_school')} />
              <input type="hidden" {...register('harvard_school_code')} />
            </Field>
            <Field label="Degree">
              {degreeOptions.length > 0 ? (
                <select
                  {...register('degree_abbreviation')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">— Select —</option>
                  {degreeOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <Input {...register('degree_abbreviation')} />
              )}
            </Field>
            <Field label="Concentration / field">
              <Input {...register('concentration_field')} />
            </Field>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_current_student_edit"
                checked={isCurrentStudent}
                onCheckedChange={(v) => setValue('is_current_student', !!v)}
              />
              <Label htmlFor="is_current_student_edit" className="font-normal">
                Currently a student
              </Label>
            </div>
            <Field label="Graduation year">
              <Input type="number" {...register('graduation_year')} />
            </Field>
            {isUndergrad && (
              <Field label="House">
                <select
                  {...register('house')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">— Select —</option>
                  {HARVARD_HOUSES.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </Field>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="african">
          <AccordionTrigger className="px-4">African connection</AccordionTrigger>
          <AccordionContent className="px-4 space-y-3 pb-4">
            <Field label="Country of origin" error={errors.country_of_origin?.message}>
              <select
                value={country ?? ''}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">— Select —</option>
                {AFRICAN_COUNTRY_NAMES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Region">
              <select
                value={values.africa_region ?? ''}
                onChange={(e) => setValue('africa_region', (e.target.value || null) as AfricaRegion | null)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">— Select —</option>
                {Object.entries(REGION_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Languages">
              <div className="flex gap-2">
                <Input
                  value={languagesInput}
                  onChange={(e) => setLanguagesInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addLanguage()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addLanguage}>Add</Button>
              </div>
              {values.languages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {values.languages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => removeLanguage(lang)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full"
                    >
                      {lang} ✕
                    </button>
                  ))}
                </div>
              )}
            </Field>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="career">
          <AccordionTrigger className="px-4">Career</AccordionTrigger>
          <AccordionContent className="px-4 space-y-3 pb-4">
            <Field label="Current role / title">
              <Input {...register('job_title')} />
            </Field>
            <Field label="Current company">
              <Input {...register('current_company')} />
            </Field>
            <Field label="Industry">
              <select
                {...register('industry')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">— Select —</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="City">
              <Input {...register('city')} />
            </Field>
            <Field label="Country of residence">
              <Input {...register('country_of_residence')} />
            </Field>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="contact">
          <AccordionTrigger className="px-4">Contact & bio</AccordionTrigger>
          <AccordionContent className="px-4 space-y-3 pb-4">
            <Field label="Preferred contact email" error={errors.contact_email?.message}>
              <Input {...register('contact_email')} />
              <p className="text-xs text-gray-500 mt-1">
                Use a personal email you&apos;ll keep checking after you graduate.
              </p>
            </Field>
            <Field label="LinkedIn URL" error={errors.linkedin_url?.message}>
              <Input {...register('linkedin_url')} />
            </Field>
            <Field label="Personal website" error={errors.personal_website?.message}>
              <Input {...register('personal_website')} />
            </Field>
            <Field
              label={`Short bio — ${bio.length}/600`}
              error={errors.short_bio?.message}
            >
              <Textarea {...register('short_bio')} rows={4} maxLength={600} />
            </Field>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mentorship">
          <AccordionTrigger className="px-4">Mentorship preferences</AccordionTrigger>
          <AccordionContent className="px-4 space-y-3 pb-4">
            <ToggleRow
              id="m1"
              label="I'm willing to mentor younger members"
              checked={values.willing_to_mentor}
              onChange={(v) => setValue('willing_to_mentor', v)}
            />
            <ToggleRow
              id="m2"
              label="I'm open to coffee chats from other members"
              checked={values.open_to_coffee_chats}
              onChange={(v) => setValue('open_to_coffee_chats', v)}
            />
            <ToggleRow
              id="m3"
              label="Show my contact email to other approved members"
              checked={values.show_email_to_members}
              onChange={(v) => setValue('show_email_to_members', v)}
            />
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

function Field({
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

function ToggleRow({
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
