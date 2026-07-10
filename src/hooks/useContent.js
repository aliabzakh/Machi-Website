import { useEffect, useState } from 'react'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import {
  fetchAllContent,
  DEFAULT_SONGS,
  DEFAULT_ROTATION,
  DEFAULT_TABS,
} from '@/data/content'

// Loads the site's editable content (songs, rotation, cabinet tabs).
//
// - Supabase NOT configured  → returns the bundled defaults immediately, ready.
//   (The site renders exactly as it did before the CMS existed.)
// - Supabase configured      → starts on defaults (ready:false) and swaps to the
//   live rows once fetched. `ready` flips true only after the fetch settles, so
//   the WebGL music ring initialises exactly once, with final data.
export function useContent() {
  const [state, setState] = useState({
    songs: DEFAULT_SONGS,
    rotation: DEFAULT_ROTATION,
    tabs: DEFAULT_TABS,
    ready: !isSupabaseConfigured,
  })

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let alive = true
    fetchAllContent()
      .then((content) => alive && setState({ ...content, ready: true }))
      .catch(() => alive && setState((s) => ({ ...s, ready: true })))
    return () => {
      alive = false
    }
  }, [])

  return state
}
