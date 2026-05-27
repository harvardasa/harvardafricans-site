-- HASA Directory — CMS audit log
-- Run this in Supabase SQL Editor AFTER 0007.
--
-- Records every CMS write action (create/update/delete/publish/unpublish)
-- with a JSON diff. Only admins can read; writes happen via the service-role
-- client from the admin API routes, so no insert policy is needed.

create table cms_actions (
  id          bigserial primary key,
  admin_id    uuid not null references profiles(id),
  entity_type text not null,    -- 'event' | 'gallery_image' | 'gallery_album' | 'news_post' | 'board_member' | 'site_content'
  entity_id   text not null,
  action      text not null,    -- 'create' | 'update' | 'delete' | 'publish' | 'unpublish'
  diff        jsonb,
  created_at  timestamptz not null default now()
);
create index cms_actions_admin_idx  on cms_actions (admin_id, created_at desc);
create index cms_actions_entity_idx on cms_actions (entity_type, entity_id);

alter table cms_actions enable row level security;
create policy "admin read cms actions"
  on cms_actions for select to authenticated
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
