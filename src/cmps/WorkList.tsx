//? Libraries
import { useRef } from "react"
import { useTranslation } from "react-i18next"

//? Content / i18n
import { HOME_SLOTS, hiddenItemCount, homeItems, work } from "../content"
import type { ContentId } from "../content"

//? Components
import { PanelExpand } from "./PanelExpand"

//? Hooks
import { useOverflows } from "../hooks/useOverflows"

type Props = {
  onSelect: (id: ContentId) => void
  expanded: boolean
  /** The sibling panel took the cell: this one is folded away, not just small. */
  collapsed: boolean
  onToggleExpand: () => void
}

export function WorkList({
  onSelect,
  expanded,
  collapsed,
  onToggleExpand,
}: Props) {
  const { t } = useTranslation()
  const items = homeItems(work, HOME_SLOTS.work, expanded)
  const hidden = hiddenItemCount(work, HOME_SLOTS.work)
  const listRef = useRef<HTMLUListElement>(null)
  // Same reason as Experience: the budget cannot see a clipped row.
  const overflows = useOverflows(listRef)

  return (
    <section className="work-list" inert={collapsed}>
      <h2 className="work-list-title">
        <span className="hud-index" aria-hidden="true">
          02
        </span>
        {t("nav.work")}
        <PanelExpand
          expanded={expanded}
          hasMore={hidden > 0 || overflows || expanded}
          hiddenRows={hidden}
          onToggle={onToggleExpand}
        />
      </h2>
      <ul className="work-list-items" ref={listRef}>
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="work-list-item"
              title={t("action.openDetails")}
              onClick={() => onSelect(item.id)}
            >
              <span className="work-list-item-name">
                {t(`work.${item.id}.title`)}
              </span>
              <span className="work-list-item-summary">
                {t(`work.${item.id}.summary`)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
