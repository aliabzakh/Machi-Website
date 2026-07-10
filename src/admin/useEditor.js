import { useCallback, useEffect, useState } from 'react'
import { adminFetch, upsertRow, deleteRow, saveOrder } from '@/data/content'

// Generic list+form controller shared by the three editors. Parameterised by the
// table name, the row<->draft mappers, a blank-draft factory, and an optional
// `normalize` that fills in derived fields (e.g. a slug id) right before saving.
export function useEditor({ table, fromRow, toRow, makeBlank, normalize = (d) => d }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setRows(await adminFetch(table))
    } catch (e) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [table])

  useEffect(() => {
    reload()
  }, [reload])

  const edit = (row) => {
    setStatus('')
    setError('')
    setSelectedId(row.id)
    setDraft(fromRow(row))
  }

  const create = () => {
    setStatus('')
    setError('')
    setSelectedId('__new__')
    setDraft(makeBlank(rows))
  }

  const cancel = () => {
    setSelectedId(null)
    setDraft(null)
    setStatus('')
  }

  const patch = (changes) => setDraft((d) => ({ ...d, ...changes }))

  const save = async () => {
    if (!draft) return
    setSaving(true)
    setStatus('')
    setError('')
    try {
      const isNew = selectedId === '__new__'
      const sortOrder = isNew
        ? rows.length
        : (rows.find((r) => r.id === draft.id)?.sort_order ?? rows.length)
      const clean = normalize({ ...draft, sortOrder })
      await upsertRow(table, toRow(clean))
      await reload()
      setSelectedId(clean.id)
      setDraft(clean)
      setStatus('Saved ✓')
    } catch (e) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    setError('')
    try {
      await deleteRow(table, id)
      if (selectedId === id) cancel()
      await reload()
    } catch (e) {
      setError(e.message || 'Delete failed')
    }
  }

  const move = async (index, dir) => {
    const j = index + dir
    if (j < 0 || j >= rows.length) return
    const swapped = [...rows]
    ;[swapped[index], swapped[j]] = [swapped[j], swapped[index]]
    // Keep the local sort_order in sync so a later save preserves this ordering.
    const next = swapped.map((r, k) => ({ ...r, sort_order: k }))
    setRows(next)
    try {
      await saveOrder(table, next.map((r) => r.id))
    } catch (e) {
      setError(e.message || 'Reorder failed')
      reload()
    }
  }

  return {
    rows,
    loading,
    error,
    selectedId,
    draft,
    saving,
    status,
    edit,
    create,
    cancel,
    patch,
    save,
    remove,
    move,
  }
}
