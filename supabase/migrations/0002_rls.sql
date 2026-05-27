-- HASA Alumni Directory — Row Level Security policies
-- Run AFTER 0001_initial.sql

alter table profiles enable row level security;
alter table admin_actions enable row level security;

-- ─── Helper: get current user's role from profiles ───────────────────────────
-- Using a security-definer function avoids infinite recursion in RLS policies
create or replace function get_my_role()
returns user_role language sql security definer stable as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function get_my_status()
returns approval_status language sql security definer stable as $$
  select approval_status from profiles where id = auth.uid()
$$;

-- ─── profiles policies ───────────────────────────────────────────────────────

-- 1. A user can always read their own profile row (so they can see pending status)
create policy "own profile: read"
  on profiles for select
  to authenticated
  using (id = auth.uid());

-- 2. An approved member can read all other approved profiles (powers the directory)
create policy "approved members: read approved profiles"
  on profiles for select
  to authenticated
  using (
    approval_status = 'approved'
    and get_my_status() = 'approved'
  );

-- 3. An admin can read every profile regardless of status (powers the admin dashboard)
create policy "admin: read all profiles"
  on profiles for select
  to authenticated
  using (get_my_role() = 'admin');

-- 4. A user can insert their own profile row during onboarding
create policy "own profile: insert"
  on profiles for insert
  to authenticated
  with check (id = auth.uid());

-- 5. A user can update their own profile (non-admin fields enforced in application code)
create policy "own profile: update"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- 6. An admin can update any profile (used for approve/reject/role changes)
create policy "admin: update any profile"
  on profiles for update
  to authenticated
  using (get_my_role() = 'admin');

-- 7. An admin can delete profiles (triggers cascade to auth.users)
create policy "admin: delete profile"
  on profiles for delete
  to authenticated
  using (get_my_role() = 'admin');

-- ─── admin_actions policies ───────────────────────────────────────────────────

-- 8. Only admins can read the audit log
create policy "admin: read audit log"
  on admin_actions for select
  to authenticated
  using (get_my_role() = 'admin');

-- 9. Only admins can write audit log entries (belt-and-suspenders; inserts use service role)
create policy "admin: insert audit log"
  on admin_actions for insert
  to authenticated
  with check (
    admin_id = auth.uid()
    and get_my_role() = 'admin'
  );
