//? Libraries
import { useTranslation } from "react-i18next"

//? Content / i18n
import { HOME_SLOTS, experience, hiddenItemCount, homeItems } from "../content"
import type { ContentId } from "../content"

//? Components
import { PanelExpand } from "./PanelExpand"

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
  const items = homeItems(experience, HOME_SLOTS.experience, expanded)
  const hidden = hiddenItemCount(experience, HOME_SLOTS.experience)

  return (
    <section className="experience-list" inert={collapsed}>
      <h2 className="experience-list-title">
        <span className="hud-index" aria-hidden="true">
          01
        </span>
        {t("nav.experience")}
        <PanelExpand
          expanded={expanded}
          hasMore={hidden > 0}
          hiddenRows={hidden}
          onToggle={onToggleExpand}
        />
      </h2>
      <ul className="experience-list-items">
        {items.map((item) => {
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
                  {item.start}–{endLabel}
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
        })}
      </ul>
    </section>
  )
}
