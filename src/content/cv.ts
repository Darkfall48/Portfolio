import type { ContentId } from "./types"

/**
 * Structure of the generated CV. Every entry here is a line the builder can
 * keep or drop; the wording itself lives under `cv.doc` in the locale files.
 * Order in these lists is the order in the document.
 */
export type CvItem = {
  id: ContentId
  /** Kept out of the builder entirely, without deleting the locale copy. */
  hidden?: boolean
}

export type CvRole = CvItem & {
  bullets: CvItem[]
}

export type CvSections = {
  summary: CvItem[]
  roles: CvRole[]
  education: CvItem[]
  skills: CvItem[]
}

export const cvSections: CvSections = {
  summary: [
    { id: "profile" },
    { id: "track-record" },
    { id: "automation" },
    { id: "communication" },
  ],
  roles: [
    {
      id: "cyolo",
      bullets: [
        { id: "support" },
        { id: "escalations" },
        { id: "docker" },
        { id: "jira" },
        { id: "knowledge-base" },
        { id: "zendesk" },
        { id: "automation" },
        { id: "cloud" },
        { id: "saas" },
        { id: "infrastructure" },
        { id: "back-office" },
        { id: "helpdesk" },
      ],
    },
    {
      id: "idf",
      bullets: [{ id: "support" }, { id: "video" }, { id: "cabling" }],
    },
  ],
  education: [
    { id: "coding-academy" },
    { id: "polytechnique" },
    { id: "network-cert" },
  ],
  skills: [
    { id: "engineering" },
    { id: "platforms" },
    { id: "security" },
    { id: "ops" },
  ],
}

/** Stable key for one selectable line, used by the builder's checkbox state. */
export function cvKey(section: string, ...ids: ContentId[]): string {
  return [section, ...ids].join(":")
}

/**
 * A targeted angle, expressed as the lines the full document drops. The page is
 * already full at 99%, so an angle earns room by leaving things out rather than
 * by adding anything. Tune these lists per application: it is a data change.
 */
export type CvPreset = {
  id: ContentId
  hidden?: boolean
  drop: string[]
}

export const cvPresets: CvPreset[] = [
  {
    // Escalations, reproduction, and the knowledge base carry this one; the
    // internal estate work is background noise for a support panel.
    id: "support",
    drop: [
      cvKey("bullet", "cyolo", "cloud"),
      cvKey("bullet", "cyolo", "saas"),
      cvKey("bullet", "cyolo", "infrastructure"),
      cvKey("bullet", "cyolo", "back-office"),
    ],
  },
  {
    // Identity, estate, and compliance lead; the ticket-desk routine does not.
    id: "it",
    drop: [
      cvKey("bullet", "cyolo", "jira"),
      cvKey("bullet", "cyolo", "knowledge-base"),
      cvKey("bullet", "cyolo", "zendesk"),
      cvKey("bullet", "cyolo", "helpdesk"),
    ],
  },
  {
    // What was shipped and operated, not what was answered. The military
    // media and cabling lines say nothing to an engineering panel.
    id: "fullstack",
    drop: [
      cvKey("bullet", "cyolo", "support"),
      cvKey("bullet", "cyolo", "jira"),
      cvKey("bullet", "cyolo", "knowledge-base"),
      cvKey("bullet", "cyolo", "zendesk"),
      cvKey("bullet", "cyolo", "saas"),
      cvKey("bullet", "cyolo", "infrastructure"),
      cvKey("bullet", "idf", "video"),
      cvKey("bullet", "idf", "cabling"),
    ],
  },
]

const visible = (item: CvItem) => item.hidden !== true

/** Everything visible, which reproduces the reference CV as it stands. */
export function cvFullSelection(): Set<string> {
  const keys = new Set<string>()

  for (const item of cvSections.summary.filter(visible)) {
    keys.add(cvKey("summary", item.id))
  }
  for (const role of cvSections.roles.filter(visible)) {
    keys.add(cvKey("role", role.id))
    for (const bullet of role.bullets.filter(visible)) {
      keys.add(cvKey("bullet", role.id, bullet.id))
    }
  }
  for (const item of cvSections.education.filter(visible)) {
    keys.add(cvKey("education", item.id))
  }
  for (const item of cvSections.skills.filter(visible)) {
    keys.add(cvKey("skills", item.id))
  }

  return keys
}

/** The full document minus whatever the angle leaves out. */
export function cvPresetSelection(preset: CvPreset): Set<string> {
  const keys = cvFullSelection()
  for (const key of preset.drop) keys.delete(key)
  return keys
}

export function isSameSelection(
  a: ReadonlySet<string>,
  b: ReadonlySet<string>,
): boolean {
  if (a.size !== b.size) return false
  for (const key of a) if (!b.has(key)) return false
  return true
}
