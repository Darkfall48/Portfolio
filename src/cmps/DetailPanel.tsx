//? Libraries
import { useEffect, useId, useRef } from "react"
import { useTranslation } from "react-i18next"

//? Content / i18n
import { experience } from "../content"
import type { PanelTarget } from "../content"

type Props = {
  target: PanelTarget | null
  onClose: () => void
}

export function DetailPanel({ target, onClose }: Props) {
  const { t } = useTranslation()
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const isOpen = target !== null
  const keyPrefix = target ? `${target.kind}.${target.id}` : ""

  useEffect(() => {
    if (!isOpen) return

    closeRef.current?.focus()

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  const body = isOpen ? t(`${keyPrefix}.body`, { returnObjects: true }) : []
  const bullets = Array.isArray(body) ? body.map(String) : []
  const experienceItem =
    target?.kind === "experience"
      ? experience.find((item) => item.id === target.id)
      : undefined
  const experienceEnd = experienceItem
    ? experienceItem.end === "present"
      ? t("experience.present")
      : experienceItem.end
    : ""

  return (
    <div className={`detail-panel${isOpen ? " is-open" : ""}`} hidden={!isOpen}>
      <button
        type="button"
        className="detail-panel-backdrop"
        title={t("action.close")}
        onClick={onClose}
      />
      <aside
        className="detail-panel-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        hidden={!isOpen}
      >
        {target ? (
          <>
            <header className="detail-panel-head">
              <h2 id={titleId} className="detail-panel-title">
                {target.kind === "experience"
                  ? t(`${keyPrefix}.org`)
                  : t(`${keyPrefix}.title`)}
              </h2>
              <button
                ref={closeRef}
                type="button"
                className="detail-panel-close"
                title={t("action.close")}
                onClick={onClose}
              >
                {t("action.close")}
              </button>
            </header>
            {target.kind === "experience" ? (
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
