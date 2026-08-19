import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/auth/admin'
import type { Profile } from '@/lib/types'

const CSV_FIELDS: (keyof Profile)[] = [
  'first_name', 'last_name', 'preferred_name', 'email',
  'affiliation_type', 'harvard_school', 'degree', 'concentration_field',
  'graduation_year', 'is_current_student',
  'country_of_origin', 'africa_region',
  'job_title', 'current_company', 'industry', 'city', 'country_of_residence',
  'linkedin_url', 'personal_website', 'short_bio',
  'willing_to_mentor', 'open_to_coffee_chats',
  'created_at',
]

export async function GET() {
  // This endpoint dumps every approved member's PII as CSV, so it runs the
  // full gate: role + allowlist + two-factor.
  const gate = await requireAdminApi()
  if (!gate.ok) return gate.response

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('profiles')
    .select('*')
    .eq('approval_status', 'approved')
    .order('last_name')

  if (error) return new NextResponse(error.message, { status: 500 })

  const csv = toCsv((data as Profile[]) ?? [])
  const filename = `hasa-directory-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

function escapeCsv(v: unknown): string {
  if (v == null) return ''
  const s = Array.isArray(v) ? v.join('; ') : String(v)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCsv(rows: Profile[]): string {
  const header = CSV_FIELDS.join(',')
  const body = rows.map((r) => CSV_FIELDS.map((f) => escapeCsv(r[f])).join(',')).join('\n')
  return `${header}\n${body}\n`
}
