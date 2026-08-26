import { isOnHome } from "./types"
import type { HomeItem } from "./types"

/**
 * Rows each list panel shows before it needs expanding. These are layout
 * budgets, not preferences: the home is one viewport, so raising a number
 * without widening the panel hides rows instead of showing them.
 *
 * Focus is deliberately absent. Its chips are small and numerous, so what fits
 * depends on the space left, not on a count: it renders everything and offers
 * the control only when the panel actually cuts content off.
 */
export const HOME_SLOTS = {
  experience: 3,
  work: 3,
} as const

/** Rows the panel shows: capped when collapsed, complete when expanded. */
export function homeItems<T extends HomeItem>(
  items: T[],
  slots: number,
  expanded: boolean,
): T[] {
  const visible = items.filter(isOnHome)
  return expanded ? visible : visible.slice(0, slots)
}

/** Rows left out. Zero means the panel needs no expand control at all. */
export function hiddenItemCount(items: HomeItem[], slots: number): number {
  return Math.max(0, items.filter(isOnHome).length - slots)
}
