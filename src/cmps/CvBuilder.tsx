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
import type { ContentId } from "../content/types"
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
const OFFER_STORAGE_KEY = "portfolio-cv-offer"

function readStored(key: string): string {
  try {
    return localStorage.getItem(key) ?? ""
  } catch {
    // Private mode or blocked storage — the field just starts empty.
    return ""
  }
}

function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Ignore quota and privacy errors: the CV still generates this session.
  }
}

type Props = {
  isOpen: boolean
  onClose: () => void
}

/** The outcome of a tailoring, kept so the panel can explain and undo it. */
type Applied = {
  angle: ContentId
  because: string[]
  added: number
  removed: number
  previous: Set<string>
  previousTitle: string
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
  const [phone, setPhone] = useState(() => readStored(PHONE_STORAGE_KEY))
  // Getting a tailored CV right takes more than one pass, so the ad outlives
  // the panel rather than having to be fetched and pasted again.
  const [offer, setOffer] = useState(() => readStored(OFFER_STORAGE_KEY))
  const [pasteFailed, setPasteFailed] = useState(false)
  const offerRef = useRef<HTMLTextAreaElement>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState("")

  const match = useMemo(() => matchOffer(offer), [offer])
  /** What the last tailoring did, and what it did it to, so it can be undone. */
  const [applied, setApplied] = useState<Applied | null>(null)

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
    // Once a row is ticked by hand the summary no longer describes what is on
    // screen, so it stops claiming to.
    setApplied(null)
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
    writeStored(PHONE_STORAGE_KEY, value)
  }

  function onOfferChange(value: string) {
    setOffer(value)
    setPasteFailed(false)
    writeStored(OFFER_STORAGE_KEY, value)
  }

  /**
   * Firefox refuses a clipboard read outside a paste gesture, and a denied
   * permission lands in the same place. Neither is worth an error banner: the
   * textarea is right there, so the fallback is to focus it and say so.
   */
  async function onPasteOffer() {
    try {
      onOfferChange(await navigator.clipboard.readText())
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

  /** Clicking an angle by hand replaces whatever the offer had decided. */
  function onPickAngle(keys: Set<string>, key: string) {
    setApplied(null)
    applyPreset(keys, key)
  }

  /**
   * A marked row says it answers the offer; this says what it answers. The
   * tags behind a line are a judgement, not something its wording shows, so
   * they are worth reading before trusting the row.
   */
  function whyLine(key: string, full: string): string {
    const evidence = match.evidence.get(key)
    if (!evidence) return full
    const tools = evidence.map((id) => skillChip(id)?.label ?? id).join(", ")
    return `${full}\n\n${t("cv.builder.offerBecause")} ${tools}`
  }

  /**
   * Tailoring rewrites a hundred checkboxes at once, which is only trustworthy
   * if it says what it did and can be taken back.
   */
  function onTailor() {
    const { keys, angle, because } = tailorSelection(match, doc, lang, phone)
    let added = 0
    let removed = 0
    for (const key of keys) if (!selection.has(key)) added += 1
    for (const key of selection) if (!keys.has(key)) removed += 1

    setApplied({
      angle,
      because,
      added,
      removed,
      previous: selection,
      previousTitle: titleKey,
    })
    applyPreset(keys, angle)
  }

  function onUndoTailor() {
    if (!applied) return
    setSelection(applied.previous)
    setTitleKey(applied.previousTitle)
    setCustomName(null)
    setApplied(null)
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
          title={whyLine(key, full)}
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

        <div className="cv-builder-chips" role="group">
          <p className="cv-builder-chips-label">{t("cv.builder.language")}</p>
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

        {/* The automatic version of picking an angle by hand, so it sits with
            the angles rather than off in a corner of its own. */}
        <div className="cv-builder-offer">
          <div className="cv-builder-field">
            <div className="cv-builder-offer-head">
              <label className="cv-builder-field-label" htmlFor="cv-offer">
                {t("cv.builder.offer")}
              </label>
              <span className="cv-builder-offer-tools">
                <button type="button" onClick={onPasteOffer}>
                  {t("cv.builder.offerPaste")}
                </button>
                <button
                  type="button"
                  disabled={offer === ""}
                  onClick={() => onOfferChange("")}
                >
                  {t("cv.builder.offerClear")}
                </button>
              </span>
            </div>
            <textarea
              id="cv-offer"
              ref={offerRef}
              rows={3}
              value={offer}
              placeholder={t("cv.builder.offerPlaceholder")}
              onChange={(event) => onOfferChange(event.target.value)}
            />
            <small>
              {pasteFailed
                ? t("cv.builder.offerPasteFailed")
                : t("cv.builder.offerHint")}
            </small>
          </div>

          {offer.trim() ? (
            <div className="cv-builder-offer-read">
              {match.found.length > 0 ? (
                <p className="cv-builder-offer-terms">
                  <span className="cv-builder-offer-legend">
                    {t("cv.builder.offerFound")}
                  </span>
                  {match.found.map((demand) => (
                    <span
                      key={demand.value}
                      className={
                        demand.required
                          ? "cv-builder-offer-term"
                          : "cv-builder-offer-term is-bonus"
                      }
                      title={
                        demand.required
                          ? t("cv.builder.offerRequired")
                          : t("cv.builder.offerBonus")
                      }
                    >
                      {skillChip(demand.value)?.label}
                    </span>
                  ))}
                </p>
              ) : (
                <p className="cv-builder-offer-legend">
                  {t("cv.builder.offerNone")}
                </p>
              )}

              {match.gaps.length > 0 ? (
                <p className="cv-builder-offer-terms is-gap">
                  <span className="cv-builder-offer-legend">
                    {t("cv.builder.offerGaps")}
                  </span>
                  {match.gaps.map((demand) => (
                    <span
                      key={demand.value}
                      className={
                        demand.required
                          ? "cv-builder-offer-term"
                          : "cv-builder-offer-term is-bonus"
                      }
                      title={
                        demand.required
                          ? t("cv.builder.offerRequired")
                          : t("cv.builder.offerBonus")
                      }
                    >
                      {demand.value}
                    </span>
                  ))}
                </p>
              ) : null}

              <button
                type="button"
                className="cv-builder-offer-apply"
                disabled={match.found.length === 0}
                onClick={onTailor}
              >
                {t("cv.builder.tailor")}
              </button>

              {applied ? (
                <p className="cv-builder-offer-applied">
                  <span>
                    {t("cv.builder.offerAngle")}{" "}
                    <strong>
                      {t(`cv.builder.presets.${applied.angle}`, {
                        defaultValue: t("cv.builder.selectAll"),
                      })}
                    </strong>
                    {applied.because.length > 0 ? (
                      <em>{` — “${applied.because[0]}”`}</em>
                    ) : null}
                  </span>
                  <span className="cv-builder-offer-delta">
                    {`+${applied.added} / −${applied.removed}`}
                  </span>
                  <button type="button" onClick={onUndoTailor}>
                    {t("cv.builder.offerUndo")}
                  </button>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="cv-builder-chips" role="group">
          <p className="cv-builder-chips-label">{t("cv.builder.angle")}</p>
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
                  onClick={() => onPickAngle(keys, preset.id)}
                >
                  {t(`cv.builder.presets.${preset.id}`)}
                </button>
              )
            })}
        </div>

        <div className="cv-builder-bulk">
          <button
            type="button"
            onClick={() => onPickAngle(cvFullSelection(), "full")}
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
              )
            }),
          )}
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
