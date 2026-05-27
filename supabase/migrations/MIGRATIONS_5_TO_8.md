# Supabase migrations 0005–0008 — copy/paste reference

There are 4 migrations in this batch (no 0009 exists). Run them in order in **Supabase → SQL Editor → + New query → paste → Run**.

After each one you should see **"Success. No rows returned"**.

If any migration says a column / table / type "already exists", that's fine — `IF NOT EXISTS` makes them safe to re-run.

---

## 📋 Migration 0005 — `0005_password_auth.sql`

Adds the columns for the email + password login overhaul:
- `recovery_email` (a non-Harvard email used for password resets)
- `recovery_email_verified`
- `password_set_at` (also flags "this user has migrated off magic-link-only")
- `password_reset_tokens` table for the recovery-email reset flow

```sql
alter table profiles add column if not exists recovery_email text;
alter table profiles add column if not exists recovery_email_verified boolean not null default false;
alter table profiles add column if not exists password_set_at timestamptz;

-- Recovery email must NOT match the Harvard email; enforced again in app code.
alter table profiles
  add constraint profiles_recovery_email_not_harvard_chk
  check (recovery_email is null or recovery_email <> email);

create index if not exists profiles_recovery_email_idx
  on profiles (lower(recovery_email));

-- password_reset_tokens
-- Used for "forgot password sent to recovery email" flow. The auth.users
-- email is the Harvard address (may be dead post-graduation), so we can't
-- rely on Supabase's built-in resetPasswordForEmail for those users. Instead
-- we mint a signed token, store its hash here, email a link to the recovery
-- address, and on /reset-password verify the hash + call admin.updateUserById.
create table if not exists password_reset_tokens (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  token_hash  text not null unique,        -- sha256 of the raw token
  expires_at  timestamptz not null,         -- 1 hour from issue
  used_at     timestamptz,                  -- null = unused
  created_at  timestamptz not null default now(),
  ip_address  text,                         -- for abuse audit
  sent_to     text not null                 -- email the link was sent to
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
```

---

## 📋 Migration 0006 — `0006_cms.sql`

Schema for CMS-managed content: editable site copy, events, gallery, board members, news.

```sql
create type event_status as enum ('upcoming', 'past', 'cancelled');

-- site_content: key/value editable copy
create table site_content (
  id          text primary key,
  title       text,
  body        text,
  metadata    jsonb not null default '{}',
  updated_at  timestamptz not null default now(),
  updated_by  uuid references profiles(id)
);

-- events
create table events (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  description     text,
  starts_at       timestamptz not null,
  ends_at         timestamptz,
  location        text,
  cover_image_url text,
  rsvp_url        text,
  is_published    boolean not null default false,
  status          event_status not null default 'upcoming',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references profiles(id)
);
create index events_starts_at_idx on events (starts_at desc);
create index events_published_idx on events (is_published, starts_at desc);

-- gallery
create table gallery_albums (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  description     text,
  cover_image_url text,
  event_id        uuid references events(id) on delete set null,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table gallery_images (
  id            uuid primary key default gen_random_uuid(),
  album_id      uuid not null references gallery_albums(id) on delete cascade,
  image_url     text not null,
  caption       text,
  alt_text      text,
  display_order int not null default 0,
  uploaded_at   timestamptz not null default now(),
  uploaded_by   uuid references profiles(id)
);
create index gallery_images_album_idx on gallery_images (album_id, display_order);

-- board_members
create table board_members (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  role          text not null,
  bio           text,
  photo_url     text,
  linkedin_url  text,
  email         text,
  display_order int not null default 0,
  is_active     boolean not null default true,
  academic_year text
);
create index board_members_year_idx on board_members (academic_year, display_order);

-- news_posts (kept for schema completeness; news will be sourced from external API)
create table news_posts (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  body            text not null,
  excerpt         text,
  cover_image_url text,
  is_published    boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references profiles(id)
);
create index news_posts_published_idx on news_posts (is_published, published_at desc);

-- updated_at triggers (reuses set_updated_at() from migration 0001)
create trigger site_content_updated_at  before update on site_content   for each row execute function set_updated_at();
create trigger events_updated_at        before update on events         for each row execute function set_updated_at();
create trigger gallery_albums_updated_at before update on gallery_albums for each row execute function set_updated_at();
create trigger news_posts_updated_at    before update on news_posts     for each row execute function set_updated_at();
```

---

## 📋 Migration 0007 — `0007_cms_rls.sql`

Row-level security: public can READ published content. WRITES go through admin API routes using the service-role client.

```sql
alter table site_content enable row level security;
create policy "public read site content"
  on site_content for select to anon, authenticated using (true);

alter table events enable row level security;
create policy "public read published events"
  on events for select to anon, authenticated using (is_published = true);

alter table gallery_albums enable row level security;
create policy "public read published albums"
  on gallery_albums for select to anon, authenticated using (is_published = true);

alter table gallery_images enable row level security;
create policy "public read images in published albums"
  on gallery_images for select to anon, authenticated
  using (
    exists (select 1 from gallery_albums a where a.id = album_id and a.is_published = true)
  );

alter table board_members enable row level security;
create policy "public read active board members"
  on board_members for select to anon, authenticated using (is_active = true);

alter table news_posts enable row level security;
create policy "public read published news"
  on news_posts for select to anon, authenticated
  using (
    is_published = true
    and (published_at is null or published_at <= now())
  );
```

---

## 📋 Migration 0008 — `0008_cms_audit.sql`

Audit log for CMS write actions.

```sql
create table cms_actions (
  id          bigserial primary key,
  admin_id    uuid not null references profiles(id),
  entity_type text not null,        -- 'event' | 'gallery_image' | 'gallery_album' | 'news_post' | 'board_member' | 'site_content'
  entity_id   text not null,
  action      text not null,        -- 'create' | 'update' | 'delete' | 'publish' | 'unpublish'
  diff        jsonb,
  created_at  timestamptz not null default now()
);
create index cms_actions_admin_idx  on cms_actions (admin_id, created_at desc);
create index cms_actions_entity_idx on cms_actions (entity_type, entity_id);

alter table cms_actions enable row level security;
create policy "admin read cms actions"
  on cms_actions for select to authenticated
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Writes happen via the service-role client (admin API routes), so no insert policy.
```

---

## ✅ Verification

After running all four, in Supabase **Database → Tables**, you should see these new tables:

- `password_reset_tokens` (from 0005)
- `site_content`, `events`, `gallery_albums`, `gallery_images`, `board_members`, `news_posts` (from 0006)
- `cms_actions` (from 0008)

And on `profiles` (from 0005), these new columns:

- `recovery_email`
- `recovery_email_verified`
- `password_set_at`

If anything errored, paste the message and I'll fix it.

---

## ℹ️ No 0009

There is no `0009_*.sql` — 0008 is the latest. Future migrations will continue from 0009.
