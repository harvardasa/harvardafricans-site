# HASA Directory

Members-only alumni and member directory for the **Harvard African Students Association**. Built with Next.js 16, Supabase, and Tailwind CSS.

---

## What it does

- **Magic-link auth** restricted to verified Harvard email domains (undergrad, grad, alumni, faculty/staff)
- **Pending-approval flow** so a HASA admin vets each new signup
- **Searchable, filterable directory** (members-only) with cards, full profile views, and filters by school, country of origin, industry, grad year, and mentorship availability
- **Admin dashboard** — approve/reject pending members, promote admins, delete members, export approved members as CSV
- **Audit log** of every admin action

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database + auth | Supabase (Postgres + Magic-link OTP + RLS) |
| Forms | react-hook-form + zod |
| Hosting | Vercel (free tier) |

---

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com) — pick the region nearest Boston (`us-east-1`)
2. In **Settings → API**, copy these three values:
   - Project URL
   - `anon` public key
   - `service_role` secret key — **never expose this to the browser**
3. In **Settings → Authentication → URL Configuration**, set the Site URL to `http://localhost:3000` for local dev

### 3. Environment variables

Copy the template and fill in your Supabase values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the migrations

In Supabase → **SQL Editor → New query**, paste and run each file in order:

1. `supabase/migrations/0001_initial.sql` — enums, tables, indexes
2. `supabase/migrations/0002_rls.sql` — row-level security policies

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up with your own Harvard email and complete the onboarding form.

### 6. Make yourself an admin

After your first signup, in Supabase **SQL Editor**:

```sql
update profiles
   set approval_status = 'approved',
       role            = 'admin'
 where email = 'your.email@college.harvard.edu';
```

Refresh the app — you should now see the **Admin** link in the nav.

### 7. (Optional) Seed fake data

If you want to populate the directory with ~20 fake profiles for testing:

```bash
npm install -D tsx dotenv
npx tsx scripts/seed-dev-data.ts
```

To remove fake data later:

```sql
delete from profiles where first_name like 'FAKE_%';
-- Then delete the matching users in Supabase → Authentication → Users
```

---

## Deploying to Vercel

1. Push the repo to GitHub
2. In [Vercel](https://vercel.com), import the GitHub repo
3. Under **Environment Variables**, paste the same three Supabase values from `.env.local`
4. Click **Deploy**
5. Once deployed, copy the Vercel URL (e.g. `hasa-directory.vercel.app`)
6. Back in Supabase → **Settings → Authentication → URL Configuration**, set the **Site URL** to that Vercel URL (or your custom domain)

---

## Project structure

```
hasa-directory/
  app/
    (auth)/                  Magic-link login, verify, onboarding wizard
    (app)/                   Authed app shell — directory, profile, admin
    api/auth/callback/       Magic-link callback endpoint
    api/admin/export/        CSV export endpoint (admin-only)
    actions/                 Server actions (admin, profile)
    pending/                 "Awaiting approval" holding page
    page.tsx                 Public landing page
  components/
    ui/                      shadcn/ui primitives
    Navbar.tsx, OnboardingWizard.tsx, ProfileEditForm.tsx,
    DirectoryCard.tsx, DirectoryFilters.tsx,
    AdminApprovalQueue.tsx, AdminMembersTable.tsx, LogoutButton.tsx
  lib/
    supabase/{client,server,admin}.ts  Browser, SSR, and service-role clients
    email-domains.ts                   Harvard domain → track mapping
    types.ts                           DB types
    validations.ts                     Zod schemas
    constants.ts                       Countries, industries, degrees, flags
  supabase/migrations/       0001 schema, 0002 RLS, 0003 admin seed template
  proxy.ts                   Session refresh + route protection (Next.js 16 successor to middleware.ts)
```

---

## Schema overview

```
profiles
  id (uuid)              <- references auth.users(id), cascades on delete
  email, email_domain    <- captured at signup
  affiliation_type       <- undergrad | grad_student | alumni | faculty_or_staff
  approval_status        <- pending | approved | rejected   (admin-controlled)
  role                   <- member | admin                  (admin-controlled)

  first_name, last_name, preferred_name
  harvard_school, degree, concentration_field, graduation_year, is_current_student
  country_of_origin, africa_region, languages text[]
  job_title, current_company, industry, city, country_of_residence
  linkedin_url, personal_website, short_bio (<= 500 chars)

  willing_to_mentor, open_to_coffee_chats, show_email_to_members  <- preferences
  created_at, updated_at

admin_actions
  id, admin_id -> profiles, target_id -> profiles
  action: approve | reject | promote | demote | delete
  note, created_at
```

Row-level security:
- Approved members read approved profiles
- Users read/update their own profile (any status)
- Admins read/update/delete any profile and audit log

---

## Adding a new Harvard school domain

If Harvard adds a new email domain (or you want to support an existing one):

1. Open `lib/email-domains.ts`
2. Add a new entry to `DOMAIN_MAP`:

```ts
'new-school.harvard.edu': { track: 'grad_student', school: 'New School Name' },
```

3. If it's an entirely new school (not just a domain alias), add the school name to `HARVARD_SCHOOLS` so it appears in the dropdown.
4. Commit and redeploy. Existing users on that domain can immediately sign up.

---

## Security notes

- The `service_role` key is **server-only** (`lib/supabase/admin.ts`). It's never bundled into the client.
- Row-level security policies prevent unapproved users from reading other profiles, even if they bypass the middleware.
- Every admin action is logged in `admin_actions` with the admin's UUID and a timestamp.
- The export CSV is gated by both the API route check (`role = 'admin'`) and the page-level redirect.
- The Supabase free tier auto-pauses after 7 days of inactivity. Log into the dashboard weekly during low-traffic periods, or upgrade to Pro.

---

## Future ideas (v2)

- Photo uploads (Supabase Storage)
- In-app "Request a coffee chat" with structured email
- Events calendar
- Job board for alumni -> students
- Annual re-verification (auto-archive after 18 months of inactivity)
- Slack / Discord auto-invite
- Search by language spoken
- Mentor matching algorithm

---

## License

Internal use by Harvard African Students Association. Not for redistribution.
