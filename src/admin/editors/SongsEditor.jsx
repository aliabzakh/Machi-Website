import { songFromRow, songToRow } from '@/data/content'
import { flagCodeForCountry, flagUrlForCountry } from '@/data/countries'
import YearSticker from '@/components/YearSticker'
import { useEditor } from '../useEditor'
import { REGIONS, slugify } from '../helpers'
import { derivePalette } from '../derivePalette'
import { Checkbox, Field, FileField, Input, ListRow, Select, StatusLine, TextArea } from '../ui'

const makeBlank = () => ({
  id: '',
  day: '',
  title: '',
  artist: '',
  year: '',
  country: '',
  region: '',
  description: '',
  href: '',
  instagram: '',
  cover: '',
  coverArt: '',
  flag: '',
  audio: '',
  palette: null,
  published: true,
})

export default function SongsEditor() {
  const ed = useEditor({
    table: 'songs',
    fromRow: (r) => songFromRow(r, false),
    toRow: songToRow,
    makeBlank,
    normalize: (d) => ({ ...d, id: (d.id || '').trim() || slugify(d.title || d.artist) }),
  })
  const { rows, loading, draft, selectedId, patch } = ed

  // Picking a country auto-loads its built-in flag (and re-derives the sticker
  // palette from it). Uploading a custom flag re-derives too.
  const handleCountry = (name) => {
    const url = flagUrlForCountry(name)
    patch({ country: name, flag: url || draft.flag })
    if (url) derivePalette(url).then((pal) => pal && patch({ palette: pal }))
  }
  const handleFlag = (url) => {
    patch({ flag: url })
    if (url) derivePalette(url).then((pal) => pal && patch({ palette: pal }))
  }
  const flagKnown = draft ? !!flagCodeForCountry(draft.country) : false

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      {/* list */}
      <aside className="a-card flex max-h-[72vh] flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-black/10 px-3 py-2">
          <span className="font-mono text-xs font-semibold">Songs ({rows.length})</span>
          <button type="button" className="a-btn-solid" onClick={ed.create}>
            + New
          </button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {loading && <p className="p-2 font-mono text-xs text-zinc-400">loading…</p>}
          {!loading && rows.length === 0 && (
            <p className="p-2 font-mono text-xs text-zinc-400">No songs yet — add one.</p>
          )}
          {rows.map((r, i) => (
            <ListRow
              key={r.id}
              active={selectedId === r.id}
              badge={r.day != null ? `Day ${r.day}` : '—'}
              title={r.title || '(untitled)'}
              subtitle={`${r.artist || ''}${r.country ? ' · ' + r.country : ''}${
                r.published === false ? ' · hidden' : ''
              }`}
              onClick={() => ed.edit(r)}
              onUp={() => ed.move(i, -1)}
              onDown={() => ed.move(i, 1)}
              onDelete={() => {
                if (confirm(`Delete "${r.title}"?`)) ed.remove(r.id)
              }}
            />
          ))}
        </div>
      </aside>

      {/* form */}
      <section className="a-card p-5">
        {!draft ? (
          <p className="font-mono text-sm text-zinc-400">
            Select a song to edit, or add a new one.
          </p>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Day #">
                <Input
                  type="number"
                  value={draft.day}
                  onChange={(e) => patch({ day: e.target.value })}
                />
              </Field>
              <Field label="Year">
                <Input
                  type="number"
                  value={draft.year}
                  onChange={(e) => patch({ year: e.target.value })}
                />
              </Field>
              <div className="col-span-2 flex items-end">
                <Checkbox
                  label="Published (visible on the site)"
                  checked={draft.published}
                  onChange={(v) => patch({ published: v })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Title">
                <Input value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
              </Field>
              <Field label="Artist">
                <Input value={draft.artist} onChange={(e) => patch({ artist: e.target.value })} />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Country" hint="Type a country; its flag + sticker colours auto-load.">
                <Input
                  value={draft.country}
                  onChange={(e) => handleCountry(e.target.value)}
                  placeholder="e.g. Argentina"
                />
              </Field>
              <Field label="Region" hint="Songs sharing a region sit together on the ring.">
                <Select value={draft.region} onChange={(e) => patch({ region: e.target.value })}>
                  <option value="">— select a region —</option>
                  {[...new Set([...REGIONS, draft.region].filter(Boolean))].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Description">
              <TextArea
                rows={4}
                value={draft.description}
                onChange={(e) => patch({ description: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Listen link (href)" hint="Opens on “Listen +”.">
                <Input value={draft.href} onChange={(e) => patch({ href: e.target.value })} />
              </Field>
              <Field label="Watch link (Instagram)" hint="Opens on “Watch +”.">
                <Input
                  value={draft.instagram}
                  onChange={(e) => patch({ instagram: e.target.value })}
                />
              </Field>
            </div>

            {/* Flag — auto from the country, upload only when there's no built-in one */}
            <div className="border-t border-black/10 pt-4">
              <span className="a-label">Country flag</span>
              {flagKnown ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={draft.flag}
                      alt=""
                      className="h-10 w-14 rounded border border-black/15 bg-white object-contain"
                    />
                    <span className="font-mono text-[11px] text-zinc-500">
                      Auto-selected for {draft.country}.
                    </span>
                  </div>
                  <details className="rounded-md border border-black/10 px-3 py-2">
                    <summary className="cursor-pointer font-mono text-[11px] text-zinc-500">
                      Use a custom flag instead
                    </summary>
                    <div className="pt-3">
                      <FileField
                        kind="image"
                        folder="flags"
                        accept="image/svg+xml,image/*"
                        value={draft.flag}
                        onChange={handleFlag}
                      />
                    </div>
                  </details>
                </div>
              ) : (
                <FileField
                  kind="image"
                  folder="flags"
                  accept="image/svg+xml,image/*"
                  value={draft.flag}
                  onChange={handleFlag}
                  hint={
                    draft.country
                      ? `No built-in flag for “${draft.country}” — upload an SVG/PNG.`
                      : 'Pick a country above to auto-load its flag, or upload one.'
                  }
                />
              )}

              {draft.flag && (
                <div className="mt-3 flex items-center gap-3">
                  <YearSticker
                    year={draft.year || '——'}
                    country={draft.country}
                    palette={draft.palette}
                    width={72}
                  />
                  <div className="flex items-center gap-1">
                    {(draft.palette || []).map((c, i) => (
                      <span
                        key={i}
                        title={c}
                        style={{ backgroundColor: c }}
                        className="h-5 w-5 rounded border border-black/15"
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400">
                    year-sticker colours from the flag
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 border-t border-black/10 pt-4 sm:grid-cols-2">
              <FileField
                label="Album artwork (square)"
                kind="image"
                folder="covers"
                accept="image/*"
                value={draft.coverArt}
                onChange={(url) => patch({ coverArt: url })}
                hint="Square cover shown on the spinning ring and in the detail/crate popup."
              />
              <FileField
                label="Audio clip"
                kind="audio"
                folder="audio"
                accept="audio/*"
                value={draft.audio}
                onChange={(url) => patch({ audio: url })}
              />
            </div>

            <details className="rounded-md border border-black/10 px-3 py-2">
              <summary className="cursor-pointer font-mono text-[11px] text-zinc-500">
                Advanced · ID / slug
              </summary>
              <div className="pt-3">
                <Field label="ID (slug)" hint="Leave blank to auto-generate from the title.">
                  <Input value={draft.id} onChange={(e) => patch({ id: e.target.value })} />
                </Field>
              </div>
            </details>

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
