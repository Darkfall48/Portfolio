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
import {
  ambiguousTerms,
  bonusHeadings,
  skillChips,
  unclaimedSkills,
} from "../content/skills"
import type { ContentId } from "../content/types"
import type { Locale } from "../i18n"

//? Services
import { buildCvData, estimateCvFill } from "./cvDocument"
import type { CvDoc } from "./cvDocument"

/** A term the offer uses, and whether it uses it as a requirement. */
export type Demand<T> = {
  value: T
  required: boolean
}

export type JobMatch = {
  /** Inventory ids the offer names, in inventory order. */
  found: Demand<ContentId>[]
  /** Weight per selectable key. Keys the offer says nothing about are absent. */
  scores: Map<string, number>
  /** What earned each key its weight, for the panel to show on demand. */
  evidence: Map<string, ContentId[]>
  /** The job titles the offer uses, per angle. */
  roles: Map<ContentId, string[]>
  /** Technology the offer asks for that the CV does not claim. */
  gaps: Demand<string>[]
}

const EMPTY: JobMatch = {
  found: [],
  scores: new Map(),
  evidence: new Map(),
  roles: new Map(),
  gaps: [],
}

/** Leave the page a little air rather than filling it to the last point. */
const TARGET_FILL = 0.97

/** What the ad insists on counts double against what it merely hopes for. */
const REQUIRED_WEIGHT = 2
const BONUS_WEIGHT = 1

const escape = (term: string) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const ambiguous = new Set(ambiguousTerms.map((term) => term.toLowerCase()))

/**
 * An ad written in capitals defeats the case rule, and loses React, Node and
 * every other ambiguous term at once. Rare, but total, so it is worth the two
 * lines: if the Latin text is essentially uppercase, nothing can be learned
 * from case and the rule is dropped for that ad.
 */
function isShouted(text: string): boolean {
  const lower = text.match(/[a-z]/g)?.length ?? 0
  const upper = text.match(/[A-Z]/g)?.length ?? 0
  return upper > 0 && lower / (lower + upper) < 0.15
}

/**
 * Whole word, tolerant of a plural and of however the ad wrapped its lines.
 * Word boundaries are no use here: half of this vocabulary ends in punctuation
 * (`C#`, `Node.js`, `SSL/TLS`), so the edges are checked against alphanumerics
 * instead. Spelled out rather than as a lookbehind, which older Safari throws
 * on, and a throw here would take the whole panel down on the first keystroke.
 */
function mentions(text: string, term: string, shouted = false): boolean {
  const plural = /[a-z0-9]$/i.test(term) ? "s?" : ""
  // An ad that wrapped "Docker Compose" over two lines still means Compose,
  // and "full stack" is "full-stack" is "full-\nstack".
  const body = escape(term).replace(/[\s-]+/g, "[\\s-]+")
  const exact = !shouted && ambiguous.has(term.toLowerCase())
  const flags = exact ? "" : "i"
  const edge = exact ? "[^a-zA-Z0-9]" : "[^a-z0-9]"
  const pattern = new RegExp(`(^|${edge})${body}${plural}(${edge}|$)`, flags)
  return pattern.test(text)
}

/**
 * Rejoins lines an ad only broke to fit its column, so a sentence can be read
 * as one. Without this, "Terraform and Ansible experience\nwelcome" splits
 * between the tools and the word that demotes them, and a wish is filed as a
 * requirement. A break is real, not cosmetic, when the line before it closed
 * with punctuation, when the line after it opens a bullet, or when it is a
 * blank line — everything else is the ad's word wrap.
 */
function unwrap(text: string): string {
  return text.replace(/([^.!?:\n])\n(?!\s*(?:[-•*]|\d+[.)])|\n)/g, "$1 ")
}

/**
 * Splits an ad into what it demands and what it would merely like. The colon
 * is what tells the two shapes apart. "Nice to have:" opens a list, and
 * everything under it is a wish; "Kubernetes exposure a plus" is an aside
 * inside a sentence, and only that sentence is a wish. Reading an aside as a
 * heading would quietly demote whatever the ad mentioned after it — plenty of
 * ads close a paragraph with "a plus" and then carry on with requirements.
 *
 * A list ends where the ad starts another one, so the region runs to the next
 * short "Something:" opener, to a blank line, or to the end. Without that, one
 * "Nice to have:" would swallow the "Networking basics:" behind it.
 */
