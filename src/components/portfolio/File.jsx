import { motion } from 'motion/react'
import React from 'react'
import blackTab from '@/assets/cabinet/tab-black.png'
import tab from '@/assets/cabinet/tab.png'
import { useBrowserEngine } from '@/hooks/useBrowser'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/useIsMobile'

const baseDragOptions = {
  rotationAngle: -40,
  rotationYOffset: 50,
}

const getDragOptions = (isChromium, isMobile) => ({
  ...baseDragOptions,

  // on non chromium browsers, the drag effect is bugged, disabling momentum and elasticity fixes this
  dragMomentum: isChromium && !isMobile,
  dragElastic: isChromium && !isMobile ? 0.05 : 0,

  // increase drag speed on mobile, everything is scaled down on mobile, making dragging slower
  dragSpeedMultiplier: isMobile ? 1.5 : 1,
})

const TAB_OFFSETS = ['left-[60px]', 'left-[250px]', 'left-[440px]']

// Base card height + how much of each card peeks out in the collapsed stack.
const BASE_HEIGHT = 400
const PEEK = 20

const File = ({ tabLocation, title, children, isDivider = false, index, height = BASE_HEIGHT }) => {
  const isMobile = useIsMobile()
  const browserEngine = useBrowserEngine()
  const [dragY, setDragY] = React.useState(0)

  const tabOffsetClass = TAB_OFFSETS[tabLocation] ?? TAB_OFFSETS[0]
  const dragConfig = getDragOptions(browserEngine === 'chromium', isMobile)

  // Let you pull a card almost fully out; scales with its length so taller cards
  // reveal proportionally more. Matches the old -250 / -105 at the base height.
  const dragConstraintTop = isMobile ? -(height - 295) : -(height - 150)

  // Keep the collapsed peek constant regardless of card length (replaces the fixed
  // space-y on the stack, which assumed every card was the same height).
  const stackMarginTop = index === 0 ? 0 : -(height - PEEK)

  // for 3d effect, when selecting a file however, face user straight on
  const rotation = dragY < 0 ? 0 : dragConfig.rotationAngle

  // add offset to counteract the file appearing to move up when it rotates
  const yOffset = dragY < 0 ? dragConfig.rotationYOffset : 0

  // on mobile, apply dragSpeedMultiplier
  const translateY = isMobile
    ? `${dragY * dragConfig.dragSpeedMultiplier + yOffset}px`
    : `${yOffset}px`

  return (
    <div className="perspective-[1000px]" style={{ marginTop: stackMarginTop }}>
      <motion.div
        drag="y"
        dragConstraints={{ top: dragConstraintTop, bottom: 0 }}
        dragElastic={dragConfig.dragElastic}
        dragTransition={{
          bounceStiffness: 500,
        }}
        dragMomentum={dragConfig.dragMomentum}
        onUpdate={(latest) => setDragY(latest.y || 0)}
        className={cn(
          'relative flex w-[700px] flex-col rounded-lg border bg-white p-6 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.35)]',
          dragY < 0 && 'scale-[114%]',
        )}
        style={{
          height: `${height}px`,
          translateZ: `${index * 2}px`,
          translateY,
          rotateX: rotation,
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.div
          className={cn('absolute -top-[37.5px]', tabOffsetClass, dragY < 0 && 'pt-[2.5px]')}
          style={{
            rotateX: -rotation,
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="relative flex h-full w-full cursor-pointer items-center justify-center">
            <img src={isDivider ? blackTab : tab} className="w-[200px]" draggable={false} />
            <div
              className={cn(
                'absolute flex w-[145px] justify-between text-base text-[0.925rem] tracking-tight',
                isDivider ? 'text-white' : 'text-black',
              )}
            >
              <p>{String(index).padStart(2, '0')}</p>
              <p>{title}</p>
            </div>
          </div>
        </motion.div>
        {children}
      </motion.div>
    </div>
  )
}

export default File
