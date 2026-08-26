//? Libraries
import { useTranslation } from "react-i18next"

//? Icons
import { FiMaximize2, FiMinimize2 } from "react-icons/fi"

type Props = {
  expanded: boolean
  /** Whether the panel is holding anything back. False hides the control. */
  hasMore: boolean
  /** Rows left out, shown as a "+N" hint. Omitted where no count applies. */
  hiddenRows?: number
  onToggle: () => void
}

export function PanelExpand({
  expanded,
  hasMore,
  hiddenRows = 0,
  onToggle,
}: Props) {
  const { t } = useTranslation()
  const label = t(expanded ? "action.collapse" : "action.expand")

  // A control that reveals nothing is noise.
  if (!hasMore) return null

  return (
    <span className="panel-expand">
      {!expanded && hiddenRows > 0 ? (
        <span className="panel-expand-count">+{hiddenRows}</span>
      ) : null}
      <button
        type="button"
        className="panel-expand-btn"
        title={label}
        aria-label={label}
        aria-expanded={expanded}
        onClick={onToggle}
      >
        {expanded ? (
          <FiMinimize2 aria-hidden="true" />
        ) : (
          <FiMaximize2 aria-hidden="true" />
        )}
      </button>
    </span>
  )
}
