//? Libraries
import { useRef } from "react"
import { useTranslation } from "react-i18next"

//? Content / i18n
import { isOnHome, skillGroups } from "../content"

//? Components
import { PanelExpand } from "./PanelExpand"

//? Hooks
import { useOverflows } from "../hooks/useOverflows"

type Props = {
  expanded: boolean
  onToggleExpand: () => void
}

export function SkillGroups({ expanded, onToggleExpand }: Props) {
  const { t } = useTranslation()
  const groups = skillGroups.filter(isOnHome)
  const listRef = useRef<HTMLUListElement>(null)
  // Every chip is rendered; the panel decides what fits. Expanding is offered
  // only once the panel is really cutting chips off, and stays offered while
  // expanded so the control never disappears under the pointer.
  const overflows = useOverflows(listRef)

  return (
    <section className="skill-groups">
      <h2 className="skill-groups-title">
        <span className="hud-index" aria-hidden="true">
          03
        </span>
        {t("nav.skills")}
        <PanelExpand
          expanded={expanded}
          hasMore={overflows || expanded}
          onToggle={onToggleExpand}
        />
      </h2>
      <ul className="skill-groups-list" ref={listRef}>
        {groups.map((group) => (
          <li key={group.id} className="skill-groups-group">
            <h3 className="skill-groups-group-title">
              {t(`skills.${group.id}`)}
            </h3>
            <ul className="skill-groups-chips">
              {group.chips.map((chip) => (
                <li
                  key={chip.id}
                  className="skill-groups-chip"
                  title={chip.label}
                >
                  {chip.label}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}
