import { useEffect, useState } from 'react'

/**
 * Tracks which of the given section ids is most in view.
 * Returns the id of the section with the largest visible ratio.
 */
export function useActiveSection(ids) {
  const key = ids.join(',')
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const ratios = new Map()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => ratios.set(entry.target.id, entry.intersectionRatio))
        let best = null
        let bestRatio = -1
        ratios.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio
            best = id
          }
        })
        if (best) setActive(best)
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    )

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return active
}
