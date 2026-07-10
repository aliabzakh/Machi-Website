import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { songsByRegion } from '@/data/songs'
import { createMusicRing } from './musicRingEngine'
import YearSticker from '@/components/YearSticker'

const SERIES_TITLE = 'Discovering Music from Around the World'

// clou-style projects ring: a WebGL canvas draws the elliptical carousel
// (musicRingEngine.js) that auto-spins and can be dragged/flicked; this
// component layers the DOM UI above it — the loading counter and the hover
// preview panel — and owns the detail overlay. A hidden semantic list keeps
// the content crawlable and drives the no-WebGL fallback.
export default function MusicSection({ songs = [], contentReady = true }) {
  const regions = useMemo(() => songsByRegion(songs), [songs])

  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const previewTimer = useRef(null)

  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const [webglFailed, setWebglFailed] = useState(false)
  const [preview, setPreview] = useState(null) // hovered song → preview panel
  const [selected, setSelected] = useState(null) // song → full detail overlay
  const [inView, setInView] = useState(false)

  const schedulePreviewClear = useCallback(() => {
    clearTimeout(previewTimer.current)
    // small grace period so the cursor can travel to the panel's link
    previewTimer.current = setTimeout(() => setPreview(null), 220)
  }, [])

  const holdPreview = useCallback(() => clearTimeout(previewTimer.current), [])

  // ---- engine lifecycle ----
  // Wait for the live content to settle before building the ring so the WebGL
  // engine (and its single cover atlas) initialises exactly once, with final data.
  useEffect(() => {
    if (!contentReady) return
    const engine = createMusicRing(canvasRef.current, sectionRef.current, regions, {
      onProgress: setProgress,
      onReady: () => setReady(true),
      onHover: (song) => {
        if (song) {
          clearTimeout(previewTimer.current)
          setPreview(song)
        } else {
          schedulePreviewClear()
        }
      },
      onSelect: setSelected,
      onError: () => setWebglFailed(true),
    })
    engineRef.current = engine
    return () => {
      engineRef.current = null
      engine?.dispose()
      clearTimeout(previewTimer.current)
    }
  }, [regions, schedulePreviewClear, contentReady])

  // only run the draw loop while the ring is actually on screen
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.05,
    })
    io.observe(sectionRef.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    engineRef.current?.setRunning(ready && inView)
  }, [ready, inView])

  // Escape closes the detail overlay
  useEffect(() => {
    if (!selected) return
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  return (
    <section id="music" className="music-section" ref={sectionRef}>
      {/* ---- layer 0: the WebGL ring; layer 1: DOM overlay ---- */}
      <div className={`music-ringui${webglFailed ? ' is-off' : ''}${ready ? ' is-ready' : ''}`}>
        <canvas ref={canvasRef} className="music-canvas" aria-hidden="true" />

        {!ready && !webglFailed && (
          <p className="music-loading" role="status">
            Loading ({progress}%)
          </p>
        )}

        <div
          className={`music-preview${preview ? ' is-open' : ''}`}
          onMouseEnter={holdPreview}
          onMouseLeave={schedulePreviewClear}
        >
          {preview && (
            <>
              <p className="music-preview__eyebrow">
                Day {preview.day} — {preview.region}
              </p>
              <p className="music-preview__title">{preview.title}</p>
              <p className="music-preview__meta">
                {preview.artist} <span className="sep">/</span> {preview.year}
                <span className="sep">/</span> {preview.country}
              </p>
              <button
                type="button"
                className="music-preview__link"
                onClick={() => setSelected(preview)}
              >
                View song +
              </button>
            </>
          )}
        </div>
      </div>

      {/* jump-to-a-day picker + random-day die (bottom-right) */}
      <DayPicker songs={songs} onPick={setSelected} />

      {/* no-WebGL fallback: the crawlable list, shown as a plain index */}
      {webglFailed && (
        <div className="music-fallback">
          <ul>
            {songs.map((song) => (
              <li key={song.id}>
                <button type="button" onClick={() => setSelected(song)}>
                  {song.title} <span className="sep">/</span> {song.artist}
                  <span className="sep">/</span> {song.country}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* semantic source of truth — crawlable and usable without WebGL */}
      <ul className="visually-hidden">
        {songs.map((song) => (
          <li key={song.id}>
            <a href={song.href}>
              {song.title} — {song.artist} ({song.country}, {song.year})
            </a>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {selected && <MusicDetail song={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  )
}

// Which pips light up for each die face, laid out on a 3×3 grid (0–8).
const DIE_FACES = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

function Die({ face }) {
  const lit = new Set(DIE_FACES[face] || DIE_FACES[5])
  return (
    <span className="die" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={`die__pip${lit.has(i) ? ' is-on' : ''}`} />
      ))}
    </span>
  )
}

// Type a day number to jump straight to that post, or roll the die for a random
// one. Feeds the same detail overlay the ring cards open. Invalid input flashes
// an error popup that auto-dismisses.
function DayPicker({ songs, onPick }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [face, setFace] = useState(5)
  const errorTimer = useRef(null)

  const byDay = useMemo(() => {
    const m = new Map()
    for (const s of songs) m.set(s.day, s)
    return m
  }, [songs])

  const flashError = useCallback((msg) => {
    setError(msg)
    clearTimeout(errorTimer.current)
    errorTimer.current = setTimeout(() => setError(''), 2800)
  }, [])

  useEffect(() => () => clearTimeout(errorTimer.current), [])

  const rollDie = useCallback(() => {
    setFace((prev) => {
      let next = 1 + Math.floor(Math.random() * 6)
      if (next === prev) next = (next % 6) + 1
      return next
    })
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    const day = Number.parseInt(trimmed, 10)
    if (!trimmed || Number.isNaN(day)) {
      flashError('Type a day number first')
      return
    }
    const song = byDay.get(day)
    if (!song) {
      flashError(`Day ${day} isn’t in the collection`)
      return
    }
    setError('')
    onPick(song)
  }

  function handleRandom() {
    if (!songs.length) return
    rollDie()
    const song = songs[Math.floor(Math.random() * songs.length)]
    setValue(String(song.day))
    setError('')
    onPick(song)
  }

  return (
    <form className="day-picker" onSubmit={handleSubmit}>
      {error && (
        <p className="day-picker__error" role="alert">
          {error}
        </p>
      )}
      <input
        className="day-picker__input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Type a day"
        aria-label="Jump to a day number"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ''))}
      />
      <button
        type="button"
        className="day-picker__die"
        onClick={handleRandom}
        aria-label="Show a random day"
        title="Random day"
      >
        <Die face={face} />
      </button>
    </form>
  )
}

function MusicDetail({ song, onClose }) {
  return (
    <motion.div
      className="music-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button type="button" className="music-detail__close" onClick={onClose} aria-label="Close">
        ×
      </button>

      <motion.div
        className="music-detail__inner"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="music-detail__media">
          <img
            className="music-detail__cover"
            src={song.coverArt || song.cover}
            alt={song.title}
            draggable={false}
          />
          {song.flag && (
            <img
              className="music-detail__flag"
              src={song.flag}
              alt={`${song.country} flag`}
              draggable={false}
            />
          )}
          <YearSticker
            year={song.year}
            country={song.country}
            palette={song.palette}
            width={128}
            className="music-detail__sticker"
          />
        </div>

        <div className="music-detail__info">
          <p className="music-detail__eyebrow">
            <span className="music-detail__dot" aria-hidden="true" />
            Day {song.day} — {SERIES_TITLE}
          </p>
          <h2 className="music-detail__title">{song.title}</h2>

          <dl className="music-detail__meta">
            <div>
              <dt>Artist</dt>
              <dd>{song.artist}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{song.year}</dd>
            </div>
            <div>
              <dt>Country</dt>
              <dd>{song.country}</dd>
            </div>
          </dl>

          <p className="music-detail__desc">{song.description}</p>

          <div className="music-detail__links">
            <a
              className="music-detail__link"
              href={song.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              Listen +
            </a>
            {song.instagram && (
              <a
                className="music-detail__link"
                href={song.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch +
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
