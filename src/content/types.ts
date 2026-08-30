export type ContentId = string

export type PanelKind = "experience" | "work"

/** Panels that can trade the collapsed view for the full list. */
export type ExpandablePanel = "experience" | "work" | "skills"

export type PanelTarget = {
  kind: PanelKind
  id: ContentId
}

export type ExperienceItem = {
  id: ContentId
  start: string
  end: string
  featured?: boolean
  hidden?: boolean
}

export type WorkItem = {
  id: ContentId
  featured?: boolean
  hidden?: boolean
  /** Public repository for the project. Omit for employer-only work. */
  url?: string
}

export type SkillChip = {
  id: ContentId
  /** Canonical name, and what the home panel shows. */
  label: string
  /** Spelled out for the CV, which an applicant tracking system reads. */
  cvLabel?: string
  /** A common noun rather than a product name, so the CV translates it. */
  translated?: boolean
  /** Other ways a job offer writes this, matched on top of the labels. */
  aliases?: string[]
}

/** An arrangement of the inventory, not an owner: groups hold chip ids. */
export type SkillGroup = {
  id: ContentId
  chips: ContentId[]
  featured?: boolean
  hidden?: boolean
}

export type ProfileLinks = {
  email: string
  linkedin: string
  github: string
}

export type Profile = {
  name: string
  headlineKey: string
  locationKey: string
  kickerKey: string
  educationKey: string
  /** Emergency-service volunteering. Leave empty to drop the row. */
  volunteeringKey?: string
  timezoneCode: string
  languages: string[]
  links: ProfileLinks
  /** Public CV path under /public. Leave empty to hide the download control. */
  cvPath?: string
  /** Public portrait path under /public. Leave empty to hide the photo. */
  photoPath?: string
  /** Shows the availability ribbon. Set to false once a role is signed. */
  openToWork?: boolean
}

export type HomeItem = {
  featured?: boolean
  hidden?: boolean
}

export function isOnHome(item: HomeItem): boolean {
  return item.featured === true && item.hidden !== true
}
