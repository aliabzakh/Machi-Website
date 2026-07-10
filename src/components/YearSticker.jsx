import { flagPalette } from '@/data/flagPalettes'

// Hand-drawn wobbly ovals lifted from the reference sticker sheet so the shape
// matches exactly; only the colours + year change per song.
const OUTER_OVAL =
  'M60.83 16.85C32.91 21.15 12.36 38.13 14.93 54.79C17.49 71.44 42.20 81.46 70.12 77.16C98.04 72.86 118.59 55.88 116.02 39.22C113.46 22.57 88.75 12.55 60.83 16.85Z'
const INNER_OVAL =
  'M61.27 19.69C35.98 23.59 17.36 38.97 19.69 54.05C22.01 69.14 44.39 78.21 69.68 74.32C94.96 70.43 113.58 55.04 111.26 39.96C108.94 24.87 86.55 15.80 61.27 19.69Z'

// Deterministic small tilt per sticker so each looks hand-placed but never
// upside down — some lean left, some right, a few degrees each.
function tiltFor(key) {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  let angle = (h % 2001) / 2000 // 0..1
  angle = angle * 20 - 10 // -10..10
  if (Math.abs(angle) < 3) angle += angle >= 0 ? 4 : -4
  return Math.round(angle * 10) / 10
}

export default function YearSticker({
  year,
  country,
  palette,
  width = 118,
  className = '',
  style = {},
}) {
  // An explicit palette (derived from the song's flag in the CMS) wins; otherwise
  // fall back to the hand-tuned per-country map, then a neutral default.
  const [outer, inner, text] =
    Array.isArray(palette) && palette.length === 3 ? palette : flagPalette(country)
  const angle = tiltFor(`${country}-${year}`)
  return (
    <span
      className={`year-sticker ${className}`.trim()}
      style={{ display: 'inline-block', width, transform: `rotate(${angle}deg)`, ...style }}
      role="img"
      aria-label={`${year}`}
    >
      <svg viewBox="0 0 131 94" width="100%" style={{ display: 'block', overflow: 'visible' }}>
        <path d={OUTER_OVAL} fill={outer} />
        <path d={INNER_OVAL} fill={inner} />
        <text
          x="65.5"
          y="49"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Averia, Georgia, serif"
          fontWeight="700"
          fontSize="34"
          fill={text}
        >
          {year}
        </text>
      </svg>
    </span>
  )
}
