//? Content / i18n
import { cvKey, cvSections } from "../content/cv"
import { profile } from "../content/profile"
import type { Locale } from "../i18n"

/** Shape of the `cv.doc` branch of the locale files. */
export type CvEmphasis = { lead: string; text: string }
export type CvSkillPart = { label: string; text: string }
export type CvEducationEntry = { period: string; title: string; suffix: string }

export type CvRoleEntry = {
  lead: string
  period: string
  title: string
  suffix: string
  bullets: Record<string, CvEmphasis>
}

export type CvDoc = {
  email: string
  workTitle: string
  educationTitle: string
  skillsTitle: string
  languagesLabel: string
  languages: string
  footnote: string
  /** Role wording used in the file name, keyed by preset id plus `full`. */
  fileTitles: Record<string, string>
  summary: Record<string, CvEmphasis>
  roles: Record<string, CvRoleEntry>
  education: Record<string, CvEducationEntry>
  skills: Record<string, { parts: CvSkillPart[] }>
}

/** Exactly the placeholders the .docx template exposes. */
export type CvTemplateData = {
  name: string
  phone: string
  email: string
  hasSummary: boolean
  summary: CvEmphasis[]
  hasRoles: boolean
  workTitle: string
  roles: Array<Omit<CvRoleEntry, "bullets"> & { bullets: CvEmphasis[] }>
  hasEducation: boolean
  educationTitle: string
  education: CvEducationEntry[]
  hasSkills: boolean
  skillsTitle: string
  skills: Array<{ parts: CvSkillPart[] }>
  languagesLabel: string
  languages: string
  footnote: string
}

const visible = <T extends { hidden?: boolean }>(item: T) =>
  item.hidden !== true

export function buildCvData(
  doc: CvDoc,
  selection: ReadonlySet<string>,
  phone: string,
): CvTemplateData {
  const summary = cvSections.summary
    .filter(visible)
    .filter((item) => selection.has(cvKey("summary", item.id)))
    .map((item) => doc.summary[item.id])
    .filter(Boolean)

  const roles = cvSections.roles
    .filter(visible)
    .filter((role) => selection.has(cvKey("role", role.id)))
    .map((role) => {
      const entry = doc.roles[role.id]
      const bullets = role.bullets
        .filter(visible)
        .filter((bullet) => selection.has(cvKey("bullet", role.id, bullet.id)))
        .map((bullet) => entry?.bullets[bullet.id])
        .filter(Boolean)
      return { ...entry, bullets }
    })
    // A role header with no bullet left under it reads as an empty section.
    .filter((role) => role.bullets.length > 0)

  const education = cvSections.education
    .filter(visible)
    .filter((item) => selection.has(cvKey("education", item.id)))
    .map((item) => doc.education[item.id])
    .filter(Boolean)

  const skills = cvSections.skills
    .filter(visible)
    .filter((item) => selection.has(cvKey("skills", item.id)))
    .map((item) => doc.skills[item.id])
    .filter(Boolean)

  return {
    name: profile.name,
    // The separator travels with the phone so an empty value leaves no
    // dangling pipe in the contact line.
    phone: phone.trim() ? `${phone.trim()} | ` : "",
    email: doc.email,
    hasSummary: summary.length > 0,
    summary,
    hasRoles: roles.length > 0,
    workTitle: doc.workTitle,
    roles,
    hasEducation: education.length > 0,
    educationTitle: doc.educationTitle,
    education,
    hasSkills: skills.length > 0,
    skillsTitle: doc.skillsTitle,
    skills,
    languagesLabel: doc.languagesLabel,
    languages: doc.languages,
    footnote: doc.footnote,
  }
}

// --- File name -------------------------------------------------------------

/** Same shape as the reference documents: `Sidney Sebban 2026 - IT Specialist`. */
export function cvFileName(roleTitle: string): string {
  return `${profile.name} ${new Date().getFullYear()} - ${roleTitle}`
}

