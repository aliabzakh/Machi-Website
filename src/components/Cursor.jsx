import { useEffect, useRef } from 'react'

// clou-style cursor: a circle that trails the mouse, grows with speed, shrinks
// over anything interactive, and inverts whatever is beneath it via
// mix-blend-mode: difference (a white dot becomes black on white, white on
// black, and inverts image colours).
export default function Cursor() {
  const dotRef = useRef(null)

  useEffect(() => {
    // only on devices with a precise pointer
    if (!window.matchMedia('(pointer: fine)').matches) return

    const dot = dotRef.current
    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let curX = mouseX
    let curY = mouseY
    let lastX = mouseX
    let lastY = mouseY
    let lastT = performance.now()
    let targetScale = 1
    let scale = 1
    let hoverTarget = 1 // 1 idle, <1 over links/buttons/ring cards
    let hover = 1
    let visible = false

    document.body.classList.add('has-custom-cursor')

    const onMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      const now = performance.now()
      const dt = Math.max(now - lastT, 1)
      const dist = Math.hypot(mouseX - lastX, mouseY - lastY)
      const speed = dist / dt // px per ms
      targetScale = Math.min(1 + speed * 0.7, 1.9)
      lastX = mouseX
      lastY = mouseY
      lastT = now
      if (!visible) {
        visible = true
        dot.style.opacity = '1'
      }
    }

    const onLeave = () => {
      visible = false
      dot.style.opacity = '0'
    }

    // shrink over interactive DOM (links, buttons) …
    const onOver = (e) => {
      hoverTarget = e.target.closest?.('a, button, [data-cursor]') ? 0.45 : 1
    }
    // … and over ring cards, which live inside a canvas (the ring engine
    // dispatches this event when its raycaster enters/leaves a card)
    const onRingHover = (e) => {
      hoverTarget = e.detail ? 0.45 : 1
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseover', onOver)
    window.addEventListener('machi-cursor', onRingHover)

    let raf
    const loop = () => {
      curX += (mouseX - curX) * 0.2
      curY += (mouseY - curY) * 0.2
      // ease the scale back toward 1 when the mouse slows/stops
      targetScale += (1 - targetScale) * 0.08
      scale += (targetScale - scale) * 0.2
      hover += (hoverTarget - hover) * 0.2
      dot.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%) scale(${scale * hover})`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseover', onOver)
      window.removeEventListener('machi-cursor', onRingHover)
      cancelAnimationFrame(raf)
      document.body.classList.remove('has-custom-cursor')
    }
  }, [])

  return <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
}
