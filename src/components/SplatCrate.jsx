import { useEffect, useRef, useState } from 'react'
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d'
import gsap from 'gsap'

const IDLE_SPIN_SPEED = 0.0022 // radians per frame, ~60fps
const CLICK_SPIN_TURNS = 1.35 // extra full turns added on click

export default function SplatCrate({ onActivate, disabled }) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const idleAngle = useRef(0)
  const clickBoost = useRef({ value: 0 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const viewer = new GaussianSplats3D.Viewer({
      rootElement: container,
      selfDrivenMode: true,
      useBuiltInControls: false,
      cameraUp: [0, 0, 1],
      initialCameraPosition: [0.78, -1.15, 0.78],
      initialCameraLookAt: [0, 0, -0.1],
      sharedMemoryForWorkers: false,
    })
    viewerRef.current = viewer

    viewer
      .addSplatScene('/models/crate.ply', {
        showLoadingUI: false,
        splatAlphaRemovalThreshold: 5,
        position: [0, 0, 0],
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
      })
      .then(() => {
        viewer.start()
        setLoaded(true)
      })

    const tick = () => {
      idleAngle.current += IDLE_SPIN_SPEED
      if (viewer.splatMesh) {
        viewer.splatMesh.rotation.z = idleAngle.current + clickBoost.current.value
      }
    }
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      viewer.dispose()
      viewerRef.current = null
    }
  }, [])

  function handleClick() {
    if (disabled) return
    gsap.to(clickBoost.current, {
      value: clickBoost.current.value + Math.PI * 2 * CLICK_SPIN_TURNS,
      duration: 1.4,
      ease: 'power3.out',
    })
    const rect = containerRef.current.getBoundingClientRect()
    onActivate?.(rect)
  }

  return (
    <div className="splat-crate-wrap">
      <div
        ref={containerRef}
        className="splat-crate"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Spin the crate"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick()
        }}
        style={{ opacity: loaded ? 1 : 0 }}
      />
      {!loaded && <div className="splat-crate-loading">loading crate…</div>}
    </div>
  )
}
