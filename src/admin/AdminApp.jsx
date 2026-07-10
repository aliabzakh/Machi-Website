import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import Login from './Login'
import SetupNotice from './SetupNotice'
import SongsEditor from './editors/SongsEditor'
import RotationEditor from './editors/RotationEditor'
import TabsEditor from './editors/TabsEditor'

const TABS = [
  { id: 'songs', label: 'Music cards', Comp: SongsEditor },
  { id: 'rotation', label: 'In Rotation', Comp: RotationEditor },
  { id: 'tabs', label: 'Cabinet tabs', Comp: TabsEditor },
]

export default function AdminApp() {
  const [session, setSession] = useState(undefined) // undefined = still checking
  const [tab, setTab] = useState('songs')

  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!isSupabaseConfigured) return <SetupNotice />

  if (session === undefined) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="font-mono text-sm text-zinc-400">Loading…</p>
      </div>
    )
  }

  if (!session) return <Login />

  const Active = TABS.find((t) => t.id === tab)?.Comp ?? SongsEditor

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-[#ededed]/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
          <span className="font-mono text-sm font-semibold tracking-tighter">machi7k · studio</span>

          <nav className="flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-md px-2.5 py-1 font-mono text-xs transition-colors ${
                  tab === t.id ? 'bg-black text-white' : 'text-zinc-600 hover:bg-black/5'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[11px] text-zinc-500 underline-offset-2 hover:text-black hover:underline"
            >
              View site ↗
            </a>
            <span className="hidden font-mono text-[11px] text-zinc-400 sm:inline">
              {session.user?.email}
            </span>
            <button
              type="button"
              className="a-btn"
              onClick={() => supabase.auth.signOut()}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6">
        <Active />
      </main>
    </div>
  )
}
