// Shown when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY aren't set yet. The public
// site keeps working on bundled defaults; only the CMS needs the backend.
export default function SetupNotice() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="a-card w-full max-w-xl space-y-4 p-6">
        <h1 className="font-mono text-lg font-semibold tracking-tighter">
          machi7k · studio — not connected yet
        </h1>
        <p className="font-mono text-[12px] leading-relaxed text-zinc-600">
          The admin needs a Supabase project before it can log in and save. The public site is
          unaffected in the meantime — it falls back to the built-in content.
        </p>
        <ol className="list-decimal space-y-2 pl-5 font-mono text-[12px] leading-relaxed text-zinc-700">
          <li>
            Create a free project at <span className="font-semibold">supabase.com</span>.
          </li>
          <li>
            In the SQL editor, run <span className="font-semibold">supabase/schema.sql</span> from
            this repo (creates the tables, storage bucket, security rules & seed content).
          </li>
          <li>
            Add one or two login users under <span className="font-semibold">Authentication →
            Users</span> (you + Machi).
          </li>
          <li>
            Copy <span className="font-semibold">.env.example</span> to{' '}
            <span className="font-semibold">.env.local</span> and paste your project URL + anon key.
          </li>
          <li>Restart the dev server and reload this page.</li>
        </ol>
        <p className="font-mono text-[11px] text-zinc-500">
          Full walkthrough: <span className="font-semibold">ADMIN_SETUP.md</span>.
        </p>
        <a href="/" className="a-btn w-fit">
          ← Back to the site
        </a>
      </div>
    </div>
  )
}
