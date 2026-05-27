-- HASA Directory — CMS row-level security
-- Run this in Supabase SQL Editor AFTER 0006.
--
-- Public can READ published content. WRITES go through admin API routes using
-- the service-role client (which bypasses RLS), so no insert/update/delete
-- policies are defined here.

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
