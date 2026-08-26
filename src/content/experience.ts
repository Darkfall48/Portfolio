import type { ExperienceItem } from "./types"
import { FILLER_ON, fillerExperience } from "./_filler"

export const experience: ExperienceItem[] = [
  {
    id: "current-role",
    start: "2023",
    end: "present",
    featured: true,
  },
  {
    id: "robotika",
    start: "2023",
    end: "2023",
    featured: true,
  },
  {
    id: "idf",
    start: "2018",
    end: "2021",
    featured: true,
  },
  // Load-test rows, empty unless FILLER_ON is flipped in _filler.ts.
  ...(FILLER_ON ? fillerExperience() : []),
]

/** A stint inside one year reads as that year, not as a range of one. */
export function experienceRange(start: string, endLabel: string): string {
  return start === endLabel ? start : `${start}–${endLabel}`
}
