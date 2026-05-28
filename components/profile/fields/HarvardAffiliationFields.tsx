'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { DEGREES_BY_SCHOOL_CODE } from '@/lib/schools'
import { HARVARD_HOUSES } from '@/lib/houses'
import { Field, SELECT_CLASSES, type ProfileFormProps } from './_shared'

export function HarvardAffiliationFields({
  form,
  displaySchool,
  toggleId = 'is_current_student',
}: ProfileFormProps & {
  // Read-only school name to show (verified from email — never editable)
  displaySchool: string
  // Unique ID for the checkbox so two instances on the same page don't collide
  toggleId?: string
}) {
  const { register, watch, setValue, formState: { errors } } = form
  const schoolCode = watch('harvard_school_code') ?? ''
  const isCurrentStudent = watch('is_current_student')
  const isUndergrad = schoolCode === 'COL'
  const degreeOptions = DEGREES_BY_SCHOOL_CODE[schoolCode] ?? []

  return (
    <>
      <Field label="Harvard school (we already verified this)">
        <Input value={displaySchool} disabled className="bg-gray-50" />
        <input type="hidden" {...register('harvard_school')} />
        <input type="hidden" {...register('harvard_school_code')} />
      </Field>
      <Field label="Degree (optional)">
        {degreeOptions.length > 0 ? (
          <select {...register('degree_abbreviation')} className={SELECT_CLASSES}>
            <option value="">— Select —</option>
            {degreeOptions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        ) : (
          <Input {...register('degree_abbreviation')} placeholder="e.g., MBA, PhD, AB" />
        )}
      </Field>
      <Field label="What did you study? (optional)">
        <Input
          {...register('concentration_field')}
          placeholder="Government, CS, Economics — whatever your concentration or field"
        />
      </Field>
      <div className="flex items-center gap-2">
        <Checkbox
          id={toggleId}
          checked={isCurrentStudent}
          onCheckedChange={(v) => setValue('is_current_student', !!v)}
        />
        <Label htmlFor={toggleId} className="font-normal">
          I&apos;m still a student
        </Label>
      </div>
      <Field
        label={isCurrentStudent ? 'When do you graduate?' : 'When did you graduate?'}
        error={errors.graduation_year?.message}
      >
        <Input type="number" {...register('graduation_year')} placeholder="e.g., 2028" />
      </Field>
      {isUndergrad && (
        <Field label="House (Harvard College)">
          <select {...register('house')} className={SELECT_CLASSES}>
            <option value="">— Select —</option>
            {HARVARD_HOUSES.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </Field>
      )}
    </>
  )
}
