//? Libraries
import { useEffect, useState } from "react"
import type { RefObject } from "react"

/**
 * True when an element's content is taller than the box showing it. Lets a
 * panel offer an expand control only where something is really being cut off,
 * rather than from a hardcoded item count that ignores the space available.
 */
export function useOverflows(ref: RefObject<HTMLElement | null>): boolean {
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Arrow rather than a declaration: a hoisted function loses the null check
    // above, since TypeScript cannot tell when it will be called.
    const measure = () => {
      // A pixel of slack: sub-pixel layout rounds scrollHeight up on its own.
      setOverflows(node.scrollHeight - node.clientHeight > 1)
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(node)
    // Content reflows when the copy changes length, which never resizes the
    // scroll container itself, so the children have to be watched too.
    for (const child of node.children) observer.observe(child)

    return () => observer.disconnect()
  }, [ref])

  return overflows
}
