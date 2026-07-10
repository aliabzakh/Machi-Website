import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

// Pool of "hello" translations the cloud cycles through — deliberately wider
// than the WELCOME nav word so the cloud doesn't just mirror it.
const GREETINGS = [
  'hola', // Spanish
  'سلام', // Persian/Arabic — salam
  'hello', // English
  'hej', // Swedish
  'salut', // French
  'ciao', // Italian
  'hallo', // German
  'olá', // Portuguese
  'merhaba', // Turkish
  'नमस्ते', // Hindi — namaste
  '你好', // Mandarin Chinese — ni hao
  'γεια', // Greek — geia
  'أهلاً', // Arabic — ahlan
  'kamusta', // Filipino (Tagalog)
  'jambo', // Swahili
  'xin chào', // Vietnamese
  'こんにちは', // Japanese — konnichiwa
  'привет', // Russian — privet
  'sveiki', // Latvian
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// One floating word in the greeting cloud: holds a spot on screen and cycles
// through a shuffled sequence of "hello" translations, cross-fading between
// them (same fade mechanic as TranslatingWord on the ME section's logo). Each
// instance runs its own independent, staggered clock so the whole cloud
// doesn't pulse in sync.
function FloatingWord({ style, holdMs, startDelayMs }) {
  const [word, setWord] = useState('')
  const seqRef = useRef(shuffle(GREETINGS))
  const posRef = useRef(0)

  useEffect(() => {
    let cycle
    const step = () => {
      posRef.current = (posRef.current + 1) % seqRef.current.length
      if (posRef.current === 0) seqRef.current = shuffle(GREETINGS)
      setWord(seqRef.current[posRef.current])
      cycle = setTimeout(step, holdMs)
    }
    const start = setTimeout(() => {
      setWord(seqRef.current[0])
      cycle = setTimeout(step, holdMs)
    }, startDelayMs)
    return () => {
      clearTimeout(start)
      clearTimeout(cycle)
    }
  }, [holdMs, startDelayMs])

  return (
    <span className="contact-word" style={style}>
      <AnimatePresence mode="wait">
        {word && (
          <motion.span
            key={word}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            style={{ display: 'inline-block' }}
          >
            {word}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

// Roughly matches the reference layout: a loose scatter of greetings across
// the upper-right, sized unevenly, leaving the lower-left clear for the
// heading.
const CLOUD_LAYOUT = [
  { top: '34%', left: '44%', fontSize: 'clamp(20px, 2.2vw, 30px)', holdMs: 2600, delay: 200 },
  { top: '31%', left: '64%', fontSize: 'clamp(50px, 6vw, 86px)', holdMs: 3300, delay: 0 },
  { top: '42%', left: '30%', fontSize: 'clamp(24px, 2.8vw, 38px)', holdMs: 2900, delay: 950 },
  { top: '37%', left: '80%', fontSize: 'clamp(22px, 2.4vw, 32px)', holdMs: 2400, delay: 550 },
  { top: '51%', left: '54%', fontSize: 'clamp(56px, 6.5vw, 96px)', holdMs: 3500, delay: 1400 },
  { top: '60%', left: '28%', fontSize: 'clamp(40px, 5vw, 66px)', holdMs: 3000, delay: 300 },
  { top: '55%', left: '72%', fontSize: 'clamp(22px, 2.4vw, 32px)', holdMs: 2700, delay: 1150 },
]

export default function ContactSection() {
  return (
    <section id="contact" className="contact-section">
      <div className="contact-cloud" aria-hidden="true">
        {CLOUD_LAYOUT.map((spot, i) => (
          <FloatingWord
            key={i}
            style={{ top: spot.top, left: spot.left, fontSize: spot.fontSize }}
            holdMs={spot.holdMs}
            startDelayMs={spot.delay}
          />
        ))}
      </div>

      <div className="contact-body">
        <h2 className="contact-heading">contact me</h2>
        <a className="contact-email" href="mailto:machisbusiness@gmail.com">
          machisbusiness@gmail.com <span className="dash">–</span>
        </a>
      </div>
    </section>
  )
}
