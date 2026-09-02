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
  /**
   * Inventory ids this line is evidence for. A tag is a claim the line can
   * back in an interview, not a keyword sprinkled on it, and it is what a job
   * offer is scored against. Tags may name a tool the skills section never
   * prints, since demonstrating something and listing it are not the same.
   */
  skills?: ContentId[]
  /** Ships whatever the angle is. Tailoring seeds the page with these. */
  required?: boolean
}

export type CvRole = CvItem & {
  bullets: CvItem[]
}

/**
 * One bold lead-in and the tool runs that follow it. A run is what the document
 * separates with a semicolon, so `[[a, b], [c]]` reads `a, b; c`. The chips are
 * ids into the shared inventory in `skills.ts`.
 */
export type CvSkillGroup = {
  id: ContentId
  runs: ContentId[][]
}

/** One paragraph of the skills section. */
export type CvSkillLine = CvItem & {
  groups: CvSkillGroup[]
}

export type CvSections = {
  summary: CvItem[]
  roles: CvRole[]
  education: CvItem[]
  skills: CvSkillLine[]
}

export const cvSections: CvSections = {
  summary: [
    // The opening line is who he is, not an angle; no offer buys it out.
    { id: "profile", skills: ["ztna"], required: true },
    { id: "track-record", skills: ["saas-platforms"] },
    {
      id: "automation",
      skills: [
        "powershell",
        "python",
        "bash",
        "shell",
        "windows",
        "macos",
        "linux",
      ],
    },
    // Nothing to tag: no offer screens for this on a tool name.
    { id: "communication" },
  ],
  roles: [
    {
      id: "cyolo",
      bullets: [
        { id: "support", skills: ["saas-platforms"] },
        {
          id: "escalations",
          skills: [
            "sso",
            "scim",
            "ldap",
            "tls",
            "san",
            "rdp",
            "vnc",
            "telnet",
            "linux",
            "windows",
            "macos",
          ],
        },
        { id: "docker", skills: ["docker", "compose"] },
        { id: "jira", skills: ["jira"] },
        { id: "knowledge-base", skills: ["confluence", "zendesk"] },
        { id: "zendesk", skills: ["zendesk"] },
        { id: "automation", skills: ["powershell", "python", "shell"] },
        { id: "cloud", skills: ["esxi", "proxmox", "aws"] },
        { id: "saas", skills: ["saas-platforms", "sso", "scim"] },
        {
          id: "infrastructure",
          skills: ["azuread", "entra", "m365", "exchange", "soc2"],
        },
        // The wording names no stack, but this is what building it took.
        { id: "back-office", skills: ["react", "node", "mongodb", "rest", "json", "webhooks"] },
        {
          id: "helpdesk",
          skills: [
            "react",
            "redux",
            "node",
            "docker",
            "pwa",
            "rbac",
            "rest",
            "json",
            "webhooks",
            "scim",
          ],
        },
      ],
    },
    {
      id: "robotika",
      bullets: [
        { id: "rfid", skills: ["python"] },
        { id: "automation", skills: ["python", "excel"] },
      ],
    },
    {
      id: "idf",
      bullets: [
        { id: "support" },
        // Off-target for the roles this CV is sent to; the copy stays in locales.
        { id: "video", skills: ["adobe"], hidden: true },
        { id: "cabling" },
      ],
    },
  ],
  education: [
    {
      id: "coding-academy",
      skills: ["javascript", "react", "node", "mongodb"],
    },
    { id: "polytechnique" },
    { id: "network-cert" },
  ],
  skills: [
    {
      id: "engineering",
      groups: [
        {
          id: "engineering",
          runs: [
            [
              "javascript",
              "python",
              "csharp",
              "php",
              "matlab",
              "bash",
              "powershell",
              "shell",
            ],
            [
              "react",
              "vue",
              "angular",
              "html",
              "scss",
              "responsive-design",
              "redux",
            ],
            ["node", "express", "rest", "json", "webhooks"],
            ["mongodb", "mysql", "sql-server"],
          ],
        },
        { id: "database-tools", runs: [["phpmyadmin", "studio-3t"]] },
        { id: "dev-tools", runs: [["vscode", "postman"]] },
        { id: "web", runs: [["saas-platforms", "pwa"]] },
        { id: "principles", runs: [["oop-reactive"]] },
      ],
    },
    {
      id: "platforms",
      groups: [
        {
          id: "platforms",
          runs: [
            ["docker", "compose", "git", "github"],
            ["linux", "windows", "winserver", "macos"],
            ["aws"],
          ],
        },
        { id: "cloud", runs: [["esxi", "proxmox"], ["multi-os-vms"]] },
      ],
    },
    {
      id: "security",
      groups: [
        {
          id: "security",
          runs: [
            [
              "azuread",
              "entra",
              "okta",
              "active-directory",
              "gpo",
              "ldap",
              "sso",
              "scim",
              "saml",
              "oidc",
              "rbac",
              "xdr",
            ],
            ["icap", "dns-records", "firewalls", "proxies", "fortinet"],
            ["ssl-san-certs", "jwt"],
          ],
        },
      ],
    },
    {
      id: "ops",
      groups: [
        {
          id: "ops",
          runs: [
            ["grafana", "prometheus", "betterstack"],
            ["zendesk", "jira", "confluence"],
            ["ssh", "scp", "rdp", "vnc", "telnet", "putty", "anydesk"],
            ["intune"],
            [
              "m365-word",
              "excel",
              "powerpoint",
              "outlook",
              "exchange",
              "onedrive",
              "sharepoint",
              "visio",
            ],
            [
              "timeclock365",
              "gong",
              "salesforce",
              "mesh",
              "salesloft",
              "travelperk",
              "hibob",
            ],
            ["figma", "adobe", "avocode", "lunacy"],
            ["zoom", "slack", "teams"],
          ],
        },
      ],
    },
  ],
}

