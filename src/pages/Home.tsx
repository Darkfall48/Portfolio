//? Libraries
import { useEffect, useState } from "react"

//? Content / i18n
import type {
  ContentId,
  ExpandablePanel,
  PanelKind,
  PanelTarget,
} from "../content"

//? Components
import { CvBuilder } from "../cmps/CvBuilder"
import { DetailPanel } from "../cmps/DetailPanel"
import { ExperienceList } from "../cmps/ExperienceList"
import { ProfileCard } from "../cmps/ProfileCard"
import { SiteHeader } from "../cmps/SiteHeader"
import { SkillGroups } from "../cmps/SkillGroups"
import { WorkList } from "../cmps/WorkList"

//? Hooks
import { useLayoutTier } from "../hooks/useLayoutTier"
import { usePointerSpot } from "../hooks/usePointerSpot"

export function Home() {
  usePointerSpot()
  const tier = useLayoutTier()
  const [panel, setPanel] = useState<PanelTarget | null>(null)
  const [expanded, setExpanded] = useState<ExpandablePanel | null>(null)
  const [isCvOpen, setIsCvOpen] = useState(false)

  // Skipped while a dialog is up so one Escape does not both close the dialog
  // and collapse the panel behind it.
  useEffect(() => {
    if (!expanded || panel || isCvOpen) return

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setExpanded(null)
    }

    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [expanded, panel, isCvOpen])

  function openExperience(id: ContentId) {
    setPanel({ kind: "experience", id })
  }

  function openWork(id: ContentId) {
    setPanel({ kind: "work", id })
  }

  function toggleExpand(target: ExpandablePanel) {
    setExpanded((current) => (current === target ? null : target))
  }

  /**
   * Whether a middle-column panel has given up its cell. Focus covers the area
   * of both, so in the wide layout it takes the column whole; Experience and
   * Selected work only trade it with each other. Stacked, every panel keeps its
   * own row and nothing is given up.
   */
  function isFolded(self: PanelKind): boolean {
    if (tier === "stacked" || !expanded) return false
    if (expanded === "skills") return tier === "wide"
    return expanded !== self
  }

  return (
    <div className="home">
      <SiteHeader onBuildCv={() => setIsCvOpen(true)} />
      <main
        className={`home-main${expanded ? ` is-expanded-${expanded}` : ""}`}
      >
        <ProfileCard />
        <ExperienceList
          onSelect={openExperience}
          expanded={expanded === "experience"}
          collapsed={isFolded("experience")}
          onToggleExpand={() => toggleExpand("experience")}
        />
        <WorkList
          onSelect={openWork}
          expanded={expanded === "work"}
          collapsed={isFolded("work")}
          onToggleExpand={() => toggleExpand("work")}
        />
        <SkillGroups
          expanded={expanded === "skills"}
          onToggleExpand={() => toggleExpand("skills")}
        />
      </main>
      <DetailPanel target={panel} onClose={() => setPanel(null)} />
      <CvBuilder isOpen={isCvOpen} onClose={() => setIsCvOpen(false)} />
    </div>
  )
}
