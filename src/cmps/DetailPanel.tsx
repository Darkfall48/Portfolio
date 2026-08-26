//? Libraries
import { useEffect, useId, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

//? Content / i18n
import { experience } from "../content"
import type { PanelTarget } from "../content"

//? Icons
import { FiX } from "react-icons/fi"

type Props = {
  target: PanelTarget | null
  onClose: () => void
}

export function DetailPanel({ target, onClose }: Props) {
  const { t } = useTranslation()
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const isOpen = target !== null
  // Held so the sheet still has copy to show while it slides back out. Without
  // it the content unmounts on the closing click and an empty shell leaves.
  const [shown, setShown] = useState<PanelTarget | null>(target)

  // Adjusted during render rather than in an effect, so the content exists on
  // the very commit that opens the panel and the close button can take focus.
  if (target && target !== shown) setShown(target)

  useEffect(() => {
    if (!isOpen) return

    // The button is already at the top of the sheet, so no ancestor ever needs
    // to scroll to reveal it. Asking not to is what keeps a scroll out of the
    // opening slide.
    closeRef.current?.focus({ preventScroll: true })

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  const keyPrefix = shown ? `${shown.kind}.${shown.id}` : ""
  const body = shown ? t(`${keyPrefix}.body`, { returnObjects: true }) : []
  const bullets = Array.isArray(body) ? body.map(String) : []
  const experienceItem =
    shown?.kind === "experience"
      ? experience.find((item) => item.id === shown.id)
      : undefined
  const experienceEnd = experienceItem
    ? experienceItem.end === "present"
      ? t("experience.present")
      : experienceItem.end
    : ""

  const kindClass = shown ? ` is-${shown.kind}` : ""
  const eyebrow = shown
    ? t(shown.kind === "experience" ? "nav.experience" : "nav.work")
    : ""

  return (
    <div
      className={`detail-panel${isOpen ? " is-open" : ""}${kindClass}`}
      // Not `hidden`: display:none gives the sheet no box to slide from, so the
      // transition never runs. Inert takes it out of reach instead, and CSS
      // hides it once the closing slide is over.
      inert={!isOpen}
    >
      <button
        type="button"
        className="detail-panel-backdrop"
        title={t("action.close")}
        aria-label={t("action.close")}
        onClick={onClose}
      />
      <aside
        className="detail-panel-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {shown ? (
          <>
            <p className="detail-panel-eyebrow">{eyebrow}</p>
            <header className="detail-panel-head">
              <h2 id={titleId} className="detail-panel-title">
                {shown.kind === "experience"
                  ? t(`${keyPrefix}.org`)
                  : t(`${keyPrefix}.title`)}
              </h2>
              <button
                ref={closeRef}
                type="button"
                className="detail-panel-close"
                title={t("action.close")}
                aria-label={t("action.close")}
                onClick={onClose}
              >
                <FiX aria-hidden="true" />
              </button>
            </header>
            {shown.kind === "experience" ? (
              <p className="detail-panel-kicker">
                {experienceItem
                  ? `${experienceItem.start}–${experienceEnd} · `
                  : ""}
                {t(`${keyPrefix}.title`)}
              </p>
            ) : null}
            <p className="detail-panel-summary">{t(`${keyPrefix}.summary`)}</p>
            <ul className="detail-panel-body">
              {bullets.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </>
        ) : null}
      </aside>
    </div>
  )
}
