//? Libraries
import { useTranslation } from "react-i18next"

//? Content / i18n
import { isOnHome, skillGroups } from "../content"

export function SkillGroups() {
  const { t } = useTranslation()
  const groups = skillGroups.filter(isOnHome)

  return (
    <section className="skill-groups">
      <h2 className="skill-groups-title">
        <span className="hud-index" aria-hidden="true">
          03
        </span>
        {t("nav.skills")}
      </h2>
      <ul className="skill-groups-list">
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
