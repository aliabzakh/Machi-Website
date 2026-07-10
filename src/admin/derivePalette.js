// Pull a 3-colour sticker palette [outer ring, inner fill, year text] from a flag
// image by sampling its pixels. Runs in the admin (browser) when a flag is set,
// and the result is stored on the song so the year sticker is coloured to that
// flag — for ANY country, not just the hand-tuned ones in flagPalettes.js.
//
// Same-origin flags (/flags/lib/*) always work. Cross-origin (uploaded) flags
// need CORS on the bucket; if the canvas is tainted we just return null and the
// site falls back to flagPalettes / the neutral default.

const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, '0')).join('')
const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
const dist = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b)
const shade = (c, d) => ({
  r: Math.max(0, Math.min(255, c.r + d)),
  g: Math.max(0, Math.min(255, c.g + d)),
  b: Math.max(0, Math.min(255, c.b + d)),
})

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export async function derivePalette(url) {
  if (!url) return null
  let img
  try {
    img = await loadImage(url)
  } catch {
    return null
  }

  const ratio = img.naturalWidth ? img.naturalHeight / img.naturalWidth : 0.66
  const w = 64
  const h = Math.max(1, Math.round(64 * ratio))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, w, h)

  let data
  try {
    data = ctx.getImageData(0, 0, w, h).data
  } catch {
    return null // tainted canvas (cross-origin without CORS)
  }

  // Bucket colours (rounding tames anti-aliasing) and average each bucket.
  const buckets = new Map()
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const key = (Math.round(r / 24) << 16) | (Math.round(g / 24) << 8) | Math.round(b / 24)
    const e = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 }
    e.r += r
    e.g += g
    e.b += b
    e.n++
    buckets.set(key, e)
  }

  const sorted = [...buckets.values()]
    .map((e) => ({ r: Math.round(e.r / e.n), g: Math.round(e.g / e.n), b: Math.round(e.b / e.n), n: e.n }))
    .sort((a, b) => b.n - a.n)
  if (!sorted.length) return null

  // Distinct dominant colours by area.
  const picks = []
  for (const c of sorted) {
    if (picks.every((p) => dist(p, c) > 60)) picks.push(c)
    if (picks.length >= 3) break
  }

  // Map up to three flag colours onto [outer ring, inner fill, year text].
  const BLACK = { r: 17, g: 17, b: 17 }
  const WHITE = { r: 255, g: 255, b: 255 }
  const readable = (bg) => (lum(bg) > 140 ? BLACK : WHITE)

  let outer, inner, text
  if (picks.length >= 3) {
    // Use the three most prominent colours. The highest-contrast pair becomes
    // fill + text (so the year stays legible); the third colour is the ring.
    let bi = 0
    let bj = 1
    let best = -1
    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 3; j++) {
        const d = Math.abs(lum(picks[i]) - lum(picks[j]))
        if (d > best) {
          best = d
          bi = i
          bj = j
        }
      }
    }
    const lighter = lum(picks[bi]) >= lum(picks[bj]) ? picks[bi] : picks[bj]
    inner = lighter
    text = lighter === picks[bi] ? picks[bj] : picks[bi]
    outer = picks.find((_, k) => k !== bi && k !== bj)
  } else if (picks.length === 2) {
    // Only two flag colours: lighter fills, darker does double duty as ring + text.
    const lighter = lum(picks[0]) >= lum(picks[1]) ? picks[0] : picks[1]
    inner = lighter
    text = lighter === picks[0] ? picks[1] : picks[0]
    outer = text
  } else {
    inner = picks[0]
    outer = shade(picks[0], lum(picks[0]) > 128 ? -60 : 60)
    text = readable(picks[0])
  }

  // Design safety nets:
  // 1) the year must stay legible — light fill → dark text, dark fill → light text.
  if (Math.abs(lum(text) - lum(inner)) < 70) text = readable(inner)
  // 2) the ring must not disappear into the fill.
  if (dist(outer, inner) < 40) outer = shade(outer, lum(inner) > 128 ? -70 : 70)

  return [hex(outer), hex(inner), hex(text)]
}