/**
 * Windows rejects these characters outright, and a download named with one is
 * silently dropped by the browser rather than reported.
 */
export function sanitizeFileName(value: string): string {
  return value
    .replace(/\.docx$/i, "")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

// --- Page budget -----------------------------------------------------------
// Word paginates the document, not us, so the fill ratio below is an estimate.
// It exists to warn before a selection grows past one page. Its constants come
// from measuring the reference CV's own PDF, where the full selection takes
// 823.8pt of the 830pt available and the builder reports 99%.

/** A4 height minus the template's top and bottom margins, in points. */
const USABLE_HEIGHT_PT = (16840 - 142 - 99) / 20
/** Page width minus left and right margins, in points. */
const TEXT_WIDTH_PT = (11900 - 306 - 254) / 20
/** `w:line="300" w:lineRule="auto"` on every content paragraph. */
const LINE_SPACING = 300 / 240
/** Arial's line box relative to its point size. */
const LINE_BOX = 1.15
/**
 * Mean Arial advance per character, fitted per language against Word's own
 * pagination of the full CV. It absorbs more than glyph width: French sits
 * lower not because its letters are narrower but because its longer words
 * leave more slack at the end of each line than a character count implies.
 */
const GLYPH_WIDTH: Record<Locale, number> = {
  en: 0.45,
  fr: 0.43,
  he: 0.45,
}

const lineHeight = (sizePt: number) => sizePt * LINE_BOX * LINE_SPACING

/** Empty paragraph separating two sections; it carries a 4pt run. */
const SPACER_PT = lineHeight(4)
/** Top spacer, the name line, and the decorative rule under it. */
const MASTHEAD_PT = lineHeight(5.5) + lineHeight(16) + lineHeight(18)
/** Section headings run one point larger than the body. */
const HEADING_PT = 11
const BODY_PT = 10.5
/** Indents, in twips, taken from the template's own paragraph properties. */
const SUMMARY_INDENT = 284
const BULLET_INDENT = 720

/** Fraction of the page the selection is expected to take, 1 being full. */
export function estimateCvFill(data: CvTemplateData, locale: Locale): number {
  const glyph = GLYPH_WIDTH[locale]

  function height(text: string, sizePt: number, indentTwips = 0): number {
    const width = TEXT_WIDTH_PT - indentTwips / 20
    const perLine = Math.max(1, Math.floor(width / (sizePt * glyph)))
    const lines = Math.max(1, Math.ceil(text.length / perLine))
    return lines * lineHeight(sizePt)
  }

  let total = MASTHEAD_PT

  if (data.hasSummary) {
    for (const line of data.summary) {
      total += height(line.lead + line.text, BODY_PT, SUMMARY_INDENT)
    }
    total += SPACER_PT
  }

  if (data.hasRoles) {
    total += lineHeight(HEADING_PT)
    for (const role of data.roles) {
      total += height(
        role.lead + role.period + role.title + role.suffix,
        BODY_PT,
      )
      for (const bullet of role.bullets) {
        total += height(bullet.lead + bullet.text, BODY_PT, BULLET_INDENT)
      }
      total += SPACER_PT
    }
  }

  if (data.hasEducation) {
    total += lineHeight(HEADING_PT)
    for (const line of data.education) {
      total += height(line.period + line.title + line.suffix, BODY_PT)
    }
    total += SPACER_PT
  }

  if (data.hasSkills) {
    total += lineHeight(HEADING_PT)
    for (const line of data.skills) {
      const text = line.parts.map((part) => part.label + part.text).join("")
      total += height(text, BODY_PT, BULLET_INDENT)
    }
    total += SPACER_PT
  }

  total += height(`${data.languagesLabel}: ${data.languages}`, BODY_PT)
  total += SPACER_PT
  total += height(data.footnote, BODY_PT)

  return total / USABLE_HEIGHT_PT
}
