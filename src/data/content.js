// Live content layer. The site reads through these helpers; the admin writes
// through the ones at the bottom. Everything degrades to the bundled defaults so
// the public site never shows a blank state.
import { supabase } from '@/lib/supabaseClient'
import { songs as DEFAULT_SONGS } from '@/data/songs'
import { DEFAULT_ROTATION, DEFAULT_TABS } from '@/data/defaults'

export { DEFAULT_SONGS, DEFAULT_ROTATION, DEFAULT_TABS }

// ---- row <-> app-shape mappers ---------------------------------------------
// The DB stores snake_case columns; the site components expect the camelCase
// shapes that used to live in the data files. Map in both directions.

// `fallbackCover` fills an empty ring-tile image with the album art so the site's
// ring never shows a blank tile. The admin passes false so the edit form shows the
// two image fields exactly as stored (no silent duplication on re-save).
export const songFromRow = (r, fallbackCover = true) => ({
  id: r.id,
  day: r.day,
  title: r.title,
  artist: r.artist,
  year: r.year,
  country: r.country,
  region: r.region,
  cover: fallbackCover ? r.cover_url || r.cover_art_url || '' : r.cover_url || '',
  coverArt: r.cover_art_url || '',
  flag: r.flag_url || '',
  audio: r.audio_url || '',
  href: r.href || '',
  instagram: r.instagram || '',
  description: r.description || '',
  published: r.published !== false,
  palette: Array.isArray(r.palette) ? r.palette : null,
})

export const songToRow = (s) => ({
  id: s.id,
  day: s.day === '' || s.day == null ? null : Number(s.day),
  title: s.title,
  artist: s.artist,
  year: s.year === '' || s.year == null ? null : Number(s.year),
  country: s.country,
  region: s.region,
  cover_url: s.cover || null,
  cover_art_url: s.coverArt || null,
  flag_url: s.flag || null,
  audio_url: s.audio || null,
  href: s.href || null,
  instagram: s.instagram || null,
  description: s.description || null,
  palette: Array.isArray(s.palette) && s.palette.length === 3 ? s.palette : null,
  sort_order: s.sortOrder ?? 0,
  published: s.published !== false,
})

export const rotationFromRow = (r) => ({
  id: r.id,
  title: r.title,
  artist: r.artist,
  src: r.audio_url || '',
  href: r.href || '',
})

export const rotationToRow = (t) => ({
  id: t.id,
  title: t.title,
  artist: t.artist,
  audio_url: t.src || null,
  href: t.href || null,
  sort_order: t.sortOrder ?? 0,
})

export const tabFromRow = (r) => ({
  id: r.id,
  tabLocation: r.tab_location ?? 0,
  kind: r.kind || 'text',
  title: r.title || '',
  caption: r.caption || '',
  body: r.body || '',
  image: r.image_url || '',
  wide: !!r.wide,
  links: Array.isArray(r.links) ? r.links : [],
})

export const tabToRow = (t) => ({
  id: t.id,
  tab_location: Number(t.tabLocation) || 0,
  kind: t.kind || 'text',
  title: t.title || null,
  caption: t.caption || null,
  body: t.body || null,
  image_url: t.image || null,
  wide: !!t.wide,
  links: Array.isArray(t.links) && t.links.length ? t.links : null,
  sort_order: t.sortOrder ?? 0,
})

// ---- reads (site) ----------------------------------------------------------
export async function fetchSongs() {
  if (!supabase) return DEFAULT_SONGS
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('day', { ascending: false })
  if (error || !data || data.length === 0) return DEFAULT_SONGS
  return data.map((r) => songFromRow(r))
}

export async function fetchRotation() {
  if (!supabase) return DEFAULT_ROTATION
  const { data, error } = await supabase
    .from('rotation_tracks')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error || !data || data.length === 0) return DEFAULT_ROTATION
  return data.map(rotationFromRow)
}

export async function fetchTabs() {
  if (!supabase) return DEFAULT_TABS
  const { data, error } = await supabase
    .from('cabinet_tabs')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error || !data || data.length === 0) return DEFAULT_TABS
  return data.map(tabFromRow)
}

export async function fetchAllContent() {
  const [songs, rotation, tabs] = await Promise.all([fetchSongs(), fetchRotation(), fetchTabs()])
  return { songs, rotation, tabs }
}

// ---- reads (admin — includes unpublished) ----------------------------------
export async function adminFetch(table, order = 'sort_order') {
  if (!supabase) return []
  const { data, error } = await supabase.from(table).select('*').order(order, { ascending: true })
  if (error) throw error
  return data || []
}

// ---- writes (admin) --------------------------------------------------------
export async function upsertRow(table, row) {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from(table).upsert(row).select().single()
  if (error) throw error
  return data
}

export async function deleteRow(table, id) {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

// Persist a new ordering: writes each row's sort_order in one batch upsert.
export async function saveOrder(table, ids) {
  if (!supabase) throw new Error('Supabase not configured')
  const rows = ids.map((id, i) => ({ id, sort_order: i }))
  const { error } = await supabase.from(table).upsert(rows)
  if (error) throw error
}

// ---- storage (admin uploads) -----------------------------------------------
// Uploads a File to the `media` bucket under a folder and returns its public URL.
export async function uploadMedia(folder, file) {
  if (!supabase) throw new Error('Supabase not configured')
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
  const safe = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  const path = `${folder}/${Date.now()}-${safe || 'file'}.${ext}`
  const { error } = await supabase.storage
    .from('media')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return data.publicUrl
}
