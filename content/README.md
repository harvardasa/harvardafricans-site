# Content — historical reference only

The JSON files in this folder (`leaders.json`, `events.json`, `gallery.json`) are **not** read by the live site. `lib/marketing-content.ts` fetches leadership, events, and gallery data directly from Supabase, with no filesystem fallback to these files.

Live content is managed entirely through the **`/admin`** dashboard (Leadership, Events, Gallery, Site Content tabs), which writes to the Supabase `board_members`, `events`, `gallery_albums`/`gallery_images`, and `site_content` tables. To update anything on the marketing site, sign in as an admin and use those editors — editing the JSON files here will have no effect.

These files are kept only as historical/seed reference for what the content looked like at an earlier point.
