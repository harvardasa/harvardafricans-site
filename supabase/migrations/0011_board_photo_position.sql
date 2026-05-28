-- Adds a column so admins can control how a board member's photo crops
-- inside its display container. Values are Tailwind `object-position`
-- classes: object-top, object-center, object-bottom, plus the 6 corner
-- variants (object-left-top, etc.). Default is object-center, matching
-- the previous behavior.

alter table board_members
  add column if not exists photo_position text not null default 'object-center';
