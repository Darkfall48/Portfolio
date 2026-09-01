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
  cvSyncRoleHeaders,
  isSameSelection,
  skillChip,
} from "../content"
import { SUPPORTED_LOCALES, isLocale, localeDir } from "../i18n"
import type { Locale } from "../i18n"

//? Services
import {
  buildCvData,
  cvFileName,
  cvSkillLabel,
  estimateCvFill,
  sanitizeFileName,
} from "../services/cvDocument"
import type { CvDoc } from "../services/cvDocument"
import { downloadBlob, renderCvDocx } from "../services/cvDocx"
import { matchOffer, tailorSelection } from "../services/jobMatch"

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

/** A row can be driven by its own key, or by whatever sits under it. */
type LineOptions = {
  nested?: boolean
  checked?: boolean
  partial?: boolean
  onToggle?: () => void
}

export function CvBuilder({ isOpen, onClose }: Props) {
  const { t, i18n } = useTranslation()
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const [selection, setSelection] = useState(cvFullSelection)
  const [phone, setPhone] = useState(readStoredPhone)
  const [offer, setOffer] = useState("")
  const [pasteFailed, setPasteFailed] = useState(false)
  const offerRef = useRef<HTMLTextAreaElement>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState("")

  const match = useMemo(() => matchOffer(offer), [offer])

  // Reading in one language while applying in another is normal, so the
  // document keeps its own language and only starts from the site's.
  const [lang, setLang] = useState<Locale>(() => {
    const active = i18n.resolvedLanguage ?? ""
    return isLocale(active) ? active : "en"
  })
  // The angle the file name is derived from, until the field is typed into.
  const [titleKey, setTitleKey] = useState("full")
  const [customName, setCustomName] = useState<string | null>(null)

  // The document wording is a nested branch of the locale file rather than a
  // flat string, so it comes back as an object.
  const doc = useMemo(
    () =>
      i18n.getFixedT(lang)("cv.doc", {
        returnObjects: true,
      }) as unknown as CvDoc,
    [i18n, lang],
  )
  const filename =
    customName ?? cvFileName(doc.fileTitles[titleKey] ?? doc.fileTitles.full)
  const data = useMemo(
    () => buildCvData(doc, selection, phone),
    [doc, selection, phone],
  )
  const fill = estimateCvFill(data, lang)
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

  /** Every change repairs the header invariant, presets included. */
  function update(mutate: (keys: Set<string>) => void) {
    setSelection((current) => {
      const next = new Set(current)
      mutate(next)
      return cvSyncRoleHeaders(next)
    })
  }

  function toggle(key: string) {
    update((keys) => {
      if (keys.has(key)) keys.delete(key)
      else keys.add(key)
    })
  }

  /** A caption doubles as a switch for everything under it. */
  function setKeys(keys: string[], on: boolean) {
    update((current) => {
      for (const key of keys) {
        if (on) current.add(key)
        else current.delete(key)
      }
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

  /**
   * Firefox refuses a clipboard read outside a paste gesture, and a denied
   * permission lands in the same place. Neither is worth an error banner: the
   * textarea is right there, so the fallback is to focus it and say so.
   */
  async function onPasteOffer() {
    try {
      const text = await navigator.clipboard.readText()
      setOffer(text)
      setPasteFailed(false)
    } catch {
      setPasteFailed(true)
      offerRef.current?.focus()
    }
  }

  /** Angles carry their own file name, so picking one renames the download. */
  function applyPreset(keys: Set<string>, key: string) {
    setSelection(cvSyncRoleHeaders(keys))
    setTitleKey(key)
    setCustomName(null)
  }

  /** Tailoring lands on an angle, so it renames the download like a click. */
  function onTailor() {
    const { keys, angle } = tailorSelection(match, doc, lang, phone)
    applyPreset(keys, angle)
  }

  async function onDownload() {
    setIsBusy(true)
    setError("")
    try {
      const blob = await renderCvDocx(data, lang)
      const safe = sanitizeFileName(filename) || cvFileName(doc.fileTitles.full)
      downloadBlob(blob, `${safe}.docx`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setIsBusy(false)
    }
  }

  /**
   * A line's lead already summarises it, so it carries the row and the rest
   * trails off dimmed. Lines written without a lead fall back to their own
   * text, and the full wording stays one hover away.
   */
  function line(
    key: string,
    lead: string,
    text: string,
    options: LineOptions = {},
  ) {
    const full = `${lead}${text}`.trim()
    const hasLead = lead.trim().length > 0
    return (
      <label
        key={key}
        className={[
          "cv-builder-line",
          options.nested ? "is-nested" : "",
          match.scores.has(key) ? "is-matched" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <input
          type="checkbox"
          ref={(input) => {
            if (input) input.indeterminate = options.partial === true
          }}
          checked={options.checked ?? selection.has(key)}
          onChange={options.onToggle ?? (() => toggle(key))}
        />
        {/* These are lines of the document, not UI copy, so they carry the
            document's own language and direction rather than the panel's. */}
        <span
          className="cv-builder-line-copy"
          title={full}
          lang={lang}
          dir={localeDir(lang)}
        >
          <span>{hasLead ? lead : full}</span>
          {hasLead ? (
            <span className="cv-builder-line-rest">{text}</span>
          ) : null}
        </span>
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

        <div className="cv-builder-body">
          <section className="cv-builder-block">
            <h3 className="cv-builder-block-title">
              <span className="hud-index" aria-hidden="true">
                01
              </span>
              {t("cv.builder.setup")}
            </h3>
            <div className="cv-builder-chips" role="group">
              <p className="cv-builder-chips-label">
                {t("cv.builder.language")}
              </p>
              {SUPPORTED_LOCALES.map((locale) => (
                <button
                  key={locale}
                  type="button"
                  className={locale === lang ? "is-active" : undefined}
                  aria-pressed={locale === lang}
                  onClick={() => setLang(locale)}
                >
                  {t(`lang.${locale}`)}
                </button>
              ))}
            </div>

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
                  onChange={(event) => setCustomName(event.target.value)}
                />
                <small>{t("cv.builder.filenameHint")}</small>
              </label>
            </div>
          </section>

          {/* The automatic version of picking an angle by hand, so it sits with
            the angles rather than off in a corner of its own. */}
          <section className="cv-builder-block">
            <div className="cv-builder-block-head">
              <h3 id={`${titleId}-offer`} className="cv-builder-block-title">
                <span className="hud-index" aria-hidden="true">
                  02
                </span>
                {t("cv.builder.offer")}
              </h3>
              <span className="cv-builder-offer-tools">
                <button type="button" onClick={onPasteOffer}>
                  {t("cv.builder.offerPaste")}
                </button>
                <button
                  type="button"
                  disabled={offer === ""}
                  onClick={() => {
                    setOffer("")
                    setPasteFailed(false)
                  }}
                >
                  {t("cv.builder.offerClear")}
                </button>
              </span>
            </div>
            <div className="cv-builder-offer">
              <div className="cv-builder-field">
                <textarea
                  id="cv-offer"
                  aria-labelledby={`${titleId}-offer`}
                  ref={offerRef}
                  rows={3}
                  value={offer}
                  placeholder={t("cv.builder.offerPlaceholder")}
                  onChange={(event) => setOffer(event.target.value)}
                />
                <small>
                  {pasteFailed
                    ? t("cv.builder.offerPasteFailed")
                    : t("cv.builder.offerHint")}
                </small>
              </div>

              {offer.trim() ? (
                <div className="cv-builder-offer-read">
                  {/* One shared grid for both rows: the legends size a single
                  column, so the terms line up under each other. */}
                  <div className="cv-builder-offer-rows">
                    {match.found.length > 0 ? (
                      <p className="cv-builder-offer-terms">
                        <span className="cv-builder-offer-legend">
                          {t("cv.builder.offerFound")}
                        </span>
                        <span className="cv-builder-offer-list">
                          {match.found.map((id) => (
                            <span key={id} className="cv-builder-offer-term">
                              {skillChip(id)?.label}
                            </span>
                          ))}
                        </span>
                      </p>
                    ) : (
                      <p className="cv-builder-offer-empty">
                        {t("cv.builder.offerNone")}
                      </p>
                    )}

                    {match.gaps.length > 0 ? (
                      <p className="cv-builder-offer-terms is-gap">
                        <span className="cv-builder-offer-legend">
                          {t("cv.builder.offerGaps")}
                        </span>
                        <span className="cv-builder-offer-list">
                          {match.gaps.map((term) => (
                            <span key={term} className="cv-builder-offer-term">
                              {term}
                            </span>
                          ))}
                        </span>
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className="cv-builder-offer-apply"
                    disabled={match.found.length === 0}
                    onClick={onTailor}
                  >
                    {t("cv.builder.tailor")}
                  </button>
                </div>
              ) : null}
            </div>
          </section>

          <section className="cv-builder-block">
            <h3 className="cv-builder-block-title">
              <span className="hud-index" aria-hidden="true">
                03
              </span>
              {t("cv.builder.angle")}
            </h3>
            <div className="cv-builder-toolbar">
              <div className="cv-builder-chips" role="group">
                {cvPresets
                  .filter((preset) => preset.hidden !== true)
                  .map((preset) => {
                    const keys = cvSyncRoleHeaders(cvPresetSelection(preset))
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
            </div>
          </section>

          <section className="cv-builder-block">
            <h3 className="cv-builder-block-title">
              <span className="hud-index" aria-hidden="true">
                04
              </span>
              {t("cv.builder.lines")}
            </h3>
            <section className="cv-builder-section">
              <h3>{t("cv.builder.summary")}</h3>
              {cvSections.summary.map((item) => {
                const entry = doc.summary[item.id]
                // i18next falls back a whole branch, not a single leaf, so a
                // half-translated locale would otherwise crash the panel.
                if (!entry) return null
                return line(cvKey("summary", item.id), entry.lead, entry.text)
              })}
            </section>

            <section className="cv-builder-section">
              <h3>{t("cv.builder.experience")}</h3>
              {cvSections.roles.map((role) => {
                const entry = doc.roles[role.id]
                if (!entry) return null
                const bulletKeys = role.bullets.map((bullet) =>
                  cvKey("bullet", role.id, bullet.id),
                )
                const someOn = bulletKeys.some((key) => selection.has(key))
                const allOn = bulletKeys.every((key) => selection.has(key))
                return (
                  <div key={role.id} className="cv-builder-role">
                    {/* Two rows anchor the whole section, so they stay whole. */}
                    {line(
                      cvKey("role", role.id),
                      `${entry.lead}${entry.period}${entry.title}${entry.suffix}`.trim(),
                      "",
                      {
                        checked: someOn,
                        partial: someOn && !allOn,
                        onToggle: () => setKeys(bulletKeys, !someOn),
                      },
                    )}
                    {role.bullets.map((bullet) => {
                      const text = entry.bullets[bullet.id]
                      if (!text) return null
                      return line(
                        cvKey("bullet", role.id, bullet.id),
                        text.lead,
                        text.text,
                        { nested: true },
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
                if (!entry) return null
                return line(
                  cvKey("education", item.id),
                  `${entry.period}${entry.title}`.trim(),
                  entry.suffix,
                )
              })}
            </section>

            <section className="cv-builder-section">
              <h3>{t("cv.builder.skills")}</h3>
              {/* Tools are picked one at a time: a paragraph of a hundred of them
              is only tailorable if the smallest unit is the tool itself. */}
              {cvSections.skills.map((skillLine) =>
                skillLine.groups.map((group) => {
                  const keys = group.runs.flat().map((id) => cvKey("skill", id))
                  const allOn = keys.every((key) => selection.has(key))
                  const caption = (doc.skillLabels?.[group.id] ?? group.id)
                    .replace(/[\s\u00a0]*:[\s\u00a0]*$/, "")
                    .trim()
                  return (
                    <div
                      key={`${skillLine.id}:${group.id}`}
                      className="cv-builder-matrix"
                      lang={lang}
                      dir={localeDir(lang)}
                    >
                      <button
                        type="button"
                        className="cv-builder-matrix-label"
                        aria-pressed={allOn}
                        onClick={() => setKeys(keys, !allOn)}
                      >
                        {caption}
                      </button>
                      {/* One row per run: the document already groups these tools
                      by family, and a family is what gets dropped at once. */}
                      <div className="cv-builder-matrix-runs">
                        {group.runs.map((run) => (
                          <div key={run[0]} className="cv-builder-matrix-chips">
                            {run.map((id) => {
                              const key = cvKey("skill", id)
                              const isOn = selection.has(key)
                              const classes = [
                                isOn ? "is-active" : "",
                                match.scores.has(key) ? "is-matched" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")
                              return (
                                <button
                                  key={id}
                                  type="button"
                                  className={classes || undefined}
                                  aria-pressed={isOn}
                                  onClick={() => toggle(key)}
                                >
                                  {cvSkillLabel(id, doc)}
                                </button>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }),
              )}
            </section>
          </section>
        </div>

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
