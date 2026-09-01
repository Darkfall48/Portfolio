//? Libraries
import { useRef } from "react"
import { useTranslation } from "react-i18next"

//? Content / i18n
import { HOME_SLOTS, hiddenItemCount, isOnHome, work } from "../content"
import type { ContentId, WorkItem } from "../content"

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

export function WorkList({
  onSelect,
  expanded,
  collapsed,
  onToggleExpand,
}: Props) {
  const { t } = useTranslation()
  const visible = work.filter(isOnHome)
  const head = visible.slice(0, HOME_SLOTS.work)
  const tail = visible.slice(HOME_SLOTS.work)
  const hidden = hiddenItemCount(work, HOME_SLOTS.work)
  const listRef = useRef<HTMLDivElement>(null)
  // Same reason as Experience: the budget cannot see a clipped row.
  const overflows = useOverflows(listRef)
  const hasMore = hidden > 0 || overflows || expanded

  function renderItem(item: WorkItem) {
    return (
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
    )
  }

  return (
    <section className="work-list" inert={collapsed}>
      <h2 className="work-list-title">
        <span className="hud-index" aria-hidden="true">
          02
        </span>
        {t("nav.work")}
        <PanelExpand
          expanded={expanded}
          hasMore={hasMore}
          hiddenRows={hidden}
          onToggle={onToggleExpand}
        />
      </h2>
      <div className="work-list-body" ref={listRef}>
        <ul className="work-list-items">{head.map(renderItem)}</ul>
        {tail.length > 0 ? (
          <PanelReveal open={expanded}>
            <ul className="work-list-items is-rest">{tail.map(renderItem)}</ul>
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
