//? Libraries
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

//? Content / i18n
import {
  cvFullSelection,
  cvKey,
  cvPresets,
  cvPresetSelection,
  cvSections,
  isSameSelection,
} from "../content"

//? Services
import {
  buildCvData,
  cvFileName,
  estimateCvFill,
  sanitizeFileName,
} from "../services/cvDocument"
import type { CvDoc } from "../services/cvDocument"
import { downloadBlob, renderCvDocx } from "../services/cvDocx"

//? Icons
import { FiDownload, FiLoader, FiX } from "react-icons/fi"

const PHONE_STORAGE_KEY = "portfolio-cv-phone"

function readStoredPhone(): string {
  try {
    return localStorage.getItem(PHONE_STORAGE_KEY) ?? ""
  } catch {
    // Private mode or blocked storage — the field just starts empty.
    return ""
  }
}

type Props = {
  isOpen: boolean
  onClose: () => void
}

export function CvBuilder({ isOpen, onClose }: Props) {
  const { t } = useTranslation()
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const [selection, setSelection] = useState(cvFullSelection)
  const [phone, setPhone] = useState(readStoredPhone)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState("")

  // The document wording is a nested branch of the locale file rather than a
  // flat string, so it comes back as an object.
  const doc = t("cv.doc", { returnObjects: true }) as unknown as CvDoc
  const [filename, setFilename] = useState(() =>
    cvFileName(doc.fileTitles.full),
  )
  const data = useMemo(
    () => buildCvData(doc, selection, phone),
    [doc, selection, phone],
  )
  const fill = estimateCvFill(data)
  const percent = Math.round(fill * 100)
  const isEmpty =
    !data.hasSummary && !data.hasRoles && !data.hasEducation && !data.hasSkills

  useEffect(() => {
    if (!isOpen) return

    closeRef.current?.focus({ preventScroll: true })

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  function toggle(key: string) {
    setSelection((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function onPhoneChange(value: string) {
    setPhone(value)
    try {
      localStorage.setItem(PHONE_STORAGE_KEY, value)
    } catch {
      // Ignore quota / privacy errors: the CV still generates this session.
    }
  }

  /** Angles carry their own file name, so picking one renames the download. */
  function applyPreset(keys: Set<string>, titleKey: string) {
    setSelection(keys)
    setFilename(cvFileName(doc.fileTitles[titleKey]))
  }

  async function onDownload() {
    setIsBusy(true)
    setError("")
    try {
      const blob = await renderCvDocx(data)
      const safe = sanitizeFileName(filename) || cvFileName(doc.fileTitles.full)
      downloadBlob(blob, `${safe}.docx`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setIsBusy(false)
    }
  }

  function line(key: string, label: string, isNested = false) {
    return (
      <label
        key={key}
        className={`cv-builder-line${isNested ? " is-nested" : ""}`}
      >
        <input
          type="checkbox"
          checked={selection.has(key)}
          onChange={() => toggle(key)}
        />
        <span>{label}</span>
      </label>
    )
  }

  return (
    <div className={`cv-builder${isOpen ? " is-open" : ""}`} inert={!isOpen}>
      <button
        type="button"
        className="cv-builder-backdrop"
        title={t("action.close")}
        aria-label={t("action.close")}
        onClick={onClose}
      />
      <aside
        className="cv-builder-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="cv-builder-head">
          <h2 id={titleId} className="cv-builder-title">
            {t("cv.builder.title")}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="cv-builder-close"
            title={t("action.close")}
            aria-label={t("action.close")}
            onClick={onClose}
          >
            <FiX aria-hidden="true" />
          </button>
        </header>
        <p className="cv-builder-lead">{t("cv.builder.lead")}</p>

        <div className="cv-builder-fields">
          <label className="cv-builder-field">
            <span className="cv-builder-field-label">
              {t("cv.builder.phone")}
            </span>
            <input
              type="tel"
              value={phone}
              placeholder={t("cv.builder.phonePlaceholder")}
              onChange={(event) => onPhoneChange(event.target.value)}
            />
            <small>{t("cv.builder.phoneHint")}</small>
          </label>

          <label className="cv-builder-field">
            <span className="cv-builder-field-label">
              {t("cv.builder.filename")}
            </span>
            <input
              type="text"
              value={filename}
              spellCheck={false}
              onChange={(event) => setFilename(event.target.value)}
            />
            <small>{t("cv.builder.filenameHint")}</small>
          </label>
        </div>

        <div className="cv-builder-presets" role="group">
          <p className="cv-builder-presets-label">{t("cv.builder.angle")}</p>
          {cvPresets
            .filter((preset) => preset.hidden !== true)
            .map((preset) => {
              const keys = cvPresetSelection(preset)
              const isActive = isSameSelection(keys, selection)
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={isActive ? "is-active" : undefined}
                  aria-pressed={isActive}
                  onClick={() => applyPreset(keys, preset.id)}
                >
                  {t(`cv.builder.presets.${preset.id}`)}
                </button>
              )
            })}
        </div>

        <div className="cv-builder-bulk">
          <button
            type="button"
            onClick={() => applyPreset(cvFullSelection(), "full")}
          >
            {t("cv.builder.selectAll")}
          </button>
          <button type="button" onClick={() => setSelection(new Set())}>
            {t("cv.builder.clear")}
          </button>
        </div>

        <section className="cv-builder-section">
          <h3>{t("cv.builder.summary")}</h3>
          {cvSections.summary.map((item) => {
            const entry = doc.summary[item.id]
            return line(
              cvKey("summary", item.id),
              `${entry.lead}${entry.text}`.trim(),
            )
          })}
        </section>

        <section className="cv-builder-section">
          <h3>{t("cv.builder.experience")}</h3>
          {cvSections.roles.map((role) => {
            const entry = doc.roles[role.id]
            return (
              <div key={role.id} className="cv-builder-role">
                {line(
                  cvKey("role", role.id),
                  `${entry.lead}${entry.period}${entry.title}${entry.suffix}`.trim(),
                )}
                {role.bullets.map((bullet) => {
                  const text = entry.bullets[bullet.id]
                  return line(
                    cvKey("bullet", role.id, bullet.id),
                    `${text.lead}${text.text}`.trim(),
                    true,
                  )
                })}
              </div>
            )
          })}
        </section>

        <section className="cv-builder-section">
          <h3>{t("cv.builder.education")}</h3>
          {cvSections.education.map((item) => {
            const entry = doc.education[item.id]
            return line(
              cvKey("education", item.id),
              `${entry.period}${entry.title}${entry.suffix}`.trim(),
            )
          })}
        </section>

        <section className="cv-builder-section">
          <h3>{t("cv.builder.skills")}</h3>
          {cvSections.skills.map((item) => {
            const entry = doc.skills[item.id]
            return line(
              cvKey("skills", item.id),
              entry.parts.map((part) => part.label + part.text).join(""),
            )
          })}
        </section>

        <footer className="cv-builder-foot">
          <div
            className={`cv-builder-fill${fill > 1 ? " is-over" : ""}`}
            role="status"
          >
            <progress
              className="cv-builder-fill-bar"
              value={Math.min(fill, 1)}
              max={1}
            />
            <span className="cv-builder-fill-text">
              {fill > 1
                ? t("cv.builder.fillOver")
                : t("cv.builder.fill", { percent })}
            </span>
          </div>
          <button
            type="button"
            className="cv-builder-download"
            disabled={isEmpty || isBusy}
            aria-busy={isBusy}
            onClick={onDownload}
          >
            {isBusy ? (
              <FiLoader aria-hidden="true" />
            ) : (
              <FiDownload aria-hidden="true" />
            )}
            <span>
              {isEmpty ? t("cv.builder.empty") : t("cv.builder.download")}
            </span>
          </button>
          {error ? <p className="cv-builder-error">{error}</p> : null}
        </footer>
      </aside>
    </div>
  )
}
