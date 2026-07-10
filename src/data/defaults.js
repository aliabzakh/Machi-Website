// Fallback content for the parts of the site that the CMS can edit.
//
// These are the exact values the site shipped with. They are used:
//   1. as the live fallback when Supabase isn't configured (or a fetch fails), so
//      the site looks identical to before the CMS existed, and
//   2. as the shape reference for the rows the admin reads/writes.
//
// The matching SQL seed in supabase/schema.sql inserts the same content so the
// admin opens pre-filled instead of empty.

// --- In Rotation turntable tracks -------------------------------------------
export const DEFAULT_ROTATION = [
  {
    id: 'rot-lestaca',
    title: "L'estaca",
    artist: 'Lluís Llach',
    src: '/audio/rotation-1.mp3',
    href: 'https://www.youtube.com/results?search_query=Lluis+Llach+L%27estaca',
  },
  {
    id: 'rot-moratuwa',
    title: 'Moratuwa',
    artist: 'The Super Golden Chimes',
    src: '/audio/rotation-2.mp3',
    href: 'https://www.youtube.com/results?search_query=Super+Golden+Chimes+Moratuwa',
  },
  {
    id: 'rot-dekierey',
    title: "Deki Erey (Emni'Are)",
    artist: 'Abraham Afewerki',
    src: '/audio/rotation-3.mp3',
    href: 'https://www.youtube.com/results?search_query=Abraham+Afewerki+Deki+Erey',
  },
]

// --- Filing-cabinet story tabs ----------------------------------------------
// `kind` drives how a tab renders (see cabinetLayout.jsx → TabContent):
//   'divider'  → the standalone label card between sections
//   'rotation' → the In Rotation turntable (pulls from the rotation list above)
//   'text'     → an info file: title + caption + body, with optional image
//                and/or a link list.
// `tabLocation` (0|1|2) is the horizontal slot of the paper tab.
// `body` supports **bold** spans.
export const DEFAULT_TABS = [
  { id: 'tab-intro', tabLocation: 0, kind: 'divider', title: 'Intro' },
  {
    id: 'tab-about',
    tabLocation: 1,
    kind: 'text',
    title: 'About Me',
    caption: 'AR · Paris/Berlin',
    image: '/portfolio/portrait.jpeg',
    body: "I'm Machi — an Argentine music-and-culture creator out to prove there's more to the world than what makes it onto the radio. Born in Argentina, raised across Brazil, Colombia and Miami, now splitting time between Paris and Berlin. Across Instagram, TikTok and YouTube my invitation is simple: **\"teach me something in the comments.\"**",
  },
  {
    id: 'tab-plottwist',
    tabLocation: 2,
    kind: 'text',
    title: 'Plot Twist',
    caption: 'Origin',
    image: '/portfolio/portrait-beach.jpg',
    body: "I didn't start with crate-digging and cassette reissues — I started with Fortnite trickshots. The same obsessive curiosity that made me chase the perfect clip got pointed at music history instead. These days the \"stuff I find interesting\" is the forgotten funk, disco and rock the rest of the internet skipped.",
  },
  { id: 'tab-mission-div', tabLocation: 0, kind: 'divider', title: 'The Mission' },
  {
    id: 'tab-mission',
    tabLocation: 1,
    kind: 'text',
    title: 'The Mission',
    caption: 'Why',
    wide: true,
    body: "My whole project runs on one belief: being more open-minded about music can make you more open-minded about the world. I'm less interested in the \"typical\" music of a place than in the collisions — what happened when local sounds crashed into the rock, jazz, disco and funk that swept the globe in the 20th century. Every video and mix I make is an argument that curiosity is worth having.",
  },
  { id: 'tab-work-div', tabLocation: 2, kind: 'divider', title: 'Work' },
  {
    id: 'tab-onair',
    tabLocation: 0,
    kind: 'text',
    title: 'On Air',
    caption: 'NTS Radio',
    image: '/portfolio/nts-show.jpeg',
    body: 'I host **Exploring Earth Through Sound** on NTS Radio, broadcasting out of Paris. Each episode I either roam across eclectic global selections or zoom in on one scene — recent shows have covered Argentine rock from the \'60s to \'90s, trip-hop and Afrobeat, leftfield disco and funk.',
  },
  {
    id: 'tab-dayjob',
    tabLocation: 1,
    kind: 'text',
    title: 'The Day Job',
    caption: 'Habibi Funk',
    wide: true,
    body: "Off-camera I intern at **Habibi Funk** — the Berlin label famous for reissuing funk, soul and disco from across the Arab world, and for doing it ethically (artists and their families split profits 50/50). The perfect home base for someone whose whole thing is uncovering brilliant music history has overlooked. I'm also part of the crew behind events like the Habibi Funk Weekender in London.",
  },
  { id: 'tab-connect-div', tabLocation: 2, kind: 'divider', title: 'Connect' },
  { id: 'tab-rotation', tabLocation: 0, kind: 'rotation', title: 'Rotation' },
  {
    id: 'tab-findme',
    tabLocation: 1,
    kind: 'text',
    title: 'Find Me',
    caption: '@machi7k',
    links: [
      { label: 'Instagram', value: '472K · @machi7k', href: 'https://www.instagram.com/machi7k/' },
      { label: 'TikTok', value: '268K · @machi7k', href: 'https://www.tiktok.com/@machi7k' },
      { label: 'YouTube', value: '@machi7k', href: 'https://www.youtube.com/@machi7k' },
      { label: 'NTS Radio', value: 'shows/machi', href: 'https://www.nts.live/shows/machi' },
      { label: 'Habibi Funk', value: '@habibifunk', href: 'https://www.instagram.com/habibifunk/' },
    ],
  },
]
