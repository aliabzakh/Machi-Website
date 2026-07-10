import { useEffect, useMemo, useRef, useState } from 'react'
import SplatCrate from './components/SplatCrate.jsx'
import CratePopup from './components/CratePopup.jsx'
import MeSection from './components/MeSection.jsx'
import MusicSection from './components/music/MusicSection.jsx'
import ContactSection from './components/ContactSection.jsx'
import TranslatingWord from './components/TranslatingWord.jsx'
import Cursor from './components/Cursor.jsx'
import { useActiveSection } from './hooks/useActiveSection.js'
import { useContent } from './hooks/useContent.js'
import './App.css'

const SECTION_IDS = ['welcome', 'me', 'music', 'contact']

// "welcome" through the languages: en, es, pt, fr, de, ar, then 5 shuffled from the pool.
const WELCOME_FIXED = ['Welcome', 'Bienvenido', 'Bem-vindo', 'Bienvenue', 'Willkommen', 'أهلاً']
const WELCOME_POOL = [
  'Benvenuto',
  'Välkommen',
  'Καλώς ήρθες',
  'ようこそ',
  'Karibu',
  'Hoş geldin',
  'Witaj',
]

// "me" through the languages: en, es, pt, fr, de, ar, then 5 shuffled from the pool.
const ME_FIXED = ['me', 'yo', 'eu', 'moi', 'ich', 'أنا']
const ME_POOL = ['io', 'ben', '私', 'mimi', 'εγώ', 'ik', 'jag']

// "music around the world" through the languages.
const MUSIC_FIXED = [
  'Music Around the World',
  'Música alrededor del mundo',
  'Música ao redor do mundo',
  'Musique autour du monde',
  'Musik aus aller Welt',
  'موسيقى حول العالم',
]
const MUSIC_POOL = [
  'Musica da tutto il mondo',
  '世界中の音楽',
  'Muziki kutoka kote ulimwenguni',
  'Dünyanın her yerinden müzik',
  'Muzyka z całego świata',
  '전 세계의 음악',
]

// "contact me" through the languages.
const CONTACT_FIXED = [
  'Contact Me',
  'Contáctame',
  'Fale comigo',
  'Contactez-moi',
  'Kontaktiere mich',
  'اتصل بي',
]
const CONTACT_POOL = [
  'Contattami',
  '連絡してね',
  'Wasiliana nami',
  'Bana ulaş',
  'Skontaktuj się',
  '연락하기',
]

const navItems = [
  { label: 'WELCOME', section: 'welcome', fixed: WELCOME_FIXED, pool: WELCOME_POOL },
  { label: 'ME', section: 'me', fixed: ME_FIXED, pool: ME_POOL },
  { label: 'MUSIC AROUND THE WORLD', section: 'music', fixed: MUSIC_FIXED, pool: MUSIC_POOL },
  { label: 'CONTACT ME', section: 'contact', fixed: CONTACT_FIXED, pool: CONTACT_POOL },
]

const socialLinks = [
  { label: 'INSTAGRAM', href: 'https://www.instagram.com/machi7k/' },
  { label: 'TIKTOK', href: 'https://www.tiktok.com/@machi7k' },
  { label: 'YOUTUBE', href: 'https://www.youtube.com/@machi7k' },
]

// The crate reveals one of the fully-built Day posts (those with real artwork).
function pickRandomSong(list, lastIndex) {
  if (list.length === 1) return { song: list[0], index: 0 }
  let index = Math.floor(Math.random() * list.length)
  while (index === lastIndex) {
    index = Math.floor(Math.random() * list.length)
  }
  return { song: list[index], index }
}

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function App() {
  const [reveal, setReveal] = useState(null)
  const lastIndexRef = useRef(-1)
  const active = useActiveSection(SECTION_IDS)

  // Live content (songs / rotation / cabinet tabs) with instant defaults fallback.
  const { songs, rotation, tabs, ready } = useContent()
  const crateSongs = useMemo(() => songs.filter((s) => s.coverArt), [songs])

  // Only one <audio> plays at a time across the whole page — starting the crate
  // popup's track stops the In Rotation turntable and vice versa. ('play' doesn't
  // bubble, so listen in the capture phase.)
  useEffect(() => {
    const onPlay = (e) => {
      const el = e.target
      if (el && el.tagName === 'AUDIO') {
        document.querySelectorAll('audio').forEach((a) => {
          if (a !== el) a.pause()
        })
      }
    }
    document.addEventListener('play', onPlay, true)
    return () => document.removeEventListener('play', onPlay, true)
  }, [])

  function handleActivate(originRect) {
    if (reveal || !crateSongs.length) return
    const { song, index } = pickRandomSong(crateSongs, lastIndexRef.current)
    lastIndexRef.current = index
    setReveal({ song, originRect })
  }

  return (
    <>
      <Cursor />

      <nav className="chrome chrome-nav">
        <ul>
          {navItems.map((item) => {
            const isActive = item.section === active
            return (
              <li key={item.section} className={isActive ? 'is-active' : ''}>
                <button
                  type="button"
                  className="nav-link"
                  onClick={() => scrollToSection(item.section)}
                >
                  <span className="dash">–</span>{' '}
                  <TranslatingWord fixed={item.fixed} pool={item.pool} active={isActive} />
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <button
        type="button"
        className="chrome chrome-logo"
        onClick={() => scrollToSection('welcome')}
        aria-label="Back to top"
      >
        machi7k
      </button>

      <footer className={`chrome chrome-socials ${active !== 'welcome' ? 'is-hidden' : ''}`}>
        <ul>
          {socialLinks.map((item) => (
            <li key={item.label}>
              <a href={item.href} target="_blank" rel="noreferrer">
                {item.label} <span className="dash">–</span>
              </a>
            </li>
          ))}
        </ul>
      </footer>

      <main>
        <section id="welcome" className="welcome-section">
          <div className="welcome-stage">
            <SplatCrate onActivate={handleActivate} disabled={!!reveal} />
          </div>
        </section>

        <MeSection tabs={tabs} rotation={rotation} />

        <MusicSection songs={songs} contentReady={ready} />

        <ContactSection />
      </main>

      {reveal && <CratePopup song={reveal.song} onClose={() => setReveal(null)} />}
    </>
  )
}

export default App
