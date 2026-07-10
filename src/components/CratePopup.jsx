import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import YearSticker from '@/components/YearSticker'

const SERIES_TITLE = 'Discovering Music from Around the World'

function randomTilt() {
  return Math.round((Math.random() * 24 - 12) * 10) / 10
}

// Vertical, low-info reveal shown when the welcome crate is clicked. Same design
// language as the ring-card detail (cover + flag + year sticker) plus a play
// button and Listen link. The paper un-crumple is a pure CSS transition: the
// browser natively interpolates the 12-point clip-path polygon from a crumpled
// blob to the flat rectangle (GSAP snaps it; SVG displacement froze the GPU).
export default function CratePopup({ song, onClose }) {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [playing, setPlaying] = useState(false)
  const closingRef = useRef(false)
  const audioRef = useRef(null)
  const rot = useRef(randomTilt())

  useLayoutEffect(() => {
    let raf2
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setOpen(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [])

  function handleClose() {
    if (closingRef.current) return
    closingRef.current = true
    audioRef.current?.pause() // stop the track when the card crumples away
    rot.current = randomTilt() // crumple away at a fresh angle
    setClosing(true)
    setOpen(false)
  }

  function handleCardTransitionEnd(e) {
    if (closingRef.current && e.target === e.currentTarget && e.propertyName === 'transform') {
      onClose()
    }
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function togglePlay() {
    const audio = audioRef.current
    if (audio) {
      if (audio.paused) audio.play()
      else audio.pause()
    } else if (song.href) {
      window.open(song.href, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className={`crate-pop${open ? ' is-open' : ''}${closing ? ' is-closing' : ''}`}>
      <div className="crate-pop__backdrop" onClick={handleClose} />

      <div
        className="crate-pop__card"
        style={{ '--crate-rot': `${rot.current}deg` }}
        onTransitionEnd={handleCardTransitionEnd}
      >
        <div className="crate-pop__paper">
          <div className="crate-pop__media">
            <img
              className="crate-pop__cover"
              src={song.coverArt || song.cover}
              alt={song.title}
              draggable={false}
            />
            {song.flag && (
              <img
                className="crate-pop__flag"
                src={song.flag}
                alt={`${song.country} flag`}
                draggable={false}
              />
            )}
            <YearSticker
              year={song.year}
              country={song.country}
              palette={song.palette}
              width={96}
              className="crate-pop__sticker"
            />
          </div>

          <div className="crate-pop__body">
            <div className="crate-pop__text">
              <p className="crate-pop__eyebrow">
                <span className="crate-pop__dot" aria-hidden="true" />
                Day {song.day} — {SERIES_TITLE}
              </p>
              <h3 className="crate-pop__title">{song.title}</h3>
              <p className="crate-pop__artist">{song.artist}</p>
            </div>

            <div className="crate-pop__actions">
              <button
                type="button"
                className={`crate-pop__play${playing ? ' is-playing' : ''}`}
                onClick={togglePlay}
                aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <a
                className="crate-pop__listen"
                href={song.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                Listen +
              </a>
            </div>
          </div>

          <div className="crate-pop__fold-shade" aria-hidden="true" />
        </div>

        <button type="button" className="crate-pop__close" aria-label="Close" onClick={handleClose}>
          ×
        </button>

        {song.audio && (
          <audio
            ref={audioRef}
            src={song.audio}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            preload="none"
          />
        )}
      </div>
    </div>
  )
}
