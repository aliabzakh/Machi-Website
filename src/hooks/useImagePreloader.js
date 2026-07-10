import { useEffect, useState } from 'react'

export function useImagePreloader(urls) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    Promise.all(
      urls.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image()
            img.src = src
            img.onload = () => resolve()
            img.onerror = () => resolve()
          }),
      ),
    ).then(() => {
      if (!cancelled) setLoaded(true)
    })

    return () => {
      cancelled = true
    }
  }, [urls])

  return loaded
}
