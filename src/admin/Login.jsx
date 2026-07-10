import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setBusy(false)
    // On success, AdminApp's onAuthStateChange swaps in the studio.
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <form onSubmit={submit} className="a-card w-full max-w-sm space-y-4 p-6">
        <div>
          <h1 className="font-mono text-lg font-semibold tracking-tighter">machi7k · studio</h1>
          <p className="mt-1 font-mono text-[11px] text-zinc-500">
            Sign in to manage songs, rotation & cabinet.
          </p>
        </div>

        <label className="block">
          <span className="a-label">Email</span>
          <input
            type="email"
            autoComplete="username"
            className="a-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="a-label">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            className="a-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="font-mono text-[11px] text-red-600">{error}</p>}

        <button type="submit" className="a-btn-solid w-full py-2" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
