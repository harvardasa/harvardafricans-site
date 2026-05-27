-- v2 schema upgrade — adds Harvard Alumni–style fields + auto-approve support
-- Safe to run on an existing database (uses ALTER TABLE / IF NOT EXISTS).
-- Run this in Supabase SQL Editor AFTER 0001 and 0002.

-- ─── New profile columns ─────────────────────────────────────────────────────

alter table profiles
  add column if not exists prefix                text,         -- Mr./Ms./Mx./Dr./Prof.
  add column if not exists harvard_school_code   text,         -- e.g. COL, HBS, HKS
  add column if not exists degree_abbreviation   text,         -- e.g. AB, MBA, JD, PhD
  add column if not exists house                 text,         -- undergrad only: Eliot, Adams, ...
  add column if not exists contact_email         text,         -- preferred display email
  add column if not exists avatar_url            text,         -- Supabase Storage URL
  add column if not exists last_signed_in_at     timestamptz;  -- updated on every login

-- Index for sorting / showing inactivity
create index if not exists profiles_last_signin_idx
  on profiles (last_signed_in_at);

create index if not exists profiles_school_code_idx
  on profiles (harvard_school_code);

-- ─── Bump short_bio limit from 500 to 600 chars ─────────────────────────────
-- Drop the old check, add the new one. Existing rows that fit 500 still fit 600.

do $$
declare
  cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'public.profiles'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%short_bio%';
  if cname is not null then
    execute format('alter table profiles drop constraint %I', cname);
  end if;
end $$;

alter table profiles
  add constraint profiles_short_bio_length_chk
  check (short_bio is null or char_length(short_bio) <= 600);

-- ─── Backfill harvard_school_code for existing rows ─────────────────────────
-- Maps email_domain → school_code so existing signups don't lose data.

update profiles
   set harvard_school_code = case email_domain
     when 'college.harvard.edu'  then 'COL'
     when 'g.harvard.edu'        then 'GSAS'
     when 'hbs.edu'              then 'HBS'
     when 'hks.harvard.edu'      then 'HKS'
     when 'hls.harvard.edu'      then 'HLS'
     when 'hms.harvard.edu'      then 'HMS'
     when 'hsph.harvard.edu'     then 'HSPH'
     when 'gse.harvard.edu'      then 'GSE'
     when 'gsd.harvard.edu'      then 'GSD'
     when 'hds.harvard.edu'      then 'HDS'
     when 'mail.harvard.edu'     then 'HU'
     when 'alumni.harvard.edu'   then 'ALUM'
     when 'post.harvard.edu'     then 'ALUM'
     when 'harvard.edu'          then 'HU'
     when 'fas.harvard.edu'      then 'FAS'
     when 'seas.harvard.edu'     then 'SEAS'
     else 'HU'
   end
 where harvard_school_code is null;

-- Default contact_email to the auth email for existing rows
update profiles
   set contact_email = email
 where contact_email is null;

-- ─── New audit-log actions allowed: 'hide' ──────────────────────────────────
-- The admin_actions table accepts any text so no schema change needed.
-- This comment is just to document the new action.
