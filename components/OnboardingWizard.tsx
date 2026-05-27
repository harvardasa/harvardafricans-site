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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const STEPS = [
  'Identity',
  'Harvard affiliation',
  'African connection',
  'Career',
  'Contact & bio',
  'Mentorship',
  'Review',
]

const PREFIX_OPTIONS = ['', 'Mr.', 'Ms.', 'Mx.', 'Dr.', 'Prof.']

export default function OnboardingWizard({
  email,
  defaultSchool,
  defaultSchoolCode,
  affiliationType,
}: {
  email: string
  defaultSchool: string
  defaultSchoolCode: string
  affiliationType: string
}) {
  const [step, setStep] = useState(0)
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [languagesInput, setLanguagesInput] = useState('')

  const isUndergrad = defaultSchoolCode === 'COL'

  const form = useForm<FullProfileData>({
    resolver: zodResolver(fullProfileSchema) as Resolver<FullProfileData>,
    mode: 'onBlur',
    defaultValues: {
      prefix: '',
      first_name: '',
      last_name: '',
      preferred_name: '',
      harvard_school: defaultSchool,
      harvard_school_code: defaultSchoolCode,
      degree_abbreviation: '',
      concentration_field: '',
      graduation_year: undefined,
      is_current_student: affiliationType !== 'alumni',
      house: '',
      country_of_origin: '',
      africa_region: null,
      languages: [],
      job_title: '',
      current_company: '',
      industry: '',
      city: '',
      country_of_residence: '',
      contact_email: email,
      linkedin_url: '',
      personal_website: '',
      short_bio: '',
      willing_to_mentor: false,
      open_to_coffee_chats: false,
      show_email_to_members: true,
    },
  })

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = form
  const values = watch()
  const bio = watch('short_bio') ?? ''
  const isCurrentStudent = watch('is_current_student')
  const country = watch('country_of_origin')

  // Auto-derive africa_region when country changes
  const handleCountryChange = (newCountry: string) => {
    setValue('country_of_origin', newCountry)
    if (newCountry && COUNTRY_TO_REGION[newCountry]) {
      setValue('africa_region', COUNTRY_TO_REGION[newCountry])
    }
  }

  const next = async () => {
    let fieldsToValidate: (keyof FullProfileData)[] = []
    switch (step) {
      case 0: fieldsToValidate = ['first_name', 'last_name']; break
      case 1: fieldsToValidate = ['harvard_school']; break
      case 2: fieldsToValidate = ['country_of_origin']; break
      case 4: fieldsToValidate = ['contact_email', 'linkedin_url', 'personal_website', 'short_bio']; break
    }
    const ok = fieldsToValidate.length === 0 || await trigger(fieldsToValidate)
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const onSubmit = async (data: FullProfileData) => {
    setSubmitting(true)
    setServerError(null)
    const result = await upsertProfile(data)
    if (result && 'error' in result && result.error) {
      setServerError(result.error)
      setSubmitting(false)
    }
    // On success, server action redirects — no further action needed
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

  const degreeOptions = DEGREES_BY_SCHOOL_CODE[defaultSchoolCode] ?? []

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-serif font-bold text-gray-900">Welcome to HASA Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Signed in as {email}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{STEPS[step]}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-700 h-2 rounded-full transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step]}</CardTitle>
            {step === 0 && <CardDescription>Tell us your name.</CardDescription>}
            {step === 1 && <CardDescription>Your Harvard affiliation.</CardDescription>}
            {step === 2 && <CardDescription>Your connection to Africa.</CardDescription>}
            {step === 3 && <CardDescription>What are you doing now? (All optional.)</CardDescription>}
            {step === 4 && <CardDescription>How can other members reach and learn about you?</CardDescription>}
            {step === 5 && <CardDescription>Help us match members who want to support one another.</CardDescription>}
            {step === 6 && <CardDescription>Review your information and submit.</CardDescription>}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Step 0: Identity */}
              {step === 0 && (
                <>
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
                  <Field label="Preferred name (optional)">
                    <Input {...register('preferred_name')} placeholder="What people actually call you" />
                  </Field>
                </>
              )}

              {/* Step 1: Harvard affiliation */}
              {step === 1 && (
                <>
                  <Field label="Harvard school (verified from your email)">
                    <Input value={defaultSchool} disabled className="bg-gray-50" />
                    <input type="hidden" {...register('harvard_school')} />
                    <input type="hidden" {...register('harvard_school_code')} />
                  </Field>
                  <Field label="Degree (optional)">
                    {degreeOptions.length > 0 ? (
                      <select
                        {...register('degree_abbreviation')}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      >
                        <option value="">— Select —</option>
                        {degreeOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    ) : (
                      <Input {...register('degree_abbreviation')} placeholder="e.g., MBA, PhD, AB" />
                    )}
                  </Field>
                  <Field label="Concentration / field of study (optional)">
                    <Input {...register('concentration_field')} placeholder="e.g., Government, Computer Science" />
                  </Field>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="is_current_student"
                      checked={isCurrentStudent}
                      onCheckedChange={(v) => setValue('is_current_student', !!v)}
                    />
                    <Label htmlFor="is_current_student" className="font-normal">
                      I&apos;m currently a student
                    </Label>
                  </div>
                  <Field
                    label={isCurrentStudent ? 'Expected graduation year' : 'Graduation year'}
                    error={errors.graduation_year?.message}
                  >
                    <Input type="number" {...register('graduation_year')} placeholder="e.g., 2028" />
                  </Field>
                  {isUndergrad && (
                    <Field label="House (Harvard College)">
                      <select
                        {...register('house')}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      >
                        <option value="">— Select —</option>
                        {HARVARD_HOUSES.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </Field>
                  )}
                </>
              )}

              {/* Step 2: African connection */}
              {step === 2 && (
                <>
                  <Field label="Country of origin / heritage" error={errors.country_of_origin?.message}>
                    <select
                      value={country ?? ''}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="">— Select —</option>
                      {AFRICAN_COUNTRY_NAMES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Region of Africa">
                    <select
                      {...register('africa_region')}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="">— Select —</option>
                      {Object.entries(REGION_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Languages spoken (optional)">
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
                        placeholder="Type a language, press Enter"
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
                </>
              )}

              {/* Step 3: Career */}
              {step === 3 && (
                <>
                  <Field label="Current role / title">
                    <Input {...register('job_title')} placeholder="e.g., Software Engineer" />
                  </Field>
                  <Field label="Current company / organization">
                    <Input {...register('current_company')} placeholder="e.g., Google" />
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
                    <Input {...register('city')} placeholder="e.g., Cambridge" />
                  </Field>
                  <Field label="Country of residence">
                    <Input {...register('country_of_residence')} placeholder="e.g., United States" />
                  </Field>
                </>
              )}

              {/* Step 4: Contact + bio */}
              {step === 4 && (
                <>
                  <Field label="Preferred contact email" error={errors.contact_email?.message}>
                    <Input {...register('contact_email')} placeholder="you@example.com" />
                    <p className="text-xs text-gray-500 mt-1">
                      We use your Harvard email to verify you, but this is where members will reach you.
                      Use a personal email you&apos;ll keep checking after you graduate.
                    </p>
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
              )}

              {/* Step 5: Mentorship */}
              {step === 5 && (
                <>
                  <ToggleRow
                    id="willing_to_mentor"
                    label="I'm willing to mentor younger members"
                    checked={values.willing_to_mentor}
                    onChange={(v) => setValue('willing_to_mentor', v)}
                  />
                  <ToggleRow
                    id="open_to_coffee_chats"
                    label="I'm open to coffee chats from other members"
                    checked={values.open_to_coffee_chats}
                    onChange={(v) => setValue('open_to_coffee_chats', v)}
                  />
                  <ToggleRow
                    id="show_email_to_members"
                    label="Show my contact email to other approved members"
                    checked={values.show_email_to_members}
                    onChange={(v) => setValue('show_email_to_members', v)}
                  />
                </>
              )}

              {/* Step 6: Review */}
              {step === 6 && (
                <ReviewSummary data={values} email={email} />
              )}

              {serverError && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prev}
                  disabled={step === 0 || submitting}
                >
                  Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={next}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
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

function ReviewSummary({ data, email }: { data: FullProfileData; email: string }) {
  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
    <div className="flex border-b py-2 text-sm">
      <span className="w-1/3 text-gray-500">{k}</span>
      <span className="w-2/3">{v || <span className="text-gray-400 italic">(not set)</span>}</span>
    </div>
  )
  return (
    <div>
      <Row k="Name" v={`${data.prefix ? data.prefix + ' ' : ''}${data.first_name} ${data.last_name}${data.preferred_name ? ` ("${data.preferred_name}")` : ''}`} />
      <Row k="Harvard email" v={email} />
      <Row k="School" v={`${data.harvard_school} (${data.harvard_school_code})`} />
      <Row k="Degree" v={data.degree_abbreviation} />
      <Row k="Concentration" v={data.concentration_field} />
      <Row k="Grad year" v={data.graduation_year} />
      {data.harvard_school_code === 'COL' && <Row k="House" v={data.house} />}
      <Row k="Current student" v={data.is_current_student ? 'Yes' : 'No'} />
      <Row k="Country of origin" v={data.country_of_origin} />
      <Row k="Region" v={data.africa_region ? REGION_LABEL[data.africa_region] : null} />
      <Row k="Languages" v={data.languages.join(', ')} />
      <Row k="Role" v={data.job_title} />
      <Row k="Company" v={data.current_company} />
      <Row k="Industry" v={data.industry} />
      <Row k="Location" v={[data.city, data.country_of_residence].filter(Boolean).join(', ')} />
      <Row k="Contact email" v={data.contact_email} />
      <Row k="LinkedIn" v={data.linkedin_url} />
      <Row k="Website" v={data.personal_website} />
      <Row k="Bio" v={data.short_bio} />
      <Row k="Mentor" v={data.willing_to_mentor ? 'Yes' : 'No'} />
      <Row k="Coffee chats" v={data.open_to_coffee_chats ? 'Yes' : 'No'} />
      <Row k="Show contact email" v={data.show_email_to_members ? 'Yes' : 'No'} />
    </div>
  )
}
