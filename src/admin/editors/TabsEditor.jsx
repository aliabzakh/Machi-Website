import { tabFromRow, tabToRow } from '@/data/content'
import { useEditor } from '../useEditor'
import { Checkbox, Field, FileField, Input, ListRow, Select, StatusLine, TextArea } from '../ui'

const KIND_LABEL = { divider: 'Divider', text: 'Story', rotation: 'In Rotation' }
const LOC_LABEL = { 0: 'Left', 1: 'Middle', 2: 'Right' }

const makeBlank = () => ({
  id: `tab-${Date.now().toString(36)}`,
  tabLocation: 0,
  kind: 'text',
  title: '',
  caption: '',
  body: '',
  image: '',
  wide: false,
  links: [],
})

function LinksRepeater({ links, onChange }) {
  const set = (i, key, val) => {
    const next = links.map((l, j) => (j === i ? { ...l, [key]: val } : l))
    onChange(next)
  }
  return (
    <div className="space-y-2">
      <span className="a-label">Link list (the “Find Me” style rows)</span>
      {links.map((l, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            className="text-xs"
            placeholder="Label"
            value={l.label || ''}
            onChange={(e) => set(i, 'label', e.target.value)}
          />
          <Input
            className="text-xs"
            placeholder="Value (e.g. 472K · @machi7k)"
            value={l.value || ''}
            onChange={(e) => set(i, 'value', e.target.value)}
          />
          <Input
            className="text-xs"
            placeholder="https://…"
            value={l.href || ''}
            onChange={(e) => set(i, 'href', e.target.value)}
          />
          <button
            type="button"
            className="a-btn-ghost shrink-0 hover:text-red-600"
            onClick={() => onChange(links.filter((_, j) => j !== i))}
            aria-label="Remove link"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        className="a-btn"
        onClick={() => onChange([...links, { label: '', value: '', href: '' }])}
      >
        + Add link
      </button>
    </div>
  )
}

export default function TabsEditor() {
  const ed = useEditor({
    table: 'cabinet_tabs',
    fromRow: tabFromRow,
    toRow: tabToRow,
    makeBlank,
  })
  const { rows, loading, draft, selectedId, patch } = ed

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="a-card flex max-h-[72vh] flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-black/10 px-3 py-2">
          <span className="font-mono text-xs font-semibold">Cabinet tabs ({rows.length})</span>
          <button type="button" className="a-btn-solid" onClick={ed.create}>
            + New
          </button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {loading && <p className="p-2 font-mono text-xs text-zinc-400">loading…</p>}
          {!loading && rows.length === 0 && (
            <p className="p-2 font-mono text-xs text-zinc-400">No tabs yet — add one.</p>
          )}
          {rows.map((r, i) => (
            <ListRow
              key={r.id}
              active={selectedId === r.id}
              badge={KIND_LABEL[r.kind] || r.kind}
              title={r.title || '(untitled)'}
              subtitle={`${LOC_LABEL[r.tab_location] ?? r.tab_location} slot`}
              onClick={() => ed.edit(r)}
              onUp={() => ed.move(i, -1)}
              onDown={() => ed.move(i, 1)}
              onDelete={() => {
                if (confirm(`Delete tab "${r.title}"?`)) ed.remove(r.id)
              }}
            />
          ))}
        </div>
        <p className="border-t border-black/10 px-3 py-2 font-mono text-[10px] text-zinc-400">
          Order here = top-to-bottom order in the cabinet.
        </p>
      </aside>

      <section className="a-card p-5">
        {!draft ? (
          <p className="font-mono text-sm text-zinc-400">Select a tab to edit, or add a new one.</p>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Type">
                <Select value={draft.kind} onChange={(e) => patch({ kind: e.target.value })}>
                  <option value="text">Story (title + text/image)</option>
                  <option value="divider">Divider (section label)</option>
                  <option value="rotation">In Rotation (turntable)</option>
                </Select>
              </Field>
              <Field label="Tab slot" hint="Horizontal position of the paper tab.">
                <Select
                  value={draft.tabLocation}
                  onChange={(e) => patch({ tabLocation: Number(e.target.value) })}
                >
                  <option value={0}>Left</option>
                  <option value={1}>Middle</option>
                  <option value={2}>Right</option>
                </Select>
              </Field>
            </div>

            <Field
              label={draft.kind === 'divider' ? 'Divider label' : 'Title'}
              hint={draft.kind === 'rotation' ? 'Shown as the tab title.' : undefined}
            >
              <Input value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
            </Field>

            {draft.kind === 'rotation' && (
              <p className="rounded-md border border-black/10 bg-black/[0.03] p-3 font-mono text-[11px] text-zinc-500">
                This tab shows the turntable. Its track list is managed in the{' '}
                <strong>In Rotation</strong> tab above.
              </p>
            )}

            {draft.kind === 'text' && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Caption" hint="The little bordered chip by the title.">
                    <Input
                      value={draft.caption}
                      onChange={(e) => patch({ caption: e.target.value })}
                    />
                  </Field>
                  <div className="flex items-end">
                    <Checkbox
                      label="Wide (text-only, no image column)"
                      checked={draft.wide}
                      onChange={(v) => patch({ wide: v })}
                    />
                  </div>
                </div>

                <Field label="Body" hint="Wrap phrases in **double asterisks** to bold them.">
                  <TextArea
                    rows={5}
                    value={draft.body}
                    onChange={(e) => patch({ body: e.target.value })}
                  />
                </Field>

                {!draft.wide && (
                  <FileField
                    label="Image (right column)"
                    kind="image"
                    folder="tabs"
                    accept="image/*"
                    value={draft.image}
                    onChange={(url) => patch({ image: url })}
                  />
                )}

                <div className="border-t border-black/10 pt-4">
                  <LinksRepeater links={draft.links} onChange={(links) => patch({ links })} />
                </div>
              </>
            )}

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
