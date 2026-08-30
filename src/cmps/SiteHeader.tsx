//? Libraries
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

//? Content / i18n
import { profile } from "../content"
import { SUPPORTED_LOCALES, type Locale } from "../i18n"

//? Components
import { useRequestLocale } from "./locale-stage-context"

//? Hooks
import { useTheme } from "../hooks/useTheme"
import { useTlvClock } from "../hooks/useTlvClock"

//? Icons
import { FiDownload, FiFileText, FiLoader, FiMoon, FiSun } from "react-icons/fi"

const LANG_LABELS: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  he: "עב",
}

// A static PDF download gives no browser feedback, so the button acknowledges
// the click for a moment. It reports nothing about real progress.
const CV_FEEDBACK_MS = 1100

type Props = {
  onBuildCv: () => void
}

export function SiteHeader({ onBuildCv }: Props) {
  const { t, i18n } = useTranslation()
  const active = i18n.language.slice(0, 2) as Locale
  const requestLocale = useRequestLocale()
  const { theme, toggle } = useTheme()
  const time = useTlvClock()
  const [isCvBusy, setIsCvBusy] = useState(false)
  const cvTimer = useRef(0)

  useEffect(() => () => window.clearTimeout(cvTimer.current), [])

  const cvHref = profile.cvPath
    ? `${import.meta.env.BASE_URL}${profile.cvPath.replace(/^\//, "")}`
    : ""
  const themeLabel =
    theme === "dark" ? t("action.themeLight") : t("action.themeDark")

  function onCvClick() {
    window.clearTimeout(cvTimer.current)
    setIsCvBusy(true)
    cvTimer.current = window.setTimeout(
      () => setIsCvBusy(false),
      CV_FEEDBACK_MS,
    )
  }

  return (
    <header className="site-header">
      <div className="site-header-identity">
        <p className="site-header-name">{profile.name}</p>
        <p className="site-header-meta">
          <span className="site-header-year">{new Date().getFullYear()}</span>
          <span className="site-header-clock" title={t("action.clock")}>
            {profile.timezoneCode} {time || "--:--"}
          </span>
        </p>
      </div>
      <nav className="site-header-nav" aria-label={t("nav.site")}>
        <button
          type="button"
          className="site-header-theme"
          title={themeLabel}
          aria-label={themeLabel}
          onClick={toggle}
        >
          {theme === "dark" ? (
            <FiSun aria-hidden="true" />
          ) : (
            <FiMoon aria-hidden="true" />
          )}
        </button>
        <div
          className="site-header-lang"
          role="group"
          aria-label={t("action.language")}
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <button
              key={locale}
              type="button"
              lang={locale}
              className={`site-header-lang-btn${active === locale ? " is-active" : ""}`}
              title={t(`lang.${locale}`)}
              aria-pressed={active === locale}
              onClick={() => requestLocale(locale)}
            >
              {LANG_LABELS[locale]}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="site-header-build"
          title={t("cv.builder.open")}
          aria-label={t("cv.builder.open")}
          onClick={onBuildCv}
        >
          <FiFileText aria-hidden="true" />
          <span>{t("cv.builder.open")}</span>
        </button>
        {cvHref ? (
          <a
            className={`site-header-cv${isCvBusy ? " is-busy" : ""}`}
            href={cvHref}
            title={t("action.cv")}
            aria-label={t("action.cv")}
            aria-busy={isCvBusy}
            download
            onClick={onCvClick}
          >
            {isCvBusy ? (
              <FiLoader aria-hidden="true" />
            ) : (
              <FiDownload aria-hidden="true" />
            )}
            <span>{t("action.cv")}</span>
          </a>
        ) : null}
      </nav>
    </header>
  )
}
