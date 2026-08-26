//? Libraries
import { useState } from "react"
import { useTranslation } from "react-i18next"

//? Content / i18n
import { profile } from "../content"

//? Icons
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi"

export function ProfileCard() {
  const { t } = useTranslation()
  // The portrait file ships outside the code, so a missing one must stay invisible.
  const [photoFailed, setPhotoFailed] = useState(false)
  const photoSrc = profile.photoPath
    ? `${import.meta.env.BASE_URL}${profile.photoPath.replace(/^\//, "")}`
    : ""

  return (
    <article
      className={`profile-card${profile.openToWork ? " is-open-to-work" : ""}`}
    >
      <span className="profile-card-spine" aria-hidden="true" />
      {profile.openToWork ? (
        <p className="profile-card-open">{t("profile.openToWork")}</p>
      ) : null}
      <div className="profile-card-identity">
        {photoSrc && !photoFailed ? (
          <img
            className="profile-card-photo"
            src={photoSrc}
            alt={t("profile.photoAlt", { name: profile.name })}
            decoding="async"
            onError={() => setPhotoFailed(true)}
          />
        ) : null}
        <div className="profile-card-titles">
          <p className="profile-card-kicker">
            <span className="profile-card-live" aria-hidden="true" />
            {t(profile.kickerKey)}
          </p>
          <h1 className="profile-card-name">{profile.name}</h1>
        </div>
      </div>
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
          <FiMail aria-hidden="true" />
          <span>{t("action.email")}</span>
        </a>
        <a
          href={profile.links.linkedin}
          title={t("action.linkedin")}
          target="_blank"
          rel="noreferrer"
        >
          <FiLinkedin aria-hidden="true" />
          <span>{t("action.linkedin")}</span>
        </a>
        <a
          href={profile.links.github}
          title={t("action.github")}
          target="_blank"
          rel="noreferrer"
        >
          <FiGithub aria-hidden="true" />
          <span>{t("action.github")}</span>
        </a>
      </nav>
    </article>
  )
}
