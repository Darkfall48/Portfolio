import type { WorkItem } from "./types"
import { FILLER_ON, fillerWork } from "./_filler"

export const work: WorkItem[] = [
  {
    id: "ops-platform",
    featured: true,
  },
  {
    id: "helpdesk",
    featured: true,
  },
  {
    id: "identity",
    featured: true,
  },
  // Load-test rows, empty unless FILLER_ON is flipped in _filler.ts.
  ...(FILLER_ON ? fillerWork() : []),
]
