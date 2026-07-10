import {
  FileCaption,
  FileContent,
  FileHeader,
  FileImage,
  FileInfo,
  FileLinks,
  FileText,
  FileTitle,
} from './FileContent'
import InRotationFile from './InRotationFile'

// The filing-cabinet story tabs are now data-driven (edited in the /admin CMS and
// stored in Supabase; see src/data/defaults.js for the shape + fallback). This
// module turns a list of tab rows into the render list the <Cabinet> expects.

const Divider = ({ title }) => (
  <FileContent isDivider>
    <div className="flex w-fit items-center justify-center border bg-white px-6 py-4">
      <h1 className="font-mono text-xl font-semibold tracking-tighter">{title}</h1>
    </div>
  </FileContent>
)

// Render body copy with **bold** spans (keeps the original emphasised phrases).
function renderRich(text) {
  if (!text) return null
  return text.split('**').map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-medium">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

function TabContent({ tab, rotation }) {
  if (tab.kind === 'divider') return <Divider title={tab.title} />
  if (tab.kind === 'rotation') return <InRotationFile tracks={rotation} />

  const hasImage = !!tab.image
  const hasLinks = Array.isArray(tab.links) && tab.links.length > 0

  return (
    <FileContent>
      <FileInfo className={tab.wide ? 'w-full' : undefined}>
        <FileHeader>
          <FileTitle>{tab.title}</FileTitle>
          {tab.caption && <FileCaption>{tab.caption}</FileCaption>}
        </FileHeader>

        {tab.body && (
          <FileText className={tab.wide ? 'max-w-[48ch] text-sm' : undefined}>
            {renderRich(tab.body)}
          </FileText>
        )}

        {hasLinks && <FileLinks className="mt-2" links={tab.links} />}
      </FileInfo>

      {hasImage && (
        <FileImage>
          <img src={tab.image} alt={tab.title} className="h-full w-full object-cover" />
        </FileImage>
      )}
    </FileContent>
  )
}

// Turn tab rows (+ the rotation track list) into the [{ tabLocation, isDivider,
// title, content }] array the <Cabinet> maps over.
export function buildCabinetLayout(tabs = [], rotation = []) {
  return tabs.map((tab) => ({
    tabLocation: tab.tabLocation ?? 0,
    isDivider: tab.kind === 'divider',
    title: tab.title,
    content: <TabContent tab={tab} rotation={rotation} />,
  }))
}

export default buildCabinetLayout
