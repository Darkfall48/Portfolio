//? Content / i18n
import {
  cvFullSelection,
  cvKey,
  cvOrderedKeys,
  cvPresetSelection,
  cvPresets,
  cvSections,
  cvSkillChips,
  cvSyncRoleHeaders,
} from "../content/cv"
import { ambiguousTerms, skillChips, unclaimedSkills } from "../content/skills"
import type { ContentId } from "../content/types"
import type { Locale } from "../i18n"

//? Services
import { buildCvData, estimateCvFill } from "./cvDocument"
import type { CvDoc } from "./cvDocument"

export type JobMatch = {
  /** Inventory ids the offer names, in inventory order. */
  found: ContentId[]
  /** Hits per selectable key. Keys the offer says nothing about are absent. */
  scores: Map<string, number>
  /** How many of each angle's job titles the offer uses. */
  roles: Map<ContentId, number>
  /** Technology the offer asks for that the CV does not claim. */
  gaps: string[]
}

const EMPTY: JobMatch = {
  found: [],
  scores: new Map(),
  roles: new Map(),
  gaps: [],
}

/** Leave the page a little air rather than filling it to the last point. */
const TARGET_FILL = 0.97

const escape = (term: string) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const ambiguous = new Set(ambiguousTerms.map((term) => term.toLowerCase()))

/**
 * Whole word, tolerant of a plural and of however the ad wrapped its lines.
 * Word boundaries are no use here: half of this vocabulary ends in punctuation
 * (`C#`, `Node.js`, `SSL/TLS`), so the edges are checked against alphanumerics
 * instead. Spelled out rather than as a lookbehind, which older Safari throws
 * on, and a throw here would take the whole panel down on the first keystroke.
 */
function mentions(text: string, term: string): boolean {
  const plural = /[a-z0-9]$/i.test(term) ? "s?" : ""
  // An ad that wrapped "Docker Compose" over two lines still means Compose,
  // and "full stack" is "full-stack" is "full-\nstack".
  const body = escape(term).replace(/[\s-]+/g, "[\\s-]+")
  const flags = ambiguous.has(term.toLowerCase()) ? "" : "i"
  const edge = flags === "i" ? "[^a-z0-9]" : "[^a-zA-Z0-9]"
  const pattern = new RegExp(`(^|${edge})${body}${plural}(${edge}|$)`, flags)
  return pattern.test(text)
}

/**
 * Scores the CV against a pasted job ad. Everything runs in the browser
 * against the shared inventory: no model, no network, and a result the panel
 * can show term by term, which matters because a short name like `React` or
 * `Express` does turn up in prose that has nothing to do with the tool.
 */
export function matchOffer(offer: string): JobMatch {
  const text = offer.trim()
  if (!text) return EMPTY

  const found: ContentId[] = []
  const hit = new Set<ContentId>()
  for (const chip of skillChips) {
    const terms = [chip.label, chip.cvLabel, ...(chip.aliases ?? [])]
    if (terms.some((term) => term && mentions(text, term))) {
      hit.add(chip.id)
      found.push(chip.id)
    }
  }

  const scores = new Map<string, number>()
  const score = (key: string, tags: ContentId[] = []) => {
    const hits = tags.filter((id) => hit.has(id)).length
    if (hits > 0) scores.set(key, hits)
  }

  for (const item of cvSections.summary) {
    score(cvKey("summary", item.id), item.skills)
  }
  for (const role of cvSections.roles) {
    for (const bullet of role.bullets) {
      score(cvKey("bullet", role.id, bullet.id), bullet.skills)
    }
  }
  for (const item of cvSections.education) {
    score(cvKey("education", item.id), item.skills)
  }
  // A tool speaks for itself, so naming it is worth exactly one hit.
  for (const line of cvSections.skills) {
    for (const id of cvSkillChips(line)) {
      if (hit.has(id)) scores.set(cvKey("skill", id), 1)
    }
  }

  const roles = new Map<ContentId, number>()
  for (const preset of cvPresets) {
    const hits = preset.roleTerms.filter((term) => mentions(text, term))
    if (hits.length > 0) roles.set(preset.id, hits.length)
  }

  return {
    found,
    scores,
    roles,
    gaps: unclaimedSkills.filter((term) => mentions(text, term)),
  }
}

export type Tailored = {
  keys: Set<string>
  /** The angle the offer landed on, so the download can be named after it. */
  angle: ContentId
}

/**
 * Tailoring is not a packing problem. The full document already fits, so
 * filling the page to the budget would hand back the full document whatever
 * the ad said. What an angle really does is leave out what dilutes it, and
 * that judgement is already written down in `cvPresets`.
 *
 * So the offer picks the angle it likes best, then overrules it wherever it
 * asked for something the angle had dropped, and the page is trimmed from the
 * least relevant end if that pushes it over.
 */
export function tailorSelection(
  match: JobMatch,
  doc: CvDoc,
  locale: Locale,
  phone: string,
): Tailored {
  let total = 0
  for (const value of match.scores.values()) total += value
  if (total === 0) return { keys: cvFullSelection(), angle: "full" }

  const candidates = cvPresets
    .filter((preset) => preset.hidden !== true)
    .map((preset) => ({ id: preset.id, keys: cvPresetSelection(preset) }))

  // The job title decides, and the tools only break a tie. An ad states the
  // role it is hiring for in its first line, and that is what a recruiter
  // screens on; the tech is shared across angles anyway, so on tools alone
  // three angles routinely cover the same 84% of an ad and the choice falls
  // to whichever preset happens to be the leanest, which means nothing.
  //
  // The tie-break is coverage times density: coverage alone rewards the
  // roomiest angle for having room, density alone rewards the smallest.
  let best = candidates[0]
  let bestTitle = -1
  let bestFit = -1
  for (const candidate of candidates) {
    let sum = 0
    for (const key of candidate.keys) sum += match.scores.get(key) ?? 0
    const title = match.roles.get(candidate.id) ?? 0
    const fit = (sum / total) * (sum / candidate.keys.size)
    if (title > bestTitle || (title === bestTitle && fit > bestFit)) {
      bestTitle = title
      bestFit = fit
      best = candidate
    }
  }

  const keys = cvSyncRoleHeaders(new Set(best.keys))
  for (const key of match.scores.keys()) keys.add(key)
  cvSyncRoleHeaders(keys)

  const required = new Set(
    cvSections.summary
      .filter((item) => item.required)
      .map((item) => cvKey("summary", item.id)),
  )
  // Least relevant first, and from the end of the document among equals.
  const trimOrder = cvOrderedKeys()
    .filter((key) => keys.has(key) && !required.has(key))
    .reverse()
    .sort((a, b) => (match.scores.get(a) ?? 0) - (match.scores.get(b) ?? 0))

  const over = () =>
    estimateCvFill(buildCvData(doc, keys, phone), locale) > TARGET_FILL
  for (const key of trimOrder) {
    if (!over()) break
    keys.delete(key)
    cvSyncRoleHeaders(keys)
  }

  return { keys, angle: best.id }
}
