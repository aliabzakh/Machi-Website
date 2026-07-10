import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

let filterIdCounter = 0

// A crumpled-paper-ball silhouette and its flat, unfolded rectangle — both
// written as 12-point polygons (3 points per edge) so clip-path can morph
// smoothly, point-for-point, from one into the other.
const CRUMPLE_CLIP =
  'polygon(28% 22%, 50% 12%, 70% 20%, 80% 30%, 86% 50%, 78% 68%, 68% 86%, 48% 92%, 30% 80%, 20% 66%, 14% 50%, 22% 32%)'
const FLAT_CLIP =
  'polygon(0% 0%, 33% 0%, 66% 0%, 100% 0%, 100% 33%, 100% 66%, 100% 100%, 66% 100%, 33% 100%, 0% 100%, 0% 66%, 0% 33%)'

// The crumpled ball should always read as small, no matter how big the
// clicked origin element (e.g. the crate) is — so its start scale is capped
// well below 1, not derived 1:1 from the origin rect's own size.
const BALL_SCALE = 0.22

export default function UnfurlOverlay({ image, originRect, onClose }) {
  const backdropRef = useRef(null)
  const cardRef = useRef(null)
  const paperRef = useRef(null)
  const imgRef = useRef(null)
  const shadeRef = useRef(null)
  const displacementRef = useRef(null)
  const closingRef = useRef(false)
  const filterId = useRef(`crumple-filter-${filterIdCounter++}`).current

  useLayoutEffect(() => {
    const card = cardRef.current
    const finalRect = card.getBoundingClientRect()

    const originCenterX = originRect.left + originRect.width / 2
    const originCenterY = originRect.top + originRect.height / 2
    const finalCenterX = finalRect.left + finalRect.width / 2
    const finalCenterY = finalRect.top + finalRect.height / 2

    const dx = originCenterX - finalCenterX
    const dy = originCenterY - finalCenterY
    const scaleX = Math.min(Math.max(originRect.width / finalRect.width, 0.05), BALL_SCALE)
    const scaleY = Math.min(Math.max(originRect.height / finalRect.height, 0.05), BALL_SCALE)
    const startRotation = gsap.utils.random(-14, 14)

    gsap.set(card, {
      x: dx,
      y: dy,
      scaleX,
      scaleY,
      rotation: startRotation,
      transformOrigin: '50% 50%',
    })
    gsap.set(paperRef.current, { clipPath: CRUMPLE_CLIP })
    gsap.set(displacementRef.current, { attr: { scale: 90 } })
    gsap.set(shadeRef.current, { opacity: 0.85 })
    gsap.set(imgRef.current, { filter: `url(#${filterId}) blur(2px)` })

    const tl = gsap.timeline()
    tl.to(backdropRef.current, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 0)
    tl.to(
      card,
      { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, duration: 1.05, ease: 'expo.out' },
      0,
    )
    tl.to(paperRef.current, { clipPath: FLAT_CLIP, duration: 1.05, ease: 'power2.out' }, 0)
    tl.to(displacementRef.current, { attr: { scale: 0 }, duration: 1.05, ease: 'power2.out' }, 0)
    tl.to(shadeRef.current, { opacity: 0, duration: 1.05, ease: 'power2.out' }, 0)
    tl.to(imgRef.current, { filter: `url(#${filterId}) blur(0px)`, duration: 0.9, ease: 'power2.out' }, 0.1)

    return () => tl.kill()
  }, [filterId, originRect])

  function handleClose() {
    if (closingRef.current) return
    closingRef.current = true

    const card = cardRef.current
    const finalRect = card.getBoundingClientRect()
    const originCenterX = originRect.left + originRect.width / 2
    const originCenterY = originRect.top + originRect.height / 2
    const finalCenterX = finalRect.left + finalRect.width / 2
    const finalCenterY = finalRect.top + finalRect.height / 2

    const dx = originCenterX - finalCenterX
    const dy = originCenterY - finalCenterY
    const scaleX = Math.min(Math.max(originRect.width / finalRect.width, 0.05), BALL_SCALE)
    const scaleY = Math.min(Math.max(originRect.height / finalRect.height, 0.05), BALL_SCALE)
    const endRotation = gsap.utils.random(-14, 14)

    const tl = gsap.timeline({ onComplete: onClose })
    tl.to(backdropRef.current, { opacity: 0, duration: 0.55, ease: 'power1.in' }, 0)
    tl.to(
      card,
      { x: dx, y: dy, scaleX, scaleY, rotation: endRotation, duration: 0.65, ease: 'power2.in' },
      0,
    )
    tl.to(paperRef.current, { clipPath: CRUMPLE_CLIP, duration: 0.65, ease: 'power2.in' }, 0)
    tl.to(displacementRef.current, { attr: { scale: 90 }, duration: 0.65, ease: 'power2.in' }, 0)
    tl.to(shadeRef.current, { opacity: 0.85, duration: 0.65, ease: 'power2.in' }, 0)
  }

  return (
    <div className="unfurl-overlay">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.010 0.016" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap
            ref={displacementRef}
            in="SourceGraphic"
            in2="noise"
            scale="90"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div ref={backdropRef} className="unfurl-backdrop" onClick={handleClose} />

      <div ref={cardRef} className="unfurl-card">
        <div ref={paperRef} className="unfurl-paper">
          {image.href ? (
            <a href={image.href} target="_blank" rel="noreferrer">
              <img ref={imgRef} src={image.src} alt={image.alt} draggable={false} />
            </a>
          ) : (
            <img ref={imgRef} src={image.src} alt={image.alt} draggable={false} />
          )}
          <div ref={shadeRef} className="unfurl-fold-shade" />
        </div>
        <button type="button" className="unfurl-close" aria-label="Close" onClick={handleClose}>
          ×
        </button>
      </div>
    </div>
  )
}