/** Stable key for one selectable line, used by the builder's checkbox state. */
export function cvKey(section: string, ...ids: ContentId[]): string {
  return [section, ...ids].join(":")
}

/** Every chip a skills line can print, in document order. */
export function cvSkillChips(line: CvSkillLine): ContentId[] {
  return line.groups.flatMap((group) => group.runs.flat())
}

/**
 * A role header says nothing without a bullet under it, and the generator
 * drops such a role anyway. So the header follows its bullets instead of
 * living its own life. Every selection passes through here, which is what lets
 * the panel and the offer matcher agree without either knowing about the other.
 */
export function cvSyncRoleHeaders(keys: Set<string>): Set<string> {
  for (const role of cvSections.roles) {
    const hasBullet = role.bullets.some((bullet) =>
      keys.has(cvKey("bullet", role.id, bullet.id)),
    )
    if (hasBullet) keys.add(cvKey("role", role.id))
    else keys.delete(cvKey("role", role.id))
  }
  return keys
}

/** Every selectable key, in the order the document prints them. */
export function cvOrderedKeys(): string[] {
  const keys: string[] = []
  for (const item of cvSections.summary.filter(visible)) {
    keys.push(cvKey("summary", item.id))
  }
  for (const role of cvSections.roles.filter(visible)) {
    for (const bullet of role.bullets.filter(visible)) {
      keys.push(cvKey("bullet", role.id, bullet.id))
    }
  }
  for (const item of cvSections.education.filter(visible)) {
    keys.push(cvKey("education", item.id))
  }
  for (const line of cvSections.skills.filter(visible)) {
    for (const id of cvSkillChips(line)) keys.push(cvKey("skill", id))
  }
  return keys
}

/**
 * A targeted angle, expressed as the lines the full document drops. The page is
 * already full at 99%, so an angle earns room by leaving things out rather than
 * by adding anything. Tune these lists per application: it is a data change.
 */
export type CvPreset = {
  id: ContentId
  hidden?: boolean
  /** Lines the full document leaves out. */
  drop: string[]
  /** Tools the angle leaves out, by inventory id. */
  dropSkills?: ContentId[]
  /**
   * How an ad names this job. Every language at once, because the ad's
   * language has nothing to do with the one the site is being read in. Only
   * multi-word titles: a bare "support" is in every ad ever written.
   */
  roleTerms: string[]
}

