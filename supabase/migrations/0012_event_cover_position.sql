-- Same picker pattern as board_members.photo_position, applied to event
-- cover images so admins can re-center photos like Africa Night where the
-- subject sits off-center.

alter table events
  add column if not exists cover_image_position text not null default 'object-center';
