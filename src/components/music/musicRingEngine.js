import * as THREE from 'three'
import { gsap } from 'gsap'

// ---------------------------------------------------------------------------
// clou-style projects ring, in WebGL.
//
// Layer 0 is this engine's transparent <canvas>; the React component layers
// the DOM UI (loading counter, hover preview panel) above it. The engine owns
// the 3D scene, the idle auto-spin, drag-to-spin with flick inertia, and the
// raycast hover, reporting back through callbacks.
// ---------------------------------------------------------------------------

// ---- tuning constants (adjust visually against clouarchitects.com) --------
export const TUNING = {
  // ring shape — every card is a square (side = CARD_H); each cover is
  // centre-cropped to fill it, so all tiles share one shape.
  CARD_W: 0.9, // world units; nominal width used only for ring circumference/spacing
  CARD_H: 1.0,
  PACK: 0.62, // <1 packs cards into an overlapping deck (clou feathering)
  ELLIPSE_RATIO: 2.0, // Rx = ratio * Rz (wide ellipse)
  FAN: THREE.MathUtils.degToRad(72), // inward fan off the outward normal

  // camera
  CAM_FOV: 35,
  CAM_TILT_DEG: 18, // how far above the ring plane the camera sits
  FIT_MARGIN: 1.18, // extra width so the ellipse never kisses the edges
  MIN_FIT_ASPECT: 0.42, // safety floor only; lets the ring fit narrow portrait widths
  PARALLAX_Y: 0.55, // world units of camera bob from mouse Y
  PARALLAX_X: 0.3,

  // motion
  BASE_SPEED: 0.1, // rad/s of idle auto-spin
  SPEED_EASE: 0.05, // per-frame lerp of the flick velocity back toward idle

  // drag to spin
  DRAG_SENS: 0.006, // rad of ring rotation per pixel dragged
  DRAG_MAX_SPEED: 6, // cap on flick-release velocity (rad/s)
  CLICK_SLOP: 6, // px of movement before a press counts as a drag, not a click

  // hover
  HOVER_OUT: 0.5, // radial slide out of the deck
  HOVER_FAN: THREE.MathUtils.degToRad(34), // half-unfan; never flat to camera
  HOVER_SCALE: 1.1,
  HOVER_DUR: 0.45,

  // density (each region's songs cycle to fill a contiguous arc so covers cluster)
  MIN_ARC_CARDS: 5,
  CARDS_PER_SONG: 3,

  // textures — one square atlas cell per cover; the cover is centre-cropped to
  // fill the cell (with the baked black frame), so every ring card is square.
  CELL: 560,
  TEX_BORDER: 5, // baked black frame, matches the site's 1px-border look

  INTRO_SWEEP: 0.4, // rad of settle-in rotation on reveal
}

const FRONT = Math.PI / 2 // θ that faces the camera (camera sits on +z)
const TAU = Math.PI * 2

// Build the card list, cycling each region's songs to fill a contiguous run so
// the ring stays dense and same-region covers cluster together.
function buildCards(regions) {
  const cards = []
  regions.forEach((region) => {
    const total = Math.max(TUNING.MIN_ARC_CARDS, region.songs.length * TUNING.CARDS_PER_SONG)
    for (let n = 0; n < total; n++) {
      cards.push({ song: region.songs[n % region.songs.length] })
    }
  })
  return cards
}

// The artwork a ring card shows == what the crate pop-up shows: the square album
// cover, falling back to the tall post-card image when there's no album art.
const ringArt = (song) => song.coverArt || song.cover

