'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AFRICAN_COUNTRY_NAMES, COUNTRY_TO_REGION, REGION_LABEL } from '@/lib/countries'
import type { AfricaRegion } from '@/lib/types'
import { Field, SELECT_CLASSES, type ProfileFormProps } from './_shared'

export function AfricanConnectionFields({ form }: ProfileFormProps) {
  const { watch, setValue, formState: { errors } } = form
  const country = watch('country_of_origin')
  const region = watch('africa_region')
  const languages = watch('languages') ?? []

  const [languagesInput, setLanguagesInput] = useState('')

  const onCountryChange = (next: string) => {
    setValue('country_of_origin', next)
    if (next && COUNTRY_TO_REGION[next]) {
      setValue('africa_region', COUNTRY_TO_REGION[next])
    }
  }

  const addLanguage = () => {
    const lang = languagesInput.trim()
    if (lang && !languages.includes(lang)) {
      setValue('languages', [...languages, lang])
      setLanguagesInput('')
    }
  }

  const removeLanguage = (lang: string) => {
    setValue('languages', languages.filter((l) => l !== lang))
  }

  return (
    <>
      <Field label="Country of origin / heritage" error={errors.country_of_origin?.message}>
        <select
          value={country ?? ''}
          onChange={(e) => onCountryChange(e.target.value)}
          className={SELECT_CLASSES}
        >
          <option value="">— Select —</option>
          {AFRICAN_COUNTRY_NAMES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Region of Africa">
        <select
          value={region ?? ''}
          onChange={(e) => setValue('africa_region', (e.target.value || null) as AfricaRegion | null)}
          className={SELECT_CLASSES}
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
        {languages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {languages.map((lang) => (
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
  )
}
