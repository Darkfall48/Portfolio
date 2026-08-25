//? Libraries
import { useState } from "react"

//? Content / i18n
import type { ContentId, PanelTarget } from "../content"

//? Components
import { DetailPanel } from "../cmps/DetailPanel"
import { ExperienceList } from "../cmps/ExperienceList"
import { ProfileCard } from "../cmps/ProfileCard"
import { SiteHeader } from "../cmps/SiteHeader"
import { SkillGroups } from "../cmps/SkillGroups"
import { WorkList } from "../cmps/WorkList"

//? Hooks
import { usePointerSpot } from "../hooks/usePointerSpot"

export function Home() {
  usePointerSpot()
  const [panel, setPanel] = useState<PanelTarget | null>(null)

  function openExperience(id: ContentId) {
    setPanel({ kind: "experience", id })
  }

  function openWork(id: ContentId) {
    setPanel({ kind: "work", id })
  }

  return (
    <div className="home">
      <SiteHeader />
      <main className="home-main">
        <ProfileCard />
        <ExperienceList onSelect={openExperience} />
        <WorkList onSelect={openWork} />
        <SkillGroups />
      </main>
      <DetailPanel target={panel} onClose={() => setPanel(null)} />
    </div>
  )
}
