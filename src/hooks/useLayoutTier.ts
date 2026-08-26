//? Libraries
import { useEffect, useState } from "react"

// Must match $break-narrow and $break-wide.
const NARROW = 768
const WIDE = 1280

export type LayoutTier = "stacked" | "split" | "wide"

/**
 * Which home layout is live. Expanding a panel means something different in
 * each: stacked panels keep their own row and cost nobody a cell, split ones
 * trade a column, wide ones trade a row or the whole middle column.
 */
export function useLayoutTier(): LayoutTier {
  const [tier, setTier] = useState<LayoutTier>("wide")

  useEffect(() => {
    const narrow = window.matchMedia(`(max-width: ${NARROW - 1}px)`)
    const wide = window.matchMedia(`(min-width: ${WIDE}px)`)

    function sync() {
      if (narrow.matches) return setTier("stacked")
      setTier(wide.matches ? "wide" : "split")
    }

    sync()
    narrow.addEventListener("change", sync)
    wide.addEventListener("change", sync)

    return () => {
      narrow.removeEventListener("change", sync)
      wide.removeEventListener("change", sync)
    }
  }, [])

  return tier
}
