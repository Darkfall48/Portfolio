//? Libraries
import { useTranslation } from "react-i18next"

//? Content / i18n
import { isOnHome, work } from "../content"
import type { ContentId } from "../content"

type Props = {
  onSelect: (id: ContentId) => void
}

export function WorkList({ onSelect }: Props) {
  const { t } = useTranslation()
  const items = work.filter(isOnHome)

  return (
    <section className="work-list">
      <h2 className="work-list-title">
        <span className="hud-index" aria-hidden="true">
          02
        </span>
        {t("nav.work")}
      </h2>
      <ul className="work-list-items">
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
