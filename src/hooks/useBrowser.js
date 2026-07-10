import { useEffect, useState } from 'react'

function detectEngine() {
  if (typeof navigator === 'undefined') return 'unknown'

  const ua = navigator.userAgent
  const hasAppleWebKit = /AppleWebKit\//.test(ua)
  const isChromiumLike = /Chrome\//.test(ua) || /Chromium\//.test(ua) || /CriOS\//.test(ua)
  const isBlinkLike =
    isChromiumLike || /Edg\//.test(ua) || /OPR\//.test(ua) || /SamsungBrowser\//.test(ua)
  const isGeckoLike = /Gecko\//.test(ua) && !/like Gecko/.test(ua)

  if (isGeckoLike) return 'gecko'
  if (isBlinkLike && hasAppleWebKit) return 'chromium'
  if (hasAppleWebKit) return 'webkit'
  return 'unknown'
}

export function useBrowserEngine() {
  const [engine, setEngine] = useState('unknown')

  useEffect(() => {
    setEngine(detectEngine())
  }, [])

  return engine
}
