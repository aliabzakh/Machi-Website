import { motion } from 'motion/react'
import File from './File'
import cabinetImg from '@/assets/cabinet/cabinet.png'

const Cabinet = ({ layout = [] }) => {
  return (
    <>
      <motion.div className="relative z-10 flex flex-col items-center px-16 [clip-path:inset(-1000px_0_360px_0)] md:pt-[30vh]">
        {layout.map((file, i) => (
          <File
            key={i}
            title={file.title}
            tabLocation={file.tabLocation}
            isDivider={file.isDivider}
            index={i}
            height={file.height}
          >
            {file.content}
          </File>
        ))}
      </motion.div>
      {/* No z-index on this container so its children share the stacking context with the
          file stack (z-10): the back rim lines sit at -z-10 (behind pulled-out files) while
          the cabinet front image is lifted to z-30 (in front of file bottoms). */}
      <div className="absolute bottom-0">
        <div className="relative mb-[240px] flex h-[120px] justify-center">
          <div className="absolute -top-[290px] left-[67px] -z-10">
            <div className="bg-primary h-[1.5px] w-[290px] origin-top-left rotate-[92.5deg]"></div>
          </div>
          <div className="absolute right-[53px] -z-10">
            <div className="bg-primary h-[1.5px] w-[290px] origin-top-right rotate-[87.5deg]"></div>
          </div>
          <div className="absolute -top-[290px] right-[66px] -z-10">
            <div className="bg-primary h-[1.5px] w-[797px]"></div>
          </div>
          <div className="relative z-30 w-[930px]">
            <img src={cabinetImg} className="h-auto w-full select-none" draggable={false} />
          </div>
          <div className="absolute top-14 z-30 font-mono text-base font-semibold">machi7k</div>
        </div>
      </div>
    </>
  )
}

export default Cabinet
