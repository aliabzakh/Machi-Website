// "Discovering Music from Around the World" — each entry is one of Machi's daily
// posts. `cover` points at the post artwork in /public/images. Add more entries
// here and the ring fills out automatically (the ring repeats this list until it
// has enough cards to read as a ring).
//
// `region` groups songs into the world-region labels drawn around the ring
// (clou-style). Songs that share a `region` sit in the same contiguous arc of the
// ring, and each region gets one label + a "region screen". Add more songs with
// the same region to grow that arc and its label count.
//
// `instagram` is the "Watch" link on the detail overlay — swap it for the exact
// reel URL for that Day post whenever it's ready (defaults to the profile).
export const songs = [
  {
    id: 'lestaca',
    day: 156,
    title: "L'estaca",
    artist: 'Lluís Llach',
    year: 1969,
    country: 'Catalonia',
    region: 'Southern Europe',
    cover: '/images/placeholder-1.svg',
    coverArt: '/images/cover-156.png',
    flag: '/flags/es-ct.svg',
    audio: '/audio/rotation-1.mp3',
    href: 'https://www.youtube.com/results?search_query=Lluis+Llach+L%27estaca',
    instagram: 'https://www.instagram.com/machi7k/',
    description:
      "A Catalan song written by Lluís Llach in 1968. Its metaphor of a stake ('l'estaca') lashed to a post became an anthem of resistance under Franco, and has since been reworked into dozens of languages as a protest song around the world.",
  },
  {
    id: 'moratuwa',
    day: 154,
    title: 'Moratuwa',
    artist: 'The Super Golden Chimes',
    year: 1973,
    country: 'Sri Lanka',
    region: 'South Asia',
    cover: '/images/placeholder-2.svg',
    coverArt: '/images/cover-154.png',
    flag: '/flags/lk.svg',
    audio: '/audio/rotation-2.mp3',
    href: 'https://www.youtube.com/results?search_query=Super+Golden+Chimes+Moratuwa',
    instagram: 'https://www.instagram.com/machi7k/',
    description:
      "A Sinhala-language track by The Super Golden Chimes, one of Sri Lanka's leading pop bands of the late '60s and '70s, named after the coastal city of Moratuwa.",
  },
  {
    id: 'dekierey',
    day: 153,
    title: "Deki Erey (Emni'Are)",
    artist: 'Abraham Afewerki',
    year: 2000,
    country: 'Eritrea',
    region: 'East Africa',
    cover: '/images/placeholder-3.svg',
    coverArt: '/images/cover-153.png',
    flag: '/flags/er.svg',
    audio: '/audio/rotation-3.mp3',
    href: 'https://www.youtube.com/results?search_query=Abraham+Afewerki+Deki+Erey',
    instagram: 'https://www.instagram.com/machi7k/',
    description:
      'From Eritrean singer-songwriter Abraham Afewerki — one of the most influential voices in modern Eritrean music — blending traditional Tigrinya melodies with contemporary arrangements.',
  },

  // ------------------------------------------------------------------
  // PLACEHOLDER posts below — layout preview only (ph-*.svg covers).
  // Swap each for a real Day post (drop the art in /public/images and
  // update `cover`) or delete the entry; the ring re-lays itself out.
  // ------------------------------------------------------------------
  {
    id: 'ph-zamba',
    day: 149,
    title: 'Zamba de Mi Esperanza',
    artist: 'Jorge Cafrune',
    year: 1964,
    country: 'Argentina',
    region: 'Latin America',
    cover: '/images/ph-la-1.svg',
    href: 'https://www.youtube.com/results?search_query=Jorge+Cafrune+Zamba+de+Mi+Esperanza',
    instagram: 'https://www.instagram.com/machi7k/',
    description: 'Placeholder — swap in the real Day post for this track.',
  },
  {
    id: 'ph-quimey',
    day: 147,
    title: 'Quimey Neuquén',
    artist: 'José Larralde',
    year: 1969,
    country: 'Argentina',
    region: 'Latin America',
    cover: '/images/ph-la-2.svg',
    href: 'https://www.youtube.com/results?search_query=Jose+Larralde+Quimey+Neuquen',
    instagram: 'https://www.instagram.com/machi7k/',
    description: 'Placeholder — swap in the real Day post for this track.',
  },
  {
    id: 'ph-marialando',
    day: 146,
    title: 'María Landó',
    artist: 'Susana Baca',
    year: 1995,
    country: 'Peru',
    region: 'Latin America',
    cover: '/images/ph-la-3.svg',
    href: 'https://www.youtube.com/results?search_query=Susana+Baca+Maria+Lando',
    instagram: 'https://www.instagram.com/machi7k/',
    description: 'Placeholder — swap in the real Day post for this track.',
  },
  {
    id: 'ph-plegaria',
    day: 145,
    title: 'Plegaria a un Labrador',
    artist: 'Víctor Jara',
    year: 1969,
    country: 'Chile',
    region: 'Latin America',
    cover: '/images/ph-la-4.svg',
    href: 'https://www.youtube.com/results?search_query=Victor+Jara+Plegaria+a+un+Labrador',
    instagram: 'https://www.instagram.com/machi7k/',
    description: 'Placeholder — swap in the real Day post for this track.',
  },
  {
    id: 'ph-sweetmother',
    day: 142,
    title: 'Sweet Mother',
    artist: 'Prince Nico Mbarga',
    year: 1976,
    country: 'Nigeria',
    region: 'West Africa',
    cover: '/images/ph-wa-1.svg',
    href: 'https://www.youtube.com/results?search_query=Prince+Nico+Mbarga+Sweet+Mother',
    instagram: 'https://www.instagram.com/machi7k/',
    description: 'Placeholder — swap in the real Day post for this track.',
  },
  {
    id: 'ph-fatouyo',
    day: 141,
    title: 'Fatou Yo',
    artist: 'Touré Kunda',
    year: 1985,
    country: 'Senegal',
    region: 'West Africa',
    cover: '/images/ph-wa-2.svg',
    href: 'https://www.youtube.com/results?search_query=Toure+Kunda+Fatou+Yo',
    instagram: 'https://www.instagram.com/machi7k/',
    description: 'Placeholder — swap in the real Day post for this track.',
  },
  {
    id: 'ph-soulmakossa',
    day: 140,
    title: 'Soul Makossa',
    artist: 'Manu Dibango',
    year: 1972,
    country: 'Cameroon',
    region: 'West Africa',
    cover: '/images/ph-wa-3.svg',
    href: 'https://www.youtube.com/results?search_query=Manu+Dibango+Soul+Makossa',
    instagram: 'https://www.instagram.com/machi7k/',
    description: 'Placeholder — swap in the real Day post for this track.',
  },
  {
    id: 'ph-ueomuite',
    day: 138,
    title: 'Ue o Muite Arukō',
    artist: 'Kyu Sakamoto',
    year: 1961,
    country: 'Japan',
    region: 'East Asia',
    cover: '/images/ph-ea-1.svg',
    href: 'https://www.youtube.com/results?search_query=Kyu+Sakamoto+Ue+o+Muite+Aruko',
    instagram: 'https://www.instagram.com/machi7k/',
    description: 'Placeholder — swap in the real Day post for this track.',
  },
  {
    id: 'ph-tianmimi',
    day: 137,
    title: 'Tian Mi Mi',
    artist: 'Teresa Teng',
    year: 1979,
    country: 'Taiwan',
    region: 'East Asia',
    cover: '/images/ph-ea-2.svg',
    href: 'https://www.youtube.com/results?search_query=Teresa+Teng+Tian+Mi+Mi',
    instagram: 'https://www.instagram.com/machi7k/',
    description: 'Placeholder — swap in the real Day post for this track.',
  },
  {
    id: 'ph-arirang',
    day: 136,
    title: 'Arirang',
    artist: 'Traditional',
    year: 1962,
    country: 'Korea',
    region: 'East Asia',
    cover: '/images/ph-ea-3.svg',
    href: 'https://www.youtube.com/results?search_query=Arirang+traditional',
    instagram: 'https://www.instagram.com/machi7k/',
    description: 'Placeholder — swap in the real Day post for this track.',
  },
  {
    id: 'ph-yarayah',
    day: 133,
    title: 'Ya Rayah',
    artist: 'Dahmane El Harrachi',
    year: 1973,
    country: 'Algeria',
    region: 'Middle East & North Africa',
    cover: '/images/ph-me-1.svg',
    href: 'https://www.youtube.com/results?search_query=Dahmane+El+Harrachi+Ya+Rayah',
    instagram: 'https://www.instagram.com/machi7k/',
    description: 'Placeholder — swap in the real Day post for this track.',
  },
  {
    id: 'ph-entaomri',
    day: 132,
    title: 'Enta Omri',
    artist: 'Umm Kulthum',
    year: 1964,
    country: 'Egypt',
    region: 'Middle East & North Africa',
    cover: '/images/ph-me-2.svg',
    href: 'https://www.youtube.com/results?search_query=Umm+Kulthum+Enta+Omri',
    instagram: 'https://www.instagram.com/machi7k/',
    description: 'Placeholder — swap in the real Day post for this track.',
  },
  {
    id: 'ph-riversbabylon',
    day: 129,
    title: 'Rivers of Babylon',
    artist: 'The Melodians',
    year: 1970,
    country: 'Jamaica',
    region: 'Caribbean',
    cover: '/images/ph-car-1.svg',
    href: 'https://www.youtube.com/results?search_query=The+Melodians+Rivers+of+Babylon',
    instagram: 'https://www.instagram.com/machi7k/',
    description: 'Placeholder — swap in the real Day post for this track.',
  },
  {
    id: 'ph-cuartotula',
    day: 128,
    title: 'El Cuarto de Tula',
    artist: 'Buena Vista Social Club',
    year: 1997,
    country: 'Cuba',
    region: 'Caribbean',
    cover: '/images/ph-car-2.svg',
    href: 'https://www.youtube.com/results?search_query=Buena+Vista+Social+Club+El+Cuarto+de+Tula',
    instagram: 'https://www.instagram.com/machi7k/',
    description: 'Placeholder — swap in the real Day post for this track.',
  },

  // ------------------------------------------------------------------
  // DEMO square covers — just to preview how square album art looks in
  // the ring (they cluster because they share a region). Delete anytime.
  // ------------------------------------------------------------------
  {
    id: 'demo-square-1',
    day: 1,
    title: 'Square One',
    artist: 'Demo',
    year: 2024,
    country: '',
    region: 'Demo Squares',
    cover: '/images/demo-square-1.svg',
    coverArt: '/images/demo-square-1.svg',
    href: '#',
    description: 'Demo square cover.',
  },
  {
    id: 'demo-square-2',
    day: 2,
    title: 'Square Two',
    artist: 'Demo',
    year: 2024,
    country: '',
    region: 'Demo Squares',
    cover: '/images/demo-square-2.svg',
    coverArt: '/images/demo-square-2.svg',
    href: '#',
    description: 'Demo square cover.',
  },
  {
    id: 'demo-square-3',
    day: 3,
    title: 'Square Three',
    artist: 'Demo',
    year: 2024,
    country: '',
    region: 'Demo Squares',
    cover: '/images/demo-square-3.svg',
    coverArt: '/images/demo-square-3.svg',
    href: '#',
    description: 'Demo square cover.',
  },
]

// Group songs into their world regions, preserving first-seen order. Used to draw
// the region labels around the ring and to build each region's contiguous arc.
// Accepts any song list (defaults to the built-in one) so it can group the live
// list fetched from the CMS just as well as the static fallback.
export function songsByRegion(list = songs) {
  const map = new Map()
  for (const song of list) {
    const key = song.region || 'Elsewhere'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(song)
  }
  return Array.from(map, ([name, list]) => ({ name, songs: list }))
}
