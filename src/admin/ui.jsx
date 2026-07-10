import { useState } from 'react'
import { uploadMedia } from '@/data/content'

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      {label && <span className="a-label">{label}</span>}
      {children}
      {hint && <span className="mt-1 block font-mono text-[10px] text-zinc-400">{hint}</span>}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return <input className={`a-input ${className}`} {...props} />
}

export function TextArea({ className = '', ...props }) {
  return <textarea className={`a-input ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`a-input ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 select-none">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-black"
      />
      <span className="font-mono text-xs">{label}</span>
    </label>
  )
}

// Upload-or-paste field. Uploading pushes the file to the Supabase `media` bucket
// and stores the returned public URL; pasting lets you keep an existing
// /public path (e.g. /images/cover-156.png) without re-uploading.
export function FileField({ label, value, folder, accept, kind = 'image', onChange, hint }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setErr('')
    try {
      const url = await uploadMedia(folder, file)
      onChange(url)
    } catch (ex) {
      setErr(ex.message || 'Upload failed')
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      {label && <span className="a-label">{label}</span>}
      <div className="flex items-start gap-3">
        {value && kind === 'image' && (
          <img
            src={value}
            alt=""
            className="h-16 w-16 shrink-0 rounded-md border border-black/15 bg-zinc-50 object-cover"
          />
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="file"
            accept={accept}
            onChange={handleFile}
            className="block w-full font-mono text-[11px] file:mr-2 file:cursor-pointer file:rounded file:border file:border-black file:bg-white file:px-2 file:py-1 file:font-mono file:text-[11px] hover:file:bg-black hover:file:text-white"
          />
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste a URL / path"
            className="text-xs"
          />
          {kind === 'audio' && value && (
            <audio controls src={value} className="h-8 w-full" preload="none" />
          )}
        </div>
      </div>
      {busy && <span className="mt-1 block font-mono text-[10px] text-zinc-500">uploading…</span>}
      {err && <span className="mt-1 block font-mono text-[10px] text-red-600">{err}</span>}
      {hint && <span className="mt-1 block font-mono text-[10px] text-zinc-400">{hint}</span>}
    </div>
  )
}

// A row in the left-hand list, with reorder + delete controls.
export function ListRow({ active, onClick, onUp, onDown, onDelete, title, subtitle, badge }) {
  return (
    <div
      className={`group flex items-center gap-2 rounded-md border px-2.5 py-2 transition-colors ${
        active ? 'border-black bg-black/[0.04]' : 'border-transparent hover:bg-black/[0.03]'
      }`}
    >
      <button type="button" onClick={onClick} className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-1.5">
          {badge != null && <span className="a-chip shrink-0">{badge}</span>}
          <span className="truncate font-mono text-xs font-medium">{title}</span>
        </span>
        {subtitle && (
          <span className="mt-0.5 block truncate font-mono text-[10px] text-zinc-500">
            {subtitle}
          </span>
        )}
      </button>
      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
        <button type="button" className="a-btn-ghost px-1" onClick={onUp} title="Move up" aria-label="Move up">
          ↑
        </button>
        <button type="button" className="a-btn-ghost px-1" onClick={onDown} title="Move down" aria-label="Move down">
          ↓
        </button>
        <button
          type="button"
          className="a-btn-ghost px-1 hover:text-red-600"
          onClick={onDelete}
          title="Delete"
          aria-label="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export function StatusLine({ error, status }) {
  if (error) return <span className="font-mono text-[11px] text-red-600">{error}</span>
  if (status) return <span className="font-mono text-[11px] text-emerald-600">{status}</span>
  return null
}
