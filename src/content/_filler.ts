// Load-test fixture, off by default. Flip FILLER_ON to true to flood the home
// panels with generated rows and see how the layout, the expand controls, and
// the three locales hold up once the real content grows.
//
// Nothing is generated or shipped while the flag is false: every export is a
// function, so the call sites collapse to a static empty spread and the bundler
// drops this module from the build.

import type { ExperienceItem, SkillChip, WorkItem } from "./types"
import type { Locale } from "../i18n"

export const FILLER_ON = false

const COUNT = 18

/** Prefixed so a generated id can never collide with a real content id. */
function ids(): string[] {
  return Array.from(
    { length: COUNT },
    (_, index) => `zz-${String(index + 1).padStart(2, "0")}`,
  )
}

export function fillerExperience(): ExperienceItem[] {
  return ids().map((id, index) => ({
    id,
    start: String(2005 + index),
    end: String(2006 + index),
    featured: true,
  }))
}

export function fillerWork(): WorkItem[] {
  return ids().map((id) => ({ id, featured: true }))
}

/** Seven per group, to push the Focus panel past its natural height. */
export function fillerChips(group: string): SkillChip[] {
  return Array.from({ length: 7 }, (_, index) => ({
    id: `zz-${group}-${index + 1}`,
    label: `Filler ${index + 1}`,
  }))
}

const copy = {
  en: {
    org: "Filler org",
    role: "Filler role title",
    project: "Filler project",
    summary: "Filler summary line, roughly the length of a real one.",
    bullet: "Filler detail bullet for the panel body.",
  },
  fr: {
    org: "Organisation de test",
    role: "Intitulé de poste de test",
    project: "Projet de test",
    summary: "Ligne de résumé de test, à peu près de la longueur d'une vraie.",
    bullet: "Point de détail de test pour le corps du panneau.",
  },
  he: {
    org: "ארגון לבדיקה",
    role: "תפקיד לבדיקה",
    project: "פרויקט לבדיקה",
    summary: "שורת תקציר לבדיקה, באורך דומה לשורה אמיתית.",
    bullet: "פרט לבדיקה עבור גוף הפאנל.",
  },
} as const

/** Generated translations for one locale, shaped like the real bundles. */
export function fillerLocales(locale: Locale) {
  const text = copy[locale]
  const generated = ids()

  return {
    experience: Object.fromEntries(
      generated.map((id, index) => [
        id,
        {
          org: `${text.org} ${index + 1}`,
          title: text.role,
          summary: text.summary,
          body: [text.bullet],
        },
      ]),
    ),
    work: Object.fromEntries(
      generated.map((id, index) => [
        id,
        {
          title: `${text.project} ${index + 1}`,
          summary: text.summary,
          body: [text.bullet],
        },
      ]),
    ),
  }
}
