-- HASA Alumni Directory — initial schema
-- Run this in Supabase SQL Editor (Settings → SQL Editor → New query)

-- ─── Enums ───────────────────────────────────────────────────────────────────

create type affiliation_type as enum (
  'undergrad',
  'grad_student',
  'alumni',
  'faculty_or_staff'
);

create type approval_status as enum (
  'pending',
  'approved',
  'rejected'
);

create type user_role as enum (
  'member',
  'admin'
);

create type africa_region as enum (
  'north',
  'west',
  'east',
  'central',
  'southern',
  'diaspora'
);

-- ─── profiles ────────────────────────────────────────────────────────────────

create table profiles (
  -- Primary key ties to Supabase Auth user; deleting the auth user cascades here
  id                      uuid primary key references auth.users(id) on delete cascade,

  -- Email & domain (stored at signup, used for domain verification)
  email                   text not null unique,
  email_domain            text not null,
  affiliation_type        affiliation_type not null,

  -- Admin-controlled fields
  approval_status         approval_status not null default 'pending',
  role                    user_role not null default 'member',

  -- Name
  first_name              text not null,
  last_name               text not null,
  preferred_name          text,

  -- Harvard affiliation
  harvard_school          text not null,          -- e.g. "Harvard College", "HBS"
  degree                  text,                   -- "AB", "MBA", "PhD"
  concentration_field     text,                   -- "Government", "Computer Science"
  graduation_year         int,
  is_current_student      boolean not null default false,

  -- African connection
  country_of_origin       text not null,          -- e.g. "Ethiopia"
  africa_region           africa_region,
  languages               text[] not null default '{}',

  -- Career
  job_title            text,
  current_company         text,
  industry                text,
  city                    text,
  country_of_residence    text,

  -- Contact & bio
  linkedin_url            text,
  personal_website        text,
  short_bio               text check (char_length(short_bio) <= 500),

  -- Preferences
  willing_to_mentor       boolean not null default false,
  open_to_coffee_chats    boolean not null default false,
  show_email_to_members   boolean not null default true,

  -- Timestamps
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Keep updated_at current on every UPDATE
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ─── admin_actions ────────────────────────────────────────────────────────────

-- Audit log for all admin operations (approve, reject, promote, demote, delete)
create table admin_actions (
  id          bigserial primary key,
  admin_id    uuid not null references profiles(id),
  target_id   uuid not null references profiles(id),
  action      text not null,   -- 'approve' | 'reject' | 'promote' | 'demote' | 'delete'
  note        text,
  created_at  timestamptz not null default now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

create index profiles_approval_idx    on profiles (approval_status);
create index profiles_grad_year_idx   on profiles (graduation_year);
create index profiles_school_idx      on profiles (harvard_school);
create index profiles_country_idx     on profiles (country_of_origin);
create index profiles_industry_idx    on profiles (industry);
create index profiles_region_idx      on profiles (africa_region);
