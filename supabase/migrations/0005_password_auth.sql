-- HASA Directory — password auth + recovery email
-- Run this in Supabase SQL Editor AFTER 0001–0004.
--
-- This migration adds the columns needed for the email+password login overhaul:
--   - recovery_email: a non-Harvard email used for password resets
--   - recovery_email_verified: did the user click the verification link sent to it
--   - password_set_at: when the user last set a password (also a flag for
--     "this user has migrated off the magic-link-only flow")
-- It also creates a password_reset_tokens table for the recovery-email reset
-- workaround (Supabase's built-in resetPasswordForEmail only sends to the auth
-- user's email, not an arbitrary recovery address).

alter table profiles add column if not exists recovery_email text;
alter table profiles add column if not exists recovery_email_verified boolean not null default false;
alter table profiles add column if not exists password_set_at timestamptz;

-- Recovery email must NOT match the Harvard email; enforced again in app code.
alter table profiles
  add constraint profiles_recovery_email_not_harvard_chk
  check (recovery_email is null or recovery_email <> email);

create index if not exists profiles_recovery_email_idx
  on profiles (lower(recovery_email));

-- ─── password_reset_tokens ──────────────────────────────────────────────────
-- Used for the "forgot password sent to recovery email" flow. The auth.users
-- email is the Harvard address, which may be dead post-graduation, so we can't
-- rely on Supabase's built-in resetPasswordForEmail for those users. Instead we
-- mint a signed token, store its hash here, email a link to the recovery
-- address, and on /reset-password verify the hash + call admin.updateUserById.
create table if not exists password_reset_tokens (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  token_hash  text not null unique,        -- sha256 of the raw token
  expires_at  timestamptz not null,         -- 1 hour from issue
  used_at     timestamptz,                  -- null = unused
  created_at  timestamptz not null default now(),
  ip_address  text,                         -- for abuse audit
  sent_to     text not null                 -- the email the link was sent to (Harvard or recovery)
);

create index if not exists password_reset_tokens_user_idx
  on password_reset_tokens (user_id);
create index if not exists password_reset_tokens_expires_idx
  on password_reset_tokens (expires_at);

-- RLS: only service-role touches this table. Block all client access.
alter table password_reset_tokens enable row level security;
-- Intentionally NO policies → all anon/authenticated reads/writes denied.
-- Service-role bypasses RLS, which is what the /forgot-password and
-- /reset-password route handlers use.
