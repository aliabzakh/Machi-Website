-- machi7k · studio — Supabase schema + security + seed
-- Run this whole file ONCE: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- It creates the content tables, the row-level security rules, the `media`
-- storage bucket, and seeds the site's current content so the admin opens
-- pre-filled rather than empty. Safe to re-run (idempotent).

-- ── Tables ─────────────────────────────────────────────────────────────────
create table if not exists public.songs (
  id            text primary key,
  day           integer,
  title         text not null default '',
  artist        text default '',
  year          integer,
  country       text default '',
  region        text default '',
  cover_url     text,
  cover_art_url text,
  flag_url      text,
  audio_url     text,
  href          text,
  instagram     text,
  description   text,
  palette       jsonb,
  sort_order    integer not null default 0,
  published     boolean not null default true,
  updated_at    timestamptz not null default now()
);

create table if not exists public.rotation_tracks (
  id         text primary key,
  title      text not null default '',
  artist     text default '',
  audio_url  text,
  href       text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.cabinet_tabs (
  id           text primary key,
  tab_location integer not null default 0,
  kind         text not null default 'text',
  title        text default '',
  caption      text,
  body         text,
  image_url    text,
  wide         boolean not null default false,
  footer_note  text,
  link_label   text,
  link_href    text,
  links        jsonb,
  height       integer not null default 400,
  sort_order   integer not null default 0,
  updated_at   timestamptz not null default now()
);

-- Upgrades for databases created before these columns existed (safe to re-run):
alter table public.songs        add column if not exists palette jsonb;
alter table public.cabinet_tabs add column if not exists height integer not null default 400;

-- ── Row Level Security ─────────────────────────────────────────────────────
-- Public (anon) key may READ; only a signed-in user may WRITE.
alter table public.songs           enable row level security;
alter table public.rotation_tracks enable row level security;
alter table public.cabinet_tabs    enable row level security;

-- songs: anon sees only published rows; a logged-in editor sees everything
drop policy if exists songs_read_public on public.songs;
create policy songs_read_public on public.songs
  for select to anon using (published = true);
drop policy if exists songs_read_auth on public.songs;
create policy songs_read_auth on public.songs
  for select to authenticated using (true);
drop policy if exists songs_write_auth on public.songs;
create policy songs_write_auth on public.songs
  for all to authenticated using (true) with check (true);

-- rotation_tracks + cabinet_tabs: anyone reads, only editors write
drop policy if exists rotation_read on public.rotation_tracks;
create policy rotation_read on public.rotation_tracks for select using (true);
drop policy if exists rotation_write on public.rotation_tracks;
create policy rotation_write on public.rotation_tracks
  for all to authenticated using (true) with check (true);

drop policy if exists tabs_read on public.cabinet_tabs;
create policy tabs_read on public.cabinet_tabs for select using (true);
drop policy if exists tabs_write on public.cabinet_tabs;
create policy tabs_write on public.cabinet_tabs
  for all to authenticated using (true) with check (true);

-- ── Storage: the `media` bucket for uploaded covers / audio / flags ────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists media_read on storage.objects;
create policy media_read on storage.objects
  for select using (bucket_id = 'media');
drop policy if exists media_insert on storage.objects;
create policy media_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
drop policy if exists media_update on storage.objects;
create policy media_update on storage.objects
  for update to authenticated using (bucket_id = 'media');
drop policy if exists media_delete on storage.objects;
create policy media_delete on storage.objects
  for delete to authenticated using (bucket_id = 'media');

-- ── Seed: the site's current content (idempotent) ──────────────────────────
-- Songs -------------------------------------------------------------------
insert into public.songs (id, day, title, artist, year, country, region, cover_url, cover_art_url, flag_url, audio_url, href, instagram, description, sort_order, published) values
  ('lestaca', 156, 'L''estaca', 'Lluís Llach', 1969, 'Catalonia', 'Southern Europe', '/images/placeholder-1.svg', '/images/cover-156.png', '/flags/es-ct.svg', '/audio/rotation-1.mp3', 'https://www.youtube.com/results?search_query=Lluis+Llach+L%27estaca', 'https://www.instagram.com/machi7k/', 'A Catalan song written by Lluís Llach in 1968. Its metaphor of a stake (''l''estaca'') lashed to a post became an anthem of resistance under Franco, and has since been reworked into dozens of languages as a protest song around the world.', 0, true),
  ('moratuwa', 154, 'Moratuwa', 'The Super Golden Chimes', 1973, 'Sri Lanka', 'South Asia', '/images/placeholder-2.svg', '/images/cover-154.png', '/flags/lk.svg', '/audio/rotation-2.mp3', 'https://www.youtube.com/results?search_query=Super+Golden+Chimes+Moratuwa', 'https://www.instagram.com/machi7k/', 'A Sinhala-language track by The Super Golden Chimes, one of Sri Lanka''s leading pop bands of the late ''60s and ''70s, named after the coastal city of Moratuwa.', 1, true),
  ('dekierey', 153, 'Deki Erey (Emni''Are)', 'Abraham Afewerki', 2000, 'Eritrea', 'East Africa', '/images/placeholder-3.svg', '/images/cover-153.png', '/flags/er.svg', '/audio/rotation-3.mp3', 'https://www.youtube.com/results?search_query=Abraham+Afewerki+Deki+Erey', 'https://www.instagram.com/machi7k/', 'From Eritrean singer-songwriter Abraham Afewerki — one of the most influential voices in modern Eritrean music — blending traditional Tigrinya melodies with contemporary arrangements.', 2, true),
  ('ph-zamba', 149, 'Zamba de Mi Esperanza', 'Jorge Cafrune', 1964, 'Argentina', 'Latin America', '/images/ph-la-1.svg', null, null, null, 'https://www.youtube.com/results?search_query=Jorge+Cafrune+Zamba+de+Mi+Esperanza', 'https://www.instagram.com/machi7k/', 'Placeholder — swap in the real Day post for this track.', 3, true),
  ('ph-quimey', 147, 'Quimey Neuquén', 'José Larralde', 1969, 'Argentina', 'Latin America', '/images/ph-la-2.svg', null, null, null, 'https://www.youtube.com/results?search_query=Jose+Larralde+Quimey+Neuquen', 'https://www.instagram.com/machi7k/', 'Placeholder — swap in the real Day post for this track.', 4, true),
  ('ph-marialando', 146, 'María Landó', 'Susana Baca', 1995, 'Peru', 'Latin America', '/images/ph-la-3.svg', null, null, null, 'https://www.youtube.com/results?search_query=Susana+Baca+Maria+Lando', 'https://www.instagram.com/machi7k/', 'Placeholder — swap in the real Day post for this track.', 5, true),
  ('ph-plegaria', 145, 'Plegaria a un Labrador', 'Víctor Jara', 1969, 'Chile', 'Latin America', '/images/ph-la-4.svg', null, null, null, 'https://www.youtube.com/results?search_query=Victor+Jara+Plegaria+a+un+Labrador', 'https://www.instagram.com/machi7k/', 'Placeholder — swap in the real Day post for this track.', 6, true),
  ('ph-sweetmother', 142, 'Sweet Mother', 'Prince Nico Mbarga', 1976, 'Nigeria', 'West Africa', '/images/ph-wa-1.svg', null, null, null, 'https://www.youtube.com/results?search_query=Prince+Nico+Mbarga+Sweet+Mother', 'https://www.instagram.com/machi7k/', 'Placeholder — swap in the real Day post for this track.', 7, true),
  ('ph-fatouyo', 141, 'Fatou Yo', 'Touré Kunda', 1985, 'Senegal', 'West Africa', '/images/ph-wa-2.svg', null, null, null, 'https://www.youtube.com/results?search_query=Toure+Kunda+Fatou+Yo', 'https://www.instagram.com/machi7k/', 'Placeholder — swap in the real Day post for this track.', 8, true),
  ('ph-soulmakossa', 140, 'Soul Makossa', 'Manu Dibango', 1972, 'Cameroon', 'West Africa', '/images/ph-wa-3.svg', null, null, null, 'https://www.youtube.com/results?search_query=Manu+Dibango+Soul+Makossa', 'https://www.instagram.com/machi7k/', 'Placeholder — swap in the real Day post for this track.', 9, true),
  ('ph-ueomuite', 138, 'Ue o Muite Arukō', 'Kyu Sakamoto', 1961, 'Japan', 'East Asia', '/images/ph-ea-1.svg', null, null, null, 'https://www.youtube.com/results?search_query=Kyu+Sakamoto+Ue+o+Muite+Aruko', 'https://www.instagram.com/machi7k/', 'Placeholder — swap in the real Day post for this track.', 10, true),
  ('ph-tianmimi', 137, 'Tian Mi Mi', 'Teresa Teng', 1979, 'Taiwan', 'East Asia', '/images/ph-ea-2.svg', null, null, null, 'https://www.youtube.com/results?search_query=Teresa+Teng+Tian+Mi+Mi', 'https://www.instagram.com/machi7k/', 'Placeholder — swap in the real Day post for this track.', 11, true),
  ('ph-arirang', 136, 'Arirang', 'Traditional', 1962, 'Korea', 'East Asia', '/images/ph-ea-3.svg', null, null, null, 'https://www.youtube.com/results?search_query=Arirang+traditional', 'https://www.instagram.com/machi7k/', 'Placeholder — swap in the real Day post for this track.', 12, true),
  ('ph-yarayah', 133, 'Ya Rayah', 'Dahmane El Harrachi', 1973, 'Algeria', 'Middle East & North Africa', '/images/ph-me-1.svg', null, null, null, 'https://www.youtube.com/results?search_query=Dahmane+El+Harrachi+Ya+Rayah', 'https://www.instagram.com/machi7k/', 'Placeholder — swap in the real Day post for this track.', 13, true),
  ('ph-entaomri', 132, 'Enta Omri', 'Umm Kulthum', 1964, 'Egypt', 'Middle East & North Africa', '/images/ph-me-2.svg', null, null, null, 'https://www.youtube.com/results?search_query=Umm+Kulthum+Enta+Omri', 'https://www.instagram.com/machi7k/', 'Placeholder — swap in the real Day post for this track.', 14, true),
  ('ph-riversbabylon', 129, 'Rivers of Babylon', 'The Melodians', 1970, 'Jamaica', 'Caribbean', '/images/ph-car-1.svg', null, null, null, 'https://www.youtube.com/results?search_query=The+Melodians+Rivers+of+Babylon', 'https://www.instagram.com/machi7k/', 'Placeholder — swap in the real Day post for this track.', 15, true),
  ('ph-cuartotula', 128, 'El Cuarto de Tula', 'Buena Vista Social Club', 1997, 'Cuba', 'Caribbean', '/images/ph-car-2.svg', null, null, null, 'https://www.youtube.com/results?search_query=Buena+Vista+Social+Club+El+Cuarto+de+Tula', 'https://www.instagram.com/machi7k/', 'Placeholder — swap in the real Day post for this track.', 16, true)
on conflict (id) do nothing;

-- In Rotation -------------------------------------------------------------
insert into public.rotation_tracks (id, title, artist, audio_url, href, sort_order) values
  ('rot-lestaca', 'L''estaca', 'Lluís Llach', '/audio/rotation-1.mp3', 'https://www.youtube.com/results?search_query=Lluis+Llach+L%27estaca', 0),
  ('rot-moratuwa', 'Moratuwa', 'The Super Golden Chimes', '/audio/rotation-2.mp3', 'https://www.youtube.com/results?search_query=Super+Golden+Chimes+Moratuwa', 1),
  ('rot-dekierey', 'Deki Erey (Emni''Are)', 'Abraham Afewerki', '/audio/rotation-3.mp3', 'https://www.youtube.com/results?search_query=Abraham+Afewerki+Deki+Erey', 2)
on conflict (id) do nothing;

-- Cabinet tabs ------------------------------------------------------------
insert into public.cabinet_tabs (id, tab_location, kind, title, caption, body, image_url, wide, footer_note, link_label, link_href, links, sort_order) values
  ('tab-intro', 0, 'divider', 'Intro', null, null, null, false, null, null, null, null, 0),
  ('tab-about', 1, 'text', 'About Me', 'AR · Paris/Berlin', 'I''m Machi — an Argentine music-and-culture creator out to prove there''s more to the world than what makes it onto the radio. Born in Argentina, raised across Brazil, Colombia and Miami, now splitting time between Paris and Berlin. Across Instagram, TikTok and YouTube my invitation is simple: **"teach me something in the comments."**', '/portfolio/portrait.jpeg', false, null, null, null, null, 1),
  ('tab-plottwist', 2, 'text', 'Plot Twist', 'Origin', 'I didn''t start with crate-digging and cassette reissues — I started with Fortnite trickshots. The same obsessive curiosity that made me chase the perfect clip got pointed at music history instead. These days the "stuff I find interesting" is the forgotten funk, disco and rock the rest of the internet skipped.', '/portfolio/portrait-beach.jpg', false, null, null, null, null, 2),
  ('tab-mission-div', 0, 'divider', 'The Mission', null, null, null, false, null, null, null, null, 3),
  ('tab-mission', 1, 'text', 'The Mission', 'Why', 'My whole project runs on one belief: being more open-minded about music can make you more open-minded about the world. I''m less interested in the "typical" music of a place than in the collisions — what happened when local sounds crashed into the rock, jazz, disco and funk that swept the globe in the 20th century. Every video and mix I make is an argument that curiosity is worth having.', null, true, '"There''s more to the world."', null, null, null, 4),
  ('tab-work-div', 2, 'divider', 'Work', null, null, null, false, null, null, null, null, 5),
  ('tab-onair', 0, 'text', 'On Air', 'NTS Radio', 'I host **Exploring Earth Through Sound** on NTS Radio, broadcasting out of Paris. Each episode I either roam across eclectic global selections or zoom in on one scene — recent shows have covered Argentine rock from the ''60s to ''90s, trip-hop and Afrobeat, leftfield disco and funk.', '/portfolio/nts-show.jpeg', false, null, 'nts.live/shows/machi →', 'https://www.nts.live/shows/machi', null, 6),
  ('tab-dayjob', 1, 'text', 'The Day Job', 'Habibi Funk', 'Off-camera I intern at **Habibi Funk** — the Berlin label famous for reissuing funk, soul and disco from across the Arab world, and for doing it ethically (artists and their families split profits 50/50). The perfect home base for someone whose whole thing is uncovering brilliant music history has overlooked. I''m also part of the crew behind events like the Habibi Funk Weekender in London.', null, true, null, 'instagram.com/habibifunk →', 'https://www.instagram.com/habibifunk/', null, 7),
  ('tab-connect-div', 2, 'divider', 'Connect', null, null, null, false, null, null, null, null, 8),
  ('tab-rotation', 0, 'rotation', 'Rotation', null, null, null, false, null, null, null, null, 9),
  ('tab-findme', 1, 'text', 'Find Me', '@machi7k', null, null, false, null, null, null, '[{"label":"Instagram","value":"472K · @machi7k","href":"https://www.instagram.com/machi7k/"},{"label":"TikTok","value":"268K · @machi7k","href":"https://www.tiktok.com/@machi7k"},{"label":"YouTube","value":"@machi7k","href":"https://www.youtube.com/@machi7k"},{"label":"NTS Radio","value":"shows/machi","href":"https://www.nts.live/shows/machi"},{"label":"Habibi Funk","value":"@habibifunk","href":"https://www.instagram.com/habibifunk/"}]'::jsonb, 10)
on conflict (id) do nothing;
