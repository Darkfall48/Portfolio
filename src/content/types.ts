export type ContentId = string

export type PanelKind = "experience" | "work"

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
}

export type SkillChip = {
  id: ContentId
  label: string
}

export type SkillGroup = {
  id: ContentId
  chips: SkillChip[]
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
  timezoneCode: string
  languages: string[]
  links: ProfileLinks
  /** Public CV path under /public. Leave empty to hide the download control. */
  cvPath?: string
}

export type HomeItem = {
  featured?: boolean
  hidden?: boolean
}

export function isOnHome(item: HomeItem): boolean {
  return item.featured === true && item.hidden !== true
}
