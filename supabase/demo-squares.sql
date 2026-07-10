-- OPTIONAL demo: three colourful SQUARE covers so you can see square album art
-- clustered in the ring (they share a region, so they sit next to each other).
-- Run in the Supabase SQL editor. Delete them later from the admin, or with:
--   delete from public.songs where id like 'demo-square-%';
insert into public.songs
  (id, day, title, artist, year, country, region, cover_url, cover_art_url, href, description, sort_order, published)
values
  ('demo-square-1', 1, 'Square One',   'Demo', 2024, '', 'Demo Squares', '/images/demo-square-1.svg', '/images/demo-square-1.svg', '#', 'Demo square cover.', 100, true),
  ('demo-square-2', 2, 'Square Two',   'Demo', 2024, '', 'Demo Squares', '/images/demo-square-2.svg', '/images/demo-square-2.svg', '#', 'Demo square cover.', 101, true),
  ('demo-square-3', 3, 'Square Three', 'Demo', 2024, '', 'Demo Squares', '/images/demo-square-3.svg', '/images/demo-square-3.svg', '#', 'Demo square cover.', 102, true)
on conflict (id) do nothing;
