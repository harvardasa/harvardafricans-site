'use client'

import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fullProfileSchema, type FullProfileData } from '@/lib/validations'
import { upsertProfile } from '@/app/actions/profile'
import { REGION_LABEL } from '@/lib/countries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  IdentityFields,
  HarvardAffiliationFields,
  AfricanConnectionFields,
  CareerFields,
  ContactBioFields,
  MentorshipFields,
} from '@/components/profile/fields'

const STEPS = [
  { title: 'Your name', desc: 'What should we call you?' },
  { title: 'Harvard', desc: 'When were you here, and what did you study?' },
  { title: 'African connection', desc: 'Where you’re from — pick a country, and any languages you speak.' },
  { title: 'Now', desc: 'What you do these days. All optional.' },
  { title: 'How to reach you', desc: 'Best email, links, and a few lines about you.' },
  { title: 'Open to talk?', desc: 'Tell other members how you want to connect.' },
  { title: 'Review', desc: 'Quick look before we save it.' },
] as const

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

  const { handleSubmit, watch, trigger } = form
  const values = watch()

  const next = async () => {
    const perStepRequiredFields: Record<number, (keyof FullProfileData)[]> = {
      0: ['first_name', 'last_name'],
      1: ['harvard_school'],
      2: ['country_of_origin'],
      4: ['contact_email', 'linkedin_url', 'personal_website', 'short_bio'],
    }
    const fields = perStepRequiredFields[step] ?? []
    const ok = fields.length === 0 || (await trigger(fields))
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
    // success path redirects via server action
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-serif font-bold text-gray-900">Welcome to HASA.</h1>
          <p className="text-sm text-gray-500 mt-1">Signed in as {email}</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{STEPS[step].title}</span>
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
            <CardTitle>{STEPS[step].title}</CardTitle>
            <CardDescription>{STEPS[step].desc}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {step === 0 && <IdentityFields form={form} />}
              {step === 1 && (
                <HarvardAffiliationFields
                  form={form}
                  displaySchool={defaultSchool}
                  toggleId="onboarding-is-student"
                />
              )}
              {step === 2 && <AfricanConnectionFields form={form} />}
              {step === 3 && <CareerFields form={form} />}
              {step === 4 && <ContactBioFields form={form} />}
              {step === 5 && <MentorshipFields form={form} idPrefix="onboarding" />}
              {step === 6 && <ReviewSummary data={values} email={email} />}

              {serverError && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                <Button type="button" variant="outline" onClick={prev} disabled={step === 0 || submitting}>
                  Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={next}>Next</Button>
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
