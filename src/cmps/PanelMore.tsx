//? Libraries
import { useTranslation } from "react-i18next"

//? Icons
import { FiChevronDown, FiChevronUp } from "react-icons/fi"

type Props = {
  expanded: boolean
  /** Same gate as the header control: hide when the list already fits. */
  hasMore: boolean
  onToggle: () => void
}

export function PanelMore({ expanded, hasMore, onToggle }: Props) {
  const { t } = useTranslation()
  const label = t(expanded ? "action.viewLess" : "action.viewMore")

  if (!hasMore) return null

  return (
    <div className="panel-more-slot">
      <button
        type="button"
        className="panel-more"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <span>{label}</span>
        {expanded ? (
          <FiChevronUp aria-hidden="true" />
        ) : (
          <FiChevronDown aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
