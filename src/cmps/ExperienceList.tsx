//? Libraries
import { useTranslation } from "react-i18next"

//? Content / i18n
import { experience, isOnHome } from "../content"
import type { ContentId } from "../content"

type Props = {
  onSelect: (id: ContentId) => void
}

export function ExperienceList({ onSelect }: Props) {
  const { t } = useTranslation()
  const items = experience.filter(isOnHome)

  return (
    <section className="experience-list">
      <h2 className="experience-list-title">
        <span className="hud-index" aria-hidden="true">
          01
        </span>
        {t("nav.experience")}
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
