import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Fades through translations of a word.
 * Order each loop: the `fixed` list (en, es, pt, fr, de) in order,
 * then 5 languages picked/shuffled from `pool`, then it repeats
 * (re-shuffling the pool each loop). When `active` is false it holds
 * on the first (English) word and stops cycling.
 */
export default function TranslatingWord({
  fixed,
  pool = [],
  active = true,
  className,
  holdMs = 1700,
  fadeMs = 380,
}) {
  const [word, setWord] = useState(fixed[0])
  const seqRef = useRef([])
  const posRef = useRef(0)

  useEffect(() => {
    if (!active) {
      setWord(fixed[0])
      return
    }

    const buildSeq = () => [...fixed, ...shuffle(pool).slice(0, 5)]
    seqRef.current = buildSeq()
    posRef.current = 0
    setWord(seqRef.current[0])

    let timer
    const step = () => {
      posRef.current += 1
      if (posRef.current >= seqRef.current.length) {
        seqRef.current = buildSeq()
        posRef.current = 0
      }
      setWord(seqRef.current[posRef.current])
      timer = setTimeout(step, holdMs)
    }
    timer = setTimeout(step, holdMs)
    return () => clearTimeout(timer)
  }, [active, fixed, pool, holdMs])

  return (
    <span className={className} style={{ display: 'inline-block' }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={word}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fadeMs / 1000, ease: 'easeInOut' }}
          style={{ display: 'inline-block' }}
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
