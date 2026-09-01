//? Libraries
import { useRef } from "react"
import { useTranslation } from "react-i18next"

//? Content / i18n
import {
  HOME_SLOTS,
  experience,
  experienceRange,
  hiddenItemCount,
  isOnHome,
} from "../content"
import type { ContentId, ExperienceItem } from "../content"

//? Components
import { PanelExpand } from "./PanelExpand"
import { PanelMore } from "./PanelMore"
import { PanelReveal } from "./PanelReveal"

//? Hooks
import { useOverflows } from "../hooks/useOverflows"

type Props = {
  onSelect: (id: ContentId) => void
  expanded: boolean
  /** The sibling panel took the cell: this one is folded away, not just small. */
  collapsed: boolean
  onToggleExpand: () => void
}

export function ExperienceList({
  onSelect,
  expanded,
  collapsed,
  onToggleExpand,
}: Props) {
  const { t } = useTranslation()
  const visible = experience.filter(isOnHome)
  const head = visible.slice(0, HOME_SLOTS.experience)
  const tail = visible.slice(HOME_SLOTS.experience)
  const hidden = hiddenItemCount(experience, HOME_SLOTS.experience)
  const listRef = useRef<HTMLDivElement>(null)
  // The slot budget only counts rows it withheld. A short viewport can clip a
  // row that was meant to show, so the control also answers to real overflow.
  const overflows = useOverflows(listRef)
  const hasMore = hidden > 0 || overflows || expanded

  function renderItem(item: ExperienceItem) {
    const endLabel =
      item.end === "present" ? t("experience.present") : item.end
    return (
      <li key={item.id}>
        <button
          type="button"
          className="experience-list-item"
          title={t("action.openDetails")}
          onClick={() => onSelect(item.id)}
        >
          <span className="experience-list-item-dates">
            {experienceRange(item.start, endLabel)}
          </span>
          <span className="experience-list-item-org">
            {t(`experience.${item.id}.org`)}
          </span>
          <span className="experience-list-item-role">
            {t(`experience.${item.id}.title`)}
          </span>
        </button>
      </li>
    )
  }

  return (
    <section className="experience-list" inert={collapsed}>
      <h2 className="experience-list-title">
        <span className="hud-index" aria-hidden="true">
          01
        </span>
        {t("nav.experience")}
        <PanelExpand
          expanded={expanded}
          hasMore={hasMore}
          hiddenRows={hidden}
          onToggle={onToggleExpand}
        />
      </h2>
      <div className="experience-list-body" ref={listRef}>
        <ul className="experience-list-items">{head.map(renderItem)}</ul>
        {tail.length > 0 ? (
          <PanelReveal open={expanded}>
            <ul className="experience-list-items is-rest">
              {tail.map(renderItem)}
            </ul>
          </PanelReveal>
        ) : null}
      </div>
      <PanelMore
        expanded={expanded}
        hasMore={hasMore}
        onToggle={onToggleExpand}
      />
    </section>
  )
}
