import { useEffect, useRef, useState } from 'react'
import { ExternalLink, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import {
  FileCaption,
  FileContent,
  FileHeader,
  FileInfo,
  FileTitle,
} from './FileContent'

// Machi's discoveries — the audio srcs are placeholder previews (swap the
// /public/audio/*.mp3 files for real clips); href links out to the full track.
// Used as the fallback when the CMS hasn't supplied a rotation list.
const DEFAULT_TRACKS = [
  {
    title: "L'estaca",
    artist: 'Lluís Llach',
    src: '/audio/rotation-1.mp3',
    href: 'https://www.youtube.com/results?search_query=Lluis+Llach+L%27estaca',
  },
  {
    title: 'Moratuwa',
    artist: 'The Super Golden Chimes',
    src: '/audio/rotation-2.mp3',
    href: 'https://www.youtube.com/results?search_query=Super+Golden+Chimes+Moratuwa',
  },
  {
    title: "Deki Erey (Emni'Are)",
    artist: 'Abraham Afewerki',
    src: '/audio/rotation-3.mp3',
    href: 'https://www.youtube.com/results?search_query=Abraham+Afewerki+Deki+Erey',
  },
]

const randomDeckColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`

const InRotationFile = ({ tracks: tracksProp }) => {
  const tracks = tracksProp && tracksProp.length ? tracksProp : DEFAULT_TRACKS
  const audioRef = useRef(null)
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [deckColor, setDeckColor] = useState('#f4f4f5')

  // keep the <audio> element in sync with volume/mute state
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted
  }, [muted])

  const playIndex = (index) => {
    const audio = audioRef.current
    if (!audio) return
    if (index === current) {
      // toggle current track
      if (audio.paused) audio.play()
      else audio.pause()
      return
    }
    setCurrent(index)
    audio.src = tracks[index].src
    audio.play()
  }

  const toggleTurntable = () => playIndex(current)

  const track = tracks[current]

  return (
    <FileContent>
      <FileInfo>
        <FileHeader>
          <FileTitle>In Rotation</FileTitle>
          <FileCaption>Now playing</FileCaption>
        </FileHeader>

        <ol className="mt-1 flex flex-col gap-1.5">
          {tracks.map((t, i) => {
            const isCurrent = i === current
            return (
              <li key={t.title} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playIndex(i)}
                  className="flex flex-1 items-center gap-2 text-left"
                  aria-label={`Play ${t.title} by ${t.artist}`}
                >
                  <span
                    className={
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ' +
                      (isCurrent && playing ? 'bg-black text-white' : 'bg-white text-black')
                    }
                  >
                    {isCurrent && playing ? <Pause size={11} /> : <Play size={11} />}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={
                        'block truncate font-mono text-xs ' +
                        (isCurrent ? 'font-semibold' : 'font-normal')
                      }
                    >
                      {t.title}
                    </span>
                    <span className="text-muted-foreground block truncate text-[10px]">
                      {t.artist}
                    </span>
                  </span>
                </button>
                <a
                  href={t.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  aria-label={`Open ${t.title} in a new tab`}
                >
                  <ExternalLink size={13} />
                </a>
              </li>
            )
          })}
        </ol>
      </FileInfo>

      {/* Turntable */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <button
          type="button"
          onClick={toggleTurntable}
          aria-label={playing ? 'Pause' : 'Play'}
          className="relative flex items-center justify-center"
        >
          <TurntableGraphic playing={playing} deckColor={deckColor} />
        </button>

        {/* controls */}
        <div className="flex w-full max-w-[220px] items-center gap-2">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white hover:bg-black hover:text-white"
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value))
              if (muted) setMuted(false)
            }}
            aria-label="Volume"
            className="h-1 flex-1 cursor-pointer accent-black"
          />
        </div>
        <p className="text-muted-foreground max-w-[220px] truncate text-center font-mono text-[10px]">
          {playing ? `♪ ${track.title} — ${track.artist}` : 'tap the record to play'}
        </p>
      </div>

      <audio
        ref={audioRef}
        src={tracks[0].src}
        onPlay={() => {
          setPlaying(true)
          setDeckColor(randomDeckColor())
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        preload="none"
      />
    </FileContent>
  )
}

const TurntableGraphic = ({ playing, deckColor = '#f4f4f5' }) => {
  return (
    <div className="relative h-[190px] w-[190px]">
      {/* platter base — colour changes on each play */}
      <div
        className="absolute inset-0 rounded-lg border transition-colors duration-500"
        style={{ backgroundColor: deckColor }}
      />
      {/* vinyl record */}
      <div
        className={
          'absolute inset-[14px] rounded-full ' + (playing ? 'vinyl-spin' : '')
        }
        style={{
          background:
            'repeating-radial-gradient(circle at center, #111 0 2px, #1c1c1c 2px 3px), radial-gradient(circle at center, #111, #000)',
        }}
      >
        {/* grooves highlight */}
        <div className="absolute inset-[10px] rounded-full border border-white/5" />
        <div className="absolute inset-[26px] rounded-full border border-white/5" />
        {/* center label */}
        <div className="absolute inset-0 m-auto flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#f4c04d] text-[8px] font-bold text-black">
          machi7k
        </div>
        {/* spindle */}
        <div className="absolute inset-0 m-auto h-[6px] w-[6px] rounded-full bg-zinc-200" />
      </div>
      {/* tonearm */}
      <div
        className="absolute -top-1 right-1 h-[120px] w-[8px] origin-top rounded-full bg-zinc-400 transition-transform duration-700"
        style={{ transform: playing ? 'rotate(24deg)' : 'rotate(-2deg)' }}
      >
        <div className="absolute -top-[6px] -left-[4px] h-[16px] w-[16px] rounded-full bg-zinc-500" />
        <div className="absolute -bottom-[6px] left-1/2 h-[10px] w-[12px] -translate-x-1/2 rounded-sm bg-zinc-600" />
      </div>
    </div>
  )
}

export default InRotationFile