export const cvPresets: CvPreset[] = [
  {
    // Escalations, reproduction, and the knowledge base carry this one; the
    // internal estate work is background noise for a support panel.
    id: "support",
    roleTerms: [
      "support engineer",
      "technical support",
      "customer support",
      "customer success engineer",
      "service desk",
      "help desk",
      "helpdesk",
      "escalation engineer",
      "solutions engineer",
      "ingénieur support",
      "support technique",
      "technicien support",
      "chargé de support",
      "מהנדס תמיכה",
      "תמיכה טכנית",
      "איש תמיכה",
    ],
    drop: [
      cvKey("bullet", "cyolo", "saas"),
      cvKey("bullet", "cyolo", "back-office"),
      cvKey("bullet", "robotika", "rfid"),
    ],
    // Hypervisors and databases stay: this vendor ships on-premise and in a
    // DMZ, so a Tier 3 desk troubleshoots them. What goes is the front-end
    // depth and the design and business tooling, which no support panel reads.
    dropSkills: [
      "csharp",
      "php",
      "matlab",
      "vue",
      "angular",
      "html",
      "scss",
      "responsive-design",
      "redux",
      "phpmyadmin",
      "studio-3t",
      "saas-platforms",
      "pwa",
      "oop-reactive",
      "timeclock365",
      "gong",
      "salesforce",
      "salesloft",
      "travelperk",
      "hibob",
      "figma",
      "adobe",
      "avocode",
      "lunacy",
    ],
  },
  {
    // Identity, estate, and compliance lead; the ticket-desk routine does not.
    id: "it",
    roleTerms: [
      "system administrator",
      "systems administrator",
      "sysadmin",
      "IT administrator",
      "IT operations",
      "IT engineer",
      "IT specialist",
      "IT manager",
      "infrastructure engineer",
      "infrastructure administrator",
      "network administrator",
      "administrateur système",
      "administrateur systèmes",
      "ingénieur système",
      "ingénieur systèmes",
      "administrateur réseau",
      "administrateur réseaux",
      "responsable informatique",
      "מנהל מערכות",
      "מנהל רשת",
      "איש מערכות מידע",
    ],
    drop: [
      cvKey("bullet", "cyolo", "jira"),
      cvKey("bullet", "cyolo", "zendesk"),
      cvKey("bullet", "robotika", "rfid"),
    ],
    // Scripting and its editor stay, because an estate is run with them. The
    // application stack does not: this angle is not applying to build a
    // product. Documentation and the user-lifecycle tool are kept as evidence.
    dropSkills: [
      "javascript",
      "csharp",
      "php",
      "matlab",
      "react",
      "vue",
      "angular",
      "html",
      "scss",
      "responsive-design",
      "redux",
      "node",
      "express",
      "rest",
      "json",
      "webhooks",
      "mongodb",
      "mysql",
      "sql-server",
      "phpmyadmin",
      "studio-3t",
      "saas-platforms",
      "pwa",
      "oop-reactive",
      "jwt",
      "figma",
      "adobe",
      "avocode",
      "lunacy",
    ],
  },
  {
    // What was shipped and operated, not what was answered. The military
    // media and cabling lines say nothing to an engineering panel.
    id: "fullstack",
    roleTerms: [
      "full-stack",
      "fullstack",
      "software engineer",
      "software developer",
      "web developer",
      "back-end developer",
      "front-end developer",
      "backend engineer",
      "frontend engineer",
      "développeur",
      "développeuse",
      "ingénieur logiciel",
      "ingénieur développement",
      "מפתח",
      "מפתחת",
      "מהנדס תוכנה",
    ],
    drop: [
      cvKey("bullet", "cyolo", "knowledge-base"),
      cvKey("bullet", "cyolo", "zendesk"),
      cvKey("bullet", "idf", "video"),
      cvKey("bullet", "idf", "cabling"),
      cvKey("bullet", "robotika", "rfid"),
      cvKey("bullet", "robotika", "automation"),
    ],
    // The line to draw here is protocol against product. Having implemented
    // SAML, SCIM and OIDC is engineering work an interviewer will dig into;
    // administering the tenants they run in is not, and neither is the office
    // suite. Support and Jira stay because the role title claims them, and the
    // estate bullets stay for the SSO integrations and the SOC 2 ownership
    // buried in them, which read as engineering rather than administration.
    dropSkills: [
      "matlab",
      "azuread",
      "entra",
      "okta",
      "active-directory",
      "gpo",
      "rbac",
      "xdr",
      "icap",
      "dns-records",
      "firewalls",
      "fortinet",
      "winserver",
      "multi-os-vms",
      "rdp",
      "vnc",
      "telnet",
      "putty",
      "anydesk",
      "intune",
      "m365-word",
      "excel",
      "powerpoint",
      "outlook",
      "exchange",
      "onedrive",
      "sharepoint",
      "visio",
      "timeclock365",
      "gong",
      "salesforce",
      "mesh",
      "salesloft",
      "travelperk",
      "hibob",
      "adobe",
      "zendesk",
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
  // Skills are selected one tool at a time, so a line has no key of its own.
  for (const line of cvSections.skills.filter(visible)) {
    for (const id of cvSkillChips(line)) keys.add(cvKey("skill", id))
  }

  return keys
}

/** The full document minus whatever the angle leaves out. */
export function cvPresetSelection(preset: CvPreset): Set<string> {
  const keys = cvFullSelection()
  for (const key of preset.drop) keys.delete(key)
  for (const id of preset.dropSkills ?? []) keys.delete(cvKey("skill", id))
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