// Rasterise every cover into ONE atlas texture (a grid of bordered tiles) and
// hand each cover a UV window into it.
//
// One atlas instead of a texture per cover is load-bearing, not an
// optimisation: rendering the ring with ~17 distinct canvas textures
// hard-froze the GPU process on Intel Iris Xe (ANGLE/D3D11) at first render,
// reproducibly, while the same 57 cards sharing one texture were fine.
// Drawing each SVG at tile size also keeps it crisp regardless of its
// intrinsic dimensions, and baking the black frame saves a border mesh.
function makeCoverAtlas(arts, images, songsByArt, maxTexSize) {
  const { TEX_BORDER: b } = TUNING
  const cols = Math.ceil(Math.sqrt(arts.length)) || 1
  const rows = Math.ceil(arts.length / cols) || 1
  // shrink cells if a big catalogue would push the atlas past the GPU limit
  const scale = Math.min(1, maxTexSize / (cols * TUNING.CELL), maxTexSize / (rows * TUNING.CELL))
  const cell = Math.floor(TUNING.CELL * scale)

  const cnv = document.createElement('canvas')
  cnv.width = cols * cell
  cnv.height = rows * cell
  const atlasW = cnv.width
  const atlasH = cnv.height
  const ctx = cnv.getContext('2d')

  const uvs = new Map()
  arts.forEach((art, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x0 = col * cell
    const y0 = row * cell
    const image = images.get(art)
    // square card: fill the cell (minus a small margin) and centre-crop the art
    const pad = Math.round(cell * 0.05)
    const side = cell - 2 * pad
    const rx = x0 + pad
    const ry = y0 + pad

    ctx.fillStyle = '#fff'
    ctx.fillRect(rx, ry, side, side)
    if (image) {
      const iw = image.naturalWidth || 0
      const ih = image.naturalHeight || 0
      if (iw && ih) {
        // centre-crop the source to a square so the cover fills the tile undistorted
        const src = Math.min(iw, ih)
        ctx.drawImage(image, (iw - src) / 2, (ih - src) / 2, src, src, rx, ry, side, side)
      } else {
        // unknown intrinsic size (e.g. some SVGs) — rasterise into the square tile
        ctx.drawImage(image, rx, ry, side, side)
      }
    } else {
      // load failed — a typographic stand-in so the ring never has holes
      ctx.fillStyle = '#000'
      ctx.font = `700 ${Math.round(side * 0.1)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'
      ctx.fillText((songsByArt.get(art)?.title || '').slice(0, 16), rx + side / 2, ry + side / 2)
    }
    // frame sits fully inside the card rect so it can't bleed into neighbours
    ctx.strokeStyle = '#000'
    ctx.lineWidth = b
    ctx.strokeRect(rx + b / 2, ry + b / 2, side - b, side - b)

    // UV window of this square tile (flipY: v measured from the bottom)
    uvs.set(art, {
      aspect: 1,
      u0: rx / atlasW,
      u1: (rx + side) / atlasW,
      v0: 1 - (ry + side) / atlasH,
      v1: 1 - ry / atlasH,
    })
  })

  const tex = new THREE.CanvasTexture(cnv)
  tex.colorSpace = THREE.SRGBColorSpace
  return { tex, uvs }
}

// A square plane (side = CARD_H), UVs windowed to its atlas cell.
function artGeometry(uv) {
  const g = new THREE.PlaneGeometry(TUNING.CARD_H * uv.aspect, TUNING.CARD_H)
  const a = g.attributes.uv
  for (let i = 0; i < a.count; i++) {
    a.setXY(i, uv.u0 + a.getX(i) * (uv.u1 - uv.u0), uv.v0 + a.getY(i) * (uv.v1 - uv.v0))
  }
  a.needsUpdate = true
  return g
}

export function createMusicRing(canvas, sectionEl, regions, callbacks = {}) {
  const cb = {
    onProgress: () => {},
    onReady: () => {},
    onHover: () => {},
    onSelect: () => {},
    onError: () => {},
    ...callbacks,
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  } catch (err) {
    cb.onError(err)
    return null
  }
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(TUNING.CAM_FOV, 1, 0.1, 100)

  const cards = buildCards(regions)
  const count = cards.length

  // ellipse sized so cards overlap into a dense deck (PACK < 1 shrinks the
  // ring below the no-overlap circumference, clou-style feathering)
  const meanR = ((TUNING.CARD_W * count) / TAU) * TUNING.PACK
  const Rz = (2 * meanR) / (1 + TUNING.ELLIPSE_RATIO)
  const Rx = TUNING.ELLIPSE_RATIO * Rz

  // ---- mutable per-card params, tweened by gsap, composed every frame ----
  cards.forEach((card, i) => {
    card.slot = (TAU / count) * i
    card.p = { fan: TUNING.FAN, out: 0, s: 1 }
  })

  const state = {
    rot: 0,
    speed: 0, // idle/flick spin velocity (rad/s); frozen while dragging
    mouseX: 0,
    mouseY: 0,
    pointerInside: false,
    hovered: null,
    running: false,
    disposed: false,
    ready: false,
  }

  // ---- camera fit ----------------------------------------------------------
  let camZ = 10
  let camY = 3
  function fit() {
    const w = canvas.clientWidth || 1
    const h = canvas.clientHeight || 1
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const fitAspect = Math.max(camera.aspect, TUNING.MIN_FIT_ASPECT)
    const halfW = (Rx + TUNING.CARD_H) * TUNING.FIT_MARGIN
    camZ = halfW / (Math.tan(THREE.MathUtils.degToRad(TUNING.CAM_FOV / 2)) * fitAspect)
    camY = camZ * Math.tan(THREE.MathUtils.degToRad(TUNING.CAM_TILT_DEG))
    camera.position.set(0, camY, camZ)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
  }

  // ---- texture preload → meshes ------------------------------------------
  const uniqueArts = [...new Set(cards.map((c) => ringArt(c.song)))]
  const images = new Map()
  let loaded = 0

  const loadOne = (src) =>
    new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      img.src = src
    }).then((img) => {
      images.set(src, img)
      loaded += 1
      cb.onProgress(Math.round((loaded / uniqueArts.length) * 100))
    })

  const disposables = []
  const frontMeshes = []

  function buildMeshes() {
    const songsByArt = new Map(cards.map((c) => [ringArt(c.song), c.song]))
    const { tex, uvs } = makeCoverAtlas(
      uniqueArts,
      images,
      songsByArt,
      renderer.capabilities.maxTextureSize,
    )
    disposables.push(tex)

    const artGeoms = new Map()
    const geomFor = (art) => {
      if (!artGeoms.has(art)) artGeoms.set(art, artGeometry(uvs.get(art)))
      return artGeoms.get(art)
    }

    cards.forEach((card) => {
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true })
      const geom = geomFor(ringArt(card.song))
      const group = new THREE.Group()
      const front = new THREE.Mesh(geom, mat)
      const back = new THREE.Mesh(geom, mat)
      back.rotation.y = Math.PI // same art readable from behind, like a printed card
      front.userData.card = card
      group.add(front, back)
      scene.add(group)
      card.group = group
      card.mat = mat
      frontMeshes.push(front)
      disposables.push(mat)
    })
    artGeoms.forEach((g) => disposables.push(g))
  }

  // ---- spin --------------------------------------------------------------
  function targetSpeed() {
    if (!state.ready || state.hovered || reduceMotion) return 0
    return TUNING.BASE_SPEED
  }

  // ---- hover -------------------------------------------------------------
  function tweenCardHome(card) {
    gsap.to(card.p, { out: 0, fan: TUNING.FAN, s: 1, duration: TUNING.HOVER_DUR, ease: 'power3.out' })
  }

  function tweenCardHover(card) {
    gsap.to(card.p, {
      out: TUNING.HOVER_OUT,
      fan: TUNING.HOVER_FAN,
      s: TUNING.HOVER_SCALE,
      duration: TUNING.HOVER_DUR,
      ease: 'power3.out',
    })
  }

  function clearHover() {
    if (!state.hovered) return
    tweenCardHome(state.hovered)
    state.hovered = null
    cb.onHover(null)
    canvas.dispatchEvent(new CustomEvent('machi-cursor', { bubbles: true, detail: false }))
  }

  function setHover(card) {
    if (card === state.hovered) return
    if (state.hovered) tweenCardHome(state.hovered)
    state.hovered = card
    if (card) tweenCardHover(card)
    cb.onHover(card ? card.song : null)
    canvas.dispatchEvent(new CustomEvent('machi-cursor', { bubbles: true, detail: !!card }))
  }

  // ---- pointer: hover + drag-to-spin -------------------------------------
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  let pointerDirty = false
  const drag = { active: false, moved: false, startX: 0, startY: 0, lastX: 0, vel: 0, lastT: 0, pointerId: null }

  function setNdcFrom(e) {
    const cr = canvas.getBoundingClientRect()
    ndc.set(((e.clientX - cr.left) / cr.width) * 2 - 1, -(((e.clientY - cr.top) / cr.height) * 2 - 1))
  }

  // section-wide move drives the camera parallax + (when idle) the hover ndc
  function onSectionMove(e) {
    const r = sectionEl.getBoundingClientRect()
    state.mouseX = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1)
    state.mouseY = THREE.MathUtils.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1)
    state.pointerInside = true
    if (!drag.active) {
      setNdcFrom(e)
      pointerDirty = true
    }
  }

  function onSectionLeave() {
    state.pointerInside = false
    state.mouseX = 0
    state.mouseY = 0
    if (!drag.active) clearHover()
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return
    drag.active = true
    drag.moved = false
    drag.startX = drag.lastX = e.clientX
    drag.startY = e.clientY
    drag.vel = 0
    drag.lastT = performance.now()
    drag.pointerId = e.pointerId
    state.speed = 0 // take manual control; a running flick stops dead
    gsap.killTweensOf(state) // cancel the intro settle if still going
    clearHover()
    // capture keeps the drag alive when the pointer leaves the canvas; ignore
    // if the pointer is already gone (e.g. synthetic events)
    try {
      canvas.setPointerCapture(e.pointerId)
    } catch {
      /* no active pointer */
    }
    canvas.dispatchEvent(new CustomEvent('machi-cursor', { bubbles: true, detail: true }))
  }

  function onPointerMove(e) {
    if (!drag.active) return
    const dx = e.clientX - drag.lastX
    drag.lastX = e.clientX
    state.rot += dx * TUNING.DRAG_SENS
    const now = performance.now()
    const dt = now - drag.lastT
    if (dt > 0) {
      const inst = (dx * TUNING.DRAG_SENS) / (dt / 1000) // rad/s
      drag.vel += (inst - drag.vel) * 0.35 // smooth so a jittery last frame doesn't dominate
      drag.lastT = now
    }
    if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > TUNING.CLICK_SLOP) {
      drag.moved = true
    }
  }

  function onPointerUp(e) {
    if (!drag.active) return
    drag.active = false
    try {
      canvas.releasePointerCapture(drag.pointerId)
    } catch {
      /* already released */
    }
    if (drag.moved) {
      // flick: hand the drag velocity to the spin, which eases back to idle
      state.speed = THREE.MathUtils.clamp(drag.vel, -TUNING.DRAG_MAX_SPEED, TUNING.DRAG_MAX_SPEED)
    } else {
      // tap/click: open whatever is under the pointer
      setNdcFrom(e)
      const card = pick()
      if (card) cb.onSelect(card.song)
    }
    canvas.dispatchEvent(new CustomEvent('machi-cursor', { bubbles: true, detail: false }))
  }

  function pick() {
    raycaster.setFromCamera(ndc, camera)
    const hit = raycaster.intersectObjects(frontMeshes, false)[0]
    return hit ? hit.object.userData.card : null
  }

  // ---- frame loop --------------------------------------------------------
  let raf = 0
  let lastT = performance.now()

  function frame() {
    raf = requestAnimationFrame(frame)
    const now = performance.now()
    const dt = Math.min((now - lastT) / 1000, 0.05)
    lastT = now

    if (!drag.active) {
      state.speed += (targetSpeed() - state.speed) * TUNING.SPEED_EASE
      state.rot += state.speed * dt
    }

    // mouse parallax: the camera bobs, always looking at the ring's centre
    const py = camY + state.mouseY * TUNING.PARALLAX_Y
    const px = state.mouseX * TUNING.PARALLAX_X
    camera.position.x += (px - camera.position.x) * 0.06
    camera.position.y += (py - camera.position.y) * 0.06
    camera.lookAt(0, 0, 0)

    for (const card of cards) {
      const p = card.p
      const th = card.slot + state.rot
      card.group.position.set((Rx + p.out) * Math.cos(th), 0, (Rz + p.out) * Math.sin(th))
      card.group.rotation.y = FRONT - th - p.fan
      card.group.scale.set(p.s, p.s, 1)
    }

    // raycast only when the cursor or the ring actually moved, and never mid-drag
    if (
      !coarsePointer &&
      !drag.active &&
      state.pointerInside &&
      (pointerDirty || Math.abs(state.speed) > 0.001)
    ) {
      pointerDirty = false
      setHover(pick())
    }

    renderer.render(scene, camera)
  }

  function setRunning(run) {
    if (state.disposed) return
    if (run && !state.running) {
      state.running = true
      lastT = performance.now() // swallow the pause so cards don't jump
      raf = requestAnimationFrame(frame)
    } else if (!run && state.running) {
      state.running = false
      cancelAnimationFrame(raf)
    }
  }

  // ---- boot --------------------------------------------------------------
  sectionEl.addEventListener('pointermove', onSectionMove)
  sectionEl.addEventListener('pointerleave', onSectionLeave)
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerUp)

  const ro = new ResizeObserver(() => fit())
  ro.observe(canvas)
  fit()

  Promise.all(uniqueArts.map(loadOne)).then(() => {
    if (state.disposed) return
    buildMeshes()
    state.ready = true
    if (!reduceMotion) {
      state.rot -= TUNING.INTRO_SWEEP
      gsap.to(state, { rot: state.rot + TUNING.INTRO_SWEEP, duration: 1.4, ease: 'power2.out' })
    }
    cb.onReady()
    setRunning(true)
  })

  return {
    setRunning,
    clearHover,
    dispose() {
      state.disposed = true
      setRunning(false)
      sectionEl.removeEventListener('pointermove', onSectionMove)
      sectionEl.removeEventListener('pointerleave', onSectionLeave)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      ro.disconnect()
      gsap.killTweensOf([state, ...cards.map((c) => c.p)])
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
    },
  }
}
