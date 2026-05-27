/**
 * Seed ~20 fake profiles for local development.
 *
 * Usage:
 *   1. Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env.local
 *   2. From project root: npx tsx scripts/seed-dev-data.ts
 *
 * All names are prefixed with "FAKE_" so you can find and delete them later:
 *   delete from profiles where first_name like 'FAKE_%';
 *   -- Then in Supabase Auth → Users, delete the matching auth users.
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const FAKES = [
  { fn: 'Amara', ln: 'Okonkwo', country: 'Nigeria', school: 'Harvard College', aff: 'undergrad', email: 'amara.fake@college.harvard.edu', region: 'west', year: 2026, mentor: true },
  { fn: 'Kwame', ln: 'Mensah', country: 'Ghana', school: 'Harvard Business School', aff: 'grad_student', email: 'kwame.fake@hbs.edu', region: 'west', year: 2025, mentor: true },
  { fn: 'Tigist', ln: 'Bekele', country: 'Ethiopia', school: 'Harvard Kennedy School', aff: 'grad_student', email: 'tigist.fake@hks.harvard.edu', region: 'east', year: 2025, mentor: false },
  { fn: 'Lerato', ln: 'Mokoena', country: 'South Africa', school: 'Harvard Law School', aff: 'grad_student', email: 'lerato.fake@hls.harvard.edu', region: 'southern', year: 2024, mentor: true },
  { fn: 'Youssef', ln: 'El-Sayed', country: 'Egypt', school: 'Harvard Medical School', aff: 'grad_student', email: 'youssef.fake@hms.harvard.edu', region: 'north', year: 2027, mentor: false },
  { fn: 'Chioma', ln: 'Adeyemi', country: 'Nigeria', school: 'Harvard College', aff: 'undergrad', email: 'chioma.fake@college.harvard.edu', region: 'west', year: 2027, mentor: false },
  { fn: 'Kofi', ln: 'Asante', country: 'Ghana', school: 'Harvard University (Alumni)', aff: 'alumni', email: 'kofi.fake@alumni.harvard.edu', region: 'west', year: 2018, mentor: true },
  { fn: 'Naledi', ln: 'Khumalo', country: 'South Africa', school: 'Harvard University (Alumni)', aff: 'alumni', email: 'naledi.fake@alumni.harvard.edu', region: 'southern', year: 2015, mentor: true },
  { fn: 'Hassan', ln: 'Diallo', country: 'Senegal', school: 'Harvard College', aff: 'undergrad', email: 'hassan.fake@college.harvard.edu', region: 'west', year: 2025, mentor: false },
  { fn: 'Wanjiru', ln: 'Kamau', country: 'Kenya', school: 'Harvard T.H. Chan School of Public Health', aff: 'grad_student', email: 'wanjiru.fake@hsph.harvard.edu', region: 'east', year: 2026, mentor: true },
  { fn: 'Tendai', ln: 'Moyo', country: 'Zimbabwe', school: 'Harvard Graduate School of Education', aff: 'grad_student', email: 'tendai.fake@gse.harvard.edu', region: 'southern', year: 2024, mentor: true },
  { fn: 'Adaeze', ln: 'Nwosu', country: 'Nigeria', school: 'Harvard University (Alumni)', aff: 'alumni', email: 'adaeze.fake@alumni.harvard.edu', region: 'west', year: 2010, mentor: true },
  { fn: 'Salif', ln: 'Konaté', country: 'Mali', school: 'Harvard Graduate School of Design', aff: 'grad_student', email: 'salif.fake@gsd.harvard.edu', region: 'west', year: 2025, mentor: false },
  { fn: 'Rania', ln: 'Saleh', country: 'Morocco', school: 'Harvard College', aff: 'undergrad', email: 'rania.fake@college.harvard.edu', region: 'north', year: 2026, mentor: false },
  { fn: 'Joseph', ln: 'Abebe', country: 'Ethiopia', school: 'Harvard College', aff: 'undergrad', email: 'joseph.fake@college.harvard.edu', region: 'east', year: 2027, mentor: false },
  { fn: 'Fatou', ln: 'Ndiaye', country: 'Senegal', school: 'Harvard Business School', aff: 'grad_student', email: 'fatou.fake@hbs.edu', region: 'west', year: 2024, mentor: true },
  { fn: 'Esi', ln: 'Boateng', country: 'Ghana', school: 'Harvard University', aff: 'faculty_or_staff', email: 'esi.fake@harvard.edu', region: 'west', year: null, mentor: true },
  { fn: 'Ibrahim', ln: 'Diop', country: 'Senegal', school: 'Harvard Kennedy School', aff: 'grad_student', email: 'ibrahim.fake@hks.harvard.edu', region: 'west', year: 2025, mentor: false },
  { fn: 'Zola', ln: 'Mthembu', country: 'South Africa', school: 'Harvard College', aff: 'undergrad', email: 'zola.fake@college.harvard.edu', region: 'southern', year: 2026, mentor: true },
  { fn: 'Bisi', ln: 'Folarin', country: 'Nigeria', school: 'SEAS', aff: 'faculty_or_staff', email: 'bisi.fake@seas.harvard.edu', region: 'west', year: null, mentor: true },
]

async function seed() {
  console.log(`Seeding ${FAKES.length} fake profiles…`)

  for (const f of FAKES) {
    // Create the auth user (idempotent — email_confirm so they bypass magic link)
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: f.email,
      email_confirm: true,
    })

    if (authErr && !authErr.message.includes('already')) {
      console.error(`Failed to create ${f.email}:`, authErr.message)
      continue
    }

    const userId = authData?.user?.id
    if (!userId) {
      // User likely already exists — fetch them
      const { data: existing } = await supabase.auth.admin.listUsers()
      const found = existing.users.find((u) => u.email === f.email)
      if (!found) {
        console.error(`Could not resolve user for ${f.email}`)
        continue
      }
    }

    const id = userId ?? (await supabase.auth.admin.listUsers()).data.users.find((u) => u.email === f.email)?.id
    if (!id) continue

    const { error: profileErr } = await supabase.from('profiles').upsert({
      id,
      email: f.email,
      email_domain: f.email.split('@')[1],
      affiliation_type: f.aff as 'undergrad' | 'grad_student' | 'alumni' | 'faculty_or_staff',
      approval_status: 'approved',
      role: 'member',
      first_name: `FAKE_${f.fn}`,
      last_name: f.ln,
      harvard_school: f.school,
      harvard_school_code: f.aff === 'undergrad' ? 'COL' : f.aff === 'alumni' ? 'ALUM' : 'GSAS',
      graduation_year: f.year,
      is_current_student: f.aff === 'undergrad' || f.aff === 'grad_student',
      country_of_origin: f.country,
      africa_region: f.region as 'north' | 'west' | 'east' | 'central' | 'southern' | 'diaspora',
      languages: ['English'],
      willing_to_mentor: f.mentor,
      open_to_coffee_chats: f.mentor,
      show_email_to_members: true,
      industry: ['Technology', 'Finance / Banking', 'Consulting', 'Healthcare / Medicine', 'Government / Public Policy'][Math.floor(Math.random() * 5)],
      job_title: f.aff === 'alumni' || f.aff === 'faculty_or_staff' ? 'Senior Associate' : null,
      current_company: f.aff === 'alumni' ? 'Example Corp' : null,
    })

    if (profileErr) console.error(`Profile error for ${f.email}:`, profileErr.message)
    else console.log(`  ✓ ${f.fn} ${f.ln}`)
  }

  console.log('Done. Remember: these are fake. Delete before going to production:')
  console.log("  delete from profiles where first_name like 'FAKE_%';")
}

seed().catch(console.error)
