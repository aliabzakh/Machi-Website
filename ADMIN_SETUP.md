# machi7k · studio — admin setup

A separate, login-protected page for you and Machi to manage the site's content:
the **Music cards** ("around the world" songs), the **In Rotation** turntable list,
and the **Cabinet bio tabs**. Upload cover art / audio, paste links, set the
country + flag, day, year, description — everything each card shows.

- **Public site:** `/` (unchanged)
- **Admin:** `/admin.html`

The site reads content live from Supabase and **falls back to the built-in
defaults** whenever Supabase isn't configured or a request fails — so nothing ever
breaks, and the site works exactly as before until you finish the steps below.

---

## One-time setup (~10 minutes)

### 1. Create a Supabase project
Sign up at [supabase.com](https://supabase.com) and create a free project. Wait for
it to finish provisioning.

### 2. Create the tables, security rules, storage & seed data
Dashboard → **SQL Editor** → **New query** → paste the entire contents of
[`supabase/schema.sql`](supabase/schema.sql) → **Run**.

This creates the `songs`, `rotation_tracks`, and `cabinet_tabs` tables, the
row-level-security rules (public can read, only logged-in editors can write), the
`media` storage bucket for uploads, and seeds the current site content so the
admin opens pre-filled. It's safe to re-run.

### 3. Add login users (you + Machi)
Dashboard → **Authentication** → **Users** → **Add user** → create each account
with an email + password. (Turn off "Confirm email" for these, or confirm them, so
they can sign in immediately.) Anyone with an account here can edit; there is no
public sign-up.

### 4. Point the site at your project
Dashboard → **Project Settings** → **API**. Copy the **Project URL** and the
**anon public** key. Then in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_SUPABASE_URL=https://your-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 5. Run it
```bash
npm run dev
```
Open **`/admin.html`**, sign in, and you're editing. Until `.env.local` exists the
admin shows a "not connected yet" screen with these same steps.

---

## Updating an existing database

If you set up the database before the flag/length features were added, run these
two lines once in the SQL Editor (or just re-run all of `supabase/schema.sql` —
it's idempotent):

```sql
alter table public.songs        add column if not exists palette jsonb;
alter table public.cabinet_tabs add column if not exists height integer not null default 400;
```

Until you do, the public site still works, but **saving from the admin will fail**
(it writes those columns).

## Using the admin

- **Music cards** — every field a card shows: day #, title, artist, year, country,
  region (songs in the same region sit together on the ring), description,
  Listen/Watch links, and uploads for *ring tile artwork* (the image on the
  spinning ring), *album cover* (the big square art in the popup), and an *audio
  clip*. Uncheck **Published** to hide a card without deleting it.
  - **Flags are automatic:** pick a country and its flag loads from a built-in
    library of 275 (every UN state + dependencies + subdivisions like Catalonia,
    plus non-UN entities: Abkhazia, Somaliland, Transnistria, Kosovo, Artsakh,
    Northern Cyprus, South Ossetia, Tibet, Kurdistan…). Only when there's no
    built-in flag does an upload field appear. The **year-sticker colours are
    sampled from the chosen flag** automatically (shown as a live preview).
- **Cabinet tabs** also have a **card-length** slider (+ exact px) so a file can
  pull further out of the cabinet; the footer link/note now sits just below the
  body so it's visible without dragging the file all the way out.
- **In Rotation** — the turntable's now-playing list. Title, artist, a full-track
  link, and the audio preview. Drag order = list order.
- **Cabinet tabs** — the filing-cabinet story tabs. Pick a type: **Story**
  (title + caption + body + optional image + optional footer link / link list),
  **Divider** (a section label), or **In Rotation** (drops in the turntable). Wrap
  phrases in `**double asterisks**` to bold them. Reorder with the ↑ ↓ controls.

Uploads go to the Supabase `media` bucket and are stored as public URLs. You can
also paste an existing path (e.g. `/images/cover-156.png`) instead of uploading.

## Publishing changes
Edits are **live immediately** for anyone loading the site — the site fetches from
Supabase on load. If you host the site on a CDN with heavy caching, a redeploy or
cache purge makes changes appear instantly for already-cached visitors.

## Notes
- The three portrait images used by the default bio tabs live in
  `public/portfolio/` so the seed can reference stable URLs.
- New countries that aren't in `src/data/flagPalettes.js` get a neutral default
  year-sticker palette; add them there if you want custom flag colours.
