import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: me } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (me?.role !== 'admin') return new NextResponse('Forbidden', { status: 403 })

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
