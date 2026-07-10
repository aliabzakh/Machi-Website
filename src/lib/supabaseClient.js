// Shared Supabase client for the live site AND the /admin CMS.
//
// Both the public site and the admin read/write the same project. The URL + anon
// key are PUBLIC by design (safe to ship in the browser bundle) — real protection
// comes from Row Level Security in the database (see supabase/schema.sql): anyone
// may READ published content, but only a logged-in user may WRITE.
//
// Configure by creating a `.env.local` (copy `.env.example`) with:
//   VITE_SUPABASE_URL=...       VITE_SUPABASE_ANON_KEY=...
//
// Until those are set, `supabase` is null and the site quietly falls back to the
// bundled default content, so nothing breaks before the backend exists.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
