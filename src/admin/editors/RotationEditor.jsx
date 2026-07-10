import { rotationFromRow, rotationToRow } from '@/data/content'
import { useEditor } from '../useEditor'
import { Field, FileField, Input, ListRow, StatusLine } from '../ui'

const makeBlank = () => ({
  id: `rot-${Date.now().toString(36)}`,
  title: '',
  artist: '',
  src: '',
  href: '',
})

export default function RotationEditor() {
  const ed = useEditor({
    table: 'rotation_tracks',
    fromRow: rotationFromRow,
    toRow: rotationToRow,
    makeBlank,
  })
  const { rows, loading, draft, selectedId, patch } = ed

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="a-card flex max-h-[72vh] flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-black/10 px-3 py-2">
          <span className="font-mono text-xs font-semibold">In Rotation ({rows.length})</span>
          <button type="button" className="a-btn-solid" onClick={ed.create}>
            + New
          </button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {loading && <p className="p-2 font-mono text-xs text-zinc-400">loading…</p>}
          {!loading && rows.length === 0 && (
            <p className="p-2 font-mono text-xs text-zinc-400">No tracks yet — add one.</p>
          )}
          {rows.map((r, i) => (
            <ListRow
              key={r.id}
              active={selectedId === r.id}
              badge={i + 1}
              title={r.title || '(untitled)'}
              subtitle={r.artist}
              onClick={() => ed.edit(r)}
              onUp={() => ed.move(i, -1)}
              onDown={() => ed.move(i, 1)}
              onDelete={() => {
                if (confirm(`Remove "${r.title}" from rotation?`)) ed.remove(r.id)
              }}
            />
          ))}
        </div>
        <p className="border-t border-black/10 px-3 py-2 font-mono text-[10px] text-zinc-400">
          Order here = order on the turntable list.
        </p>
      </aside>

      <section className="a-card p-5">
        {!draft ? (
          <p className="font-mono text-sm text-zinc-400">
            Select a track to edit, or add a new one.
          </p>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Title">
                <Input value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
              </Field>
              <Field label="Artist">
                <Input value={draft.artist} onChange={(e) => patch({ artist: e.target.value })} />
              </Field>
            </div>

            <Field label="Full-track link (href)" hint="Opens from the ↗ next to the track.">
              <Input value={draft.href} onChange={(e) => patch({ href: e.target.value })} />
            </Field>

            <FileField
              label="Audio clip"
              kind="audio"
              folder="audio"
              accept="audio/*"
              value={draft.src}
              onChange={(url) => patch({ src: url })}
              hint="The preview that plays on the turntable."
            />

            <div className="flex items-center gap-3 border-t border-black/10 pt-4">
              <button type="button" className="a-btn-solid" disabled={ed.saving} onClick={ed.save}>
                {ed.saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" className="a-btn" onClick={ed.cancel}>
                Cancel
              </button>
              <StatusLine error={ed.error} status={ed.status} />
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
