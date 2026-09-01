//? Libraries
import type { ReactNode } from "react"

type Props = {
  open: boolean
  children: ReactNode
}

/** Opens extra rows on the block axis. Grid 0fr→1fr is what mobile has in
 *  place of the desktop track interpolation, which never runs when stacked. */
export function PanelReveal({ open, children }: Props) {
  return (
    <div className={`panel-reveal${open ? " is-open" : ""}`} inert={!open}>
      <div className="panel-reveal-inner">{children}</div>
    </div>
  )
}