function splitDemands(source: string): { required: string; bonus: string } {
  const text = unwrap(source)
  const alternatives = bonusHeadings
    .map((heading) => escape(heading).replace(/[\s-]+/g, "[\\s-]+"))
    .join("|")

  const opener = new RegExp(`(?:^|[\\s\\-•*])(?:${alternatives})\\s*:`, "i")
  const at = text.search(opener)
  if (at >= 0) {
    const rest = text.slice(at)
    const ends = rest.slice(1).search(/\n\s*\n|[.\n][^:\n]{1,24}:/)
    const to = ends >= 0 ? at + 1 + ends + 1 : text.length
    return {
      required: text.slice(0, at) + text.slice(to),
      bonus: text.slice(at, to),
    }
  }

  const aside = new RegExp(`(?:${alternatives})`, "i")
  const required: string[] = []
  const bonus: string[] = []
  // Sentences, delimiter kept, and no lookbehind for the same reason as above.
  for (const sentence of text.match(/[^.!?\n]*(?:[.!?\n]|$)/g) ?? []) {
    if (sentence === "") continue
    ;(aside.test(sentence) ? bonus : required).push(sentence)
  }
  return { required: required.join(""), bonus: bonus.join("") }
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

  const shouted = isShouted(text)
  const { required, bonus } = splitDemands(text)
  /** Where the ad names a term, if it names it at all. */
  const demandFor = (terms: (string | undefined)[]) => {
    if (terms.some((term) => term && mentions(required, term, shouted))) {
      return true
    }
    if (terms.some((term) => term && mentions(bonus, term, shouted))) {
      return false
    }
    return undefined
  }

  const found: Demand<ContentId>[] = []
  const weights = new Map<ContentId, number>()
  for (const chip of skillChips) {
    const asked = demandFor([chip.label, chip.cvLabel, ...(chip.aliases ?? [])])
    if (asked === undefined) continue
    found.push({ value: chip.id, required: asked })
    weights.set(chip.id, asked ? REQUIRED_WEIGHT : BONUS_WEIGHT)
  }

  const scores = new Map<string, number>()
  const evidence = new Map<string, ContentId[]>()
  const score = (key: string, tags: ContentId[] = []) => {
    const matched = tags.filter((id) => weights.has(id))
    if (matched.length === 0) return
    let weight = 0
    for (const id of matched) weight += weights.get(id) ?? 0
    scores.set(key, weight)
    evidence.set(key, matched)
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
  // A tool speaks for itself, so naming it is worth exactly its own weight.
  for (const line of cvSections.skills) {
    for (const id of cvSkillChips(line)) {
      const weight = weights.get(id)
      if (weight === undefined) continue
      scores.set(cvKey("skill", id), weight)
      evidence.set(cvKey("skill", id), [id])
    }
  }

  const roles = new Map<ContentId, string[]>()
  for (const preset of cvPresets) {
    const titles = preset.roleTerms.filter((term) =>
      mentions(text, term, shouted),
    )
    if (titles.length > 0) roles.set(preset.id, titles)
  }

  const gaps: Demand<string>[] = []
  for (const term of unclaimedSkills) {
    const asked = demandFor([term])
    if (asked !== undefined) gaps.push({ value: term, required: asked })
  }
  // What the ad insists on and the CV cannot answer is read first.
  gaps.sort((a, b) => Number(b.required) - Number(a.required))

  return { found, scores, evidence, roles, gaps }
}

export type Tailored = {
  keys: Set<string>
  /** The angle the offer landed on, so the download can be named after it. */
  angle: ContentId
  /** The job titles that put it there, or none if the tools decided. */
  because: string[]
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
  if (total === 0) {
    return { keys: cvFullSelection(), angle: "full", because: [] }
  }

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
    const title = match.roles.get(candidate.id)?.length ?? 0
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

  return { keys, angle: best.id, because: match.roles.get(best.id) ?? [] }
}
