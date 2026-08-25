//? Libraries
import { useTranslation } from "react-i18next"

//? Content / i18n
import { profile } from "../content/profile"
import { SUPPORTED_LOCALES, type Locale } from "../i18n"

//? Components
import { useRequestLocale } from "./locale-stage-context"

//? Hooks
import { useTlvClock } from "../hooks/useTlvClock"

const LANG_LABELS: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  he: "עב",
}

export function SiteHeader() {
  const { t, i18n } = useTranslation()
  const active = i18n.language.slice(0, 2) as Locale
  const requestLocale = useRequestLocale()
  const time = useTlvClock()
  const cvHref = profile.cvPath
    ? `${import.meta.env.BASE_URL}${profile.cvPath.replace(/^\//, "")}`
    : ""

  return (
    <header className="site-header">
      <p className="site-header-name">{profile.name}</p>
      <nav className="site-header-nav" aria-label={t("nav.site")}>
        <p className="site-header-clock" title={t("action.clock")}>
          {profile.timezoneCode} {time || "--:--"}
        </p>
        <div
          className="site-header-lang"
          role="group"
          aria-label={t("action.language")}
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <button
              key={locale}
              type="button"
              className={`site-header-lang-btn${active === locale ? " is-active" : ""}`}
              title={t(`lang.${locale}`)}
              aria-pressed={active === locale}
              onClick={() => requestLocale(locale)}
            >
              {LANG_LABELS[locale]}
            </button>
          ))}
        </div>
        {cvHref ? (
          <a
            className="site-header-cv"
            href={cvHref}
            title={t("action.cv")}
            download
          >
            {t("action.cv")}
          </a>
        ) : null}
      </nav>
    </header>
  )
}
