// Per-country sticker palettes, pulled from each flag's main colours.
// Order is [outer ring, inner fill, year text] — matching the 3-colour sample
// stickers. Text colour is chosen to stay readable on the inner fill.
export const FLAG_PALETTES = {
  Catalonia: ['#C60B1E', '#FCDD09', '#0B4EA2'],
  'Sri Lanka': ['#8D2029', '#F5B70A', '#00534E'],
  Eritrea: ['#12AD2B', '#EA0437', '#FFC72C'],
  Argentina: ['#74ACDF', '#FFFFFF', '#3C6DA5'],
  Peru: ['#D91023', '#FFFFFF', '#A00C1A'],
  Chile: ['#0039A6', '#FFFFFF', '#D52B1E'],
  Nigeria: ['#008751', '#FFFFFF', '#00602F'],
  Senegal: ['#E31B23', '#FCD116', '#00853F'],
  Cameroon: ['#007A5E', '#CE1126', '#FCD116'],
  Japan: ['#BC002D', '#FFFFFF', '#BC002D'],
  Taiwan: ['#000095', '#FE0000', '#FFFFFF'],
  Korea: ['#003478', '#FFFFFF', '#C60C30'],
  Algeria: ['#006233', '#FFFFFF', '#D21034'],
  Egypt: ['#CE1126', '#FFFFFF', '#111111'],
  Jamaica: ['#009B3A', '#FED100', '#111111'],
  Cuba: ['#002A8F', '#FFFFFF', '#CB1515'],
}

const DEFAULT_PALETTE = ['#2B2B2B', '#F2C14E', '#C0392B']

export function flagPalette(country) {
  return FLAG_PALETTES[country] || DEFAULT_PALETTE
}
