//? Libraries
import { useTranslation } from "react-i18next"

//? Content / i18n
import { profile } from "../content/profile"

export function ProfileCard() {
  const { t } = useTranslation()

  return (
    <article className="profile-card">
      <span className="profile-card-spine" aria-hidden="true" />
      <p className="profile-card-kicker">
        <span className="profile-card-live" aria-hidden="true" />
        {t(profile.kickerKey)}
      </p>
      <h1 className="profile-card-name">{profile.name}</h1>
      <p className="profile-card-headline">{t(profile.headlineKey)}</p>
      <p className="profile-card-lead">{t("profile.lead")}</p>
      <p className="profile-card-location">{t(profile.locationKey)}</p>
      <dl className="profile-card-meta">
        <div>
          <dt>{t("profile.languages")}</dt>
          <dd>{profile.languages.join(" · ")}</dd>
        </div>
        <div>
          <dt>{t("profile.educationLabel")}</dt>
          <dd>{t(profile.educationKey)}</dd>
        </div>
      </dl>
      <nav className="profile-card-links" aria-label={t("action.contact")}>
        <a href={profile.links.email} title={t("action.email")}>
          {t("action.email")}
        </a>
        <a
          href={profile.links.linkedin}
          title={t("action.linkedin")}
          target="_blank"
          rel="noreferrer"
        >
          {t("action.linkedin")}
        </a>
        <a
          href={profile.links.github}
          title={t("action.github")}
          target="_blank"
          rel="noreferrer"
        >
          {t("action.github")}
        </a>
      </nav>
    </article>
  )
}
