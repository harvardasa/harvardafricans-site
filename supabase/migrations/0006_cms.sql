-- HASA Directory — CMS schema
-- Run this in Supabase SQL Editor AFTER 0001–0005.
--
-- Tables for CMS-managed content: editable site copy, events, gallery, board
-- members, news. Public reads are gated by RLS in 0007; writes go through admin
-- API routes using the service-role client (so no insert/update/delete policies).

create type event_status as enum ('upcoming', 'past', 'cancelled');

-- ─── site_content: key/value editable copy ──────────────────────────────────
create table site_content (
  id          text primary key,
  title       text,
  body        text,
  metadata    jsonb not null default '{}',
  updated_at  timestamptz not null default now(),
  updated_by  uuid references profiles(id)
);

-- ─── events ─────────────────────────────────────────────────────────────────
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

-- ─── gallery ────────────────────────────────────────────────────────────────
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

-- ─── board_members ──────────────────────────────────────────────────────────
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

-- ─── news_posts ─────────────────────────────────────────────────────────────
-- Schema completeness — news may also be sourced from an external API.
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

-- ─── updated_at triggers (reuses set_updated_at() from 0001) ────────────────
create trigger site_content_updated_at   before update on site_content    for each row execute function set_updated_at();
create trigger events_updated_at         before update on events          for each row execute function set_updated_at();
create trigger gallery_albums_updated_at before update on gallery_albums  for each row execute function set_updated_at();
create trigger news_posts_updated_at     before update on news_posts      for each row execute function set_updated_at();
