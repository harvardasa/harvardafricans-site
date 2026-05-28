-- TOTP backup codes for admins who lose their authenticator device.
-- Run in Supabase SQL Editor AFTER 0005-0008.
--
-- On TOTP enrollment we generate N one-time codes, store SHA-256 hashes
-- here, show the plaintext to the user once, AND email them to the
-- user's recovery_email. On sign-in, if the user enters a backup code
-- instead of a TOTP code, we mark it used so it can never be replayed.

create table if not exists mfa_backup_codes (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  code_hash   text not null,                -- sha256 hex of the raw code
  used_at     timestamptz,                  -- null = still usable
  created_at  timestamptz not null default now()
);

create index if not exists mfa_backup_codes_user_idx
  on mfa_backup_codes (user_id);
create unique index if not exists mfa_backup_codes_unique_hash
  on mfa_backup_codes (user_id, code_hash);

-- RLS: service-role only. App writes/reads via createAdminClient.
alter table mfa_backup_codes enable row level security;
-- No policies = anon/authenticated have no access. Intentional.
