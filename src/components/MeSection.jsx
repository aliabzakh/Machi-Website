import { ArrowBigDown } from 'lucide-react'
import { useMemo } from 'react'
import Cabinet from './portfolio/Cabinet'
import { buildCabinetLayout } from './portfolio/cabinetLayout'
import { useImagePreloader } from '@/hooks/useImagePreloader'
import cabinet from '@/assets/cabinet/cabinet.png'
import tab from '@/assets/cabinet/tab.png'
import blackTab from '@/assets/cabinet/tab-black.png'

const MeSection = ({ tabs = [], rotation = [] }) => {
  const imageUrls = useMemo(() => [cabinet, tab, blackTab], [])
  const imagesLoaded = useImagePreloader(imageUrls)
  const layout = useMemo(() => buildCabinetLayout(tabs, rotation), [tabs, rotation])

  return (
    <section
      id="me"
      className="text-foreground relative flex min-h-screen flex-col overflow-x-clip overflow-y-visible bg-white pb-[50vh]"
    >
      {!imagesLoaded ? (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-muted-foreground font-mono text-sm">loading cabinet…</div>
        </div>
      ) : (
        <div className="relative -mb-[600px] flex w-full flex-1 scale-[38%] items-end justify-center pt-[20vh] sm:scale-[52%] md:scale-[64%] lg:scale-[78%] xl:scale-[90%] 2xl:scale-100">
          {/* hint sits BEHIND the files (z-0) so a pulled-up tab covers it */}
          <div className="absolute bottom-[820px] z-0">
            <div className="flex scale-[200%] items-center gap-3 lg:scale-100">
              <p className="font-mono text-lg tracking-tighter">Click and drag on a tab</p>
              <ArrowBigDown />
            </div>
          </div>
          <Cabinet layout={layout} />
        </div>
      )}
    </section>
  )
}

export default MeSection
