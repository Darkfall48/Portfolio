import type { ContentId, SkillChip, SkillGroup } from "./types"
import { FILLER_ON, fillerChipIds, fillerChips } from "./_filler"

/**
 * Every tool, named once. The home panel and the CV each arrange a subset of
 * these ids, so a name can never drift between the two, and a keyword only has
 * to be recognised in one place.
 *
 * A chip carries `cvLabel` when the document spells it out for a machine
 * reader, and `translated` when it is a common noun the CV states in its own
 * language. Everything else is a product name and stays as written.
 */
export const skillChips: SkillChip[] = [
  //? Languages, frameworks, data
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "csharp", label: "C#" },
  { id: "php", label: "PHP" },
  { id: "matlab", label: "MATLAB" },
  { id: "bash", label: "Bash" },
  { id: "powershell", label: "PowerShell" },
  { id: "shell", label: "Shell" },
  { id: "react", label: "React" },
  { id: "vue", label: "Vue.js" },
  { id: "angular", label: "Angular" },
  { id: "html", label: "HTML" },
  { id: "scss", label: "SCSS", cvLabel: "CSS/SCSS/SASS" },
  { id: "responsive-design", label: "Responsive Design", translated: true },
  { id: "redux", label: "Redux" },
  { id: "node", label: "Node.js" },
  { id: "express", label: "Express" },
  { id: "rest", label: "REST", translated: true },
  { id: "mongodb", label: "MongoDB" },
  { id: "mysql", label: "MySQL" },
  { id: "sql-server", label: "SQL Server" },
  { id: "phpmyadmin", label: "phpMyAdmin" },
  { id: "studio-3t", label: "Studio 3T" },
  { id: "vscode", label: "Visual Studio Code" },
  { id: "postman", label: "Postman" },
  { id: "saas-platforms", label: "SaaS platforms", translated: true },
  { id: "pwa", label: "PWA", translated: true },
  { id: "oop-reactive", label: "Object-Oriented & Reactive", translated: true },

  //? Platforms, infrastructure, virtualisation
  { id: "docker", label: "Docker" },
  { id: "compose", label: "Docker Compose" },
  { id: "git", label: "Git" },
  { id: "github", label: "GitHub" },
  { id: "linux", label: "Linux", cvLabel: "Linux (Ubuntu)" },
  { id: "windows", label: "Windows" },
  { id: "winserver", label: "Windows Server" },
  { id: "macos", label: "macOS" },
  { id: "aws", label: "AWS", cvLabel: "AWS EC2/S3" },
  { id: "esxi", label: "VMware ESXi" },
  { id: "proxmox", label: "Proxmox" },
  { id: "multi-os-vms", label: "Multi-OS virtual machines", translated: true },

  //? Identity, security, networking
  { id: "azuread", label: "AzureAD" },
  { id: "entra", label: "Entra ID" },
  { id: "okta", label: "Okta" },
  { id: "active-directory", label: "Active Directory" },
  { id: "gpo", label: "GPO" },
  { id: "ldap", label: "LDAP" },
  { id: "sso", label: "SSO" },
  { id: "scim", label: "SCIM" },
  { id: "saml", label: "SAML" },
  { id: "oidc", label: "OIDC" },
  { id: "rbac", label: "RBAC" },
  { id: "mfa", label: "MFA" },
  { id: "conditional", label: "Conditional access" },
  { id: "passkeys", label: "Passkeys" },
  { id: "ztna", label: "ZTNA" },
  { id: "soc2", label: "SOC 2" },
  { id: "xdr", label: "Defender XDR", cvLabel: "Microsoft XDR" },
  { id: "icap", label: "ICAP" },
  { id: "dns-records", label: "DNS records", translated: true },
  { id: "firewalls", label: "Firewalls", translated: true },
  { id: "proxies", label: "Reverse proxies", translated: true },
  { id: "fortinet", label: "Fortinet" },
  { id: "tls", label: "SSL/TLS" },
  { id: "san", label: "SAN certificates" },
  // The document states both certificate kinds in one breath; the home keeps
  // them apart, so this id belongs to the CV alone.
  {
    id: "ssl-san-certs",
    label: "SSL/TLS & SAN certificates",
    translated: true,
  },
  { id: "jwt", label: "JWT" },

  //? Ops, monitoring, collaboration
  { id: "grafana", label: "Grafana" },
  { id: "prometheus", label: "Prometheus" },
  { id: "betterstack", label: "BetterStack" },
  { id: "zendesk", label: "Zendesk" },
  { id: "jira", label: "Jira" },
  { id: "confluence", label: "Confluence" },
  { id: "ssh", label: "SSH" },
  { id: "scp", label: "SCP" },
  { id: "rdp", label: "RDP" },
  { id: "vnc", label: "VNC" },
  { id: "telnet", label: "Telnet" },
  { id: "putty", label: "PuTTY" },
  { id: "anydesk", label: "AnyDesk" },
  { id: "intune", label: "Intune", cvLabel: "Microsoft Intune" },
  { id: "m365-word", label: "Microsoft 365 Word" },
  { id: "excel", label: "Excel" },
  { id: "powerpoint", label: "PowerPoint" },
  { id: "outlook", label: "Outlook" },
  { id: "onedrive", label: "OneDrive" },
  { id: "sharepoint", label: "SharePoint" },
  { id: "visio", label: "Visio" },
  { id: "timeclock365", label: "TimeClock365" },
  { id: "gong", label: "Gong" },
  { id: "salesforce", label: "Salesforce" },
  { id: "salesloft", label: "SalesLoft" },
  { id: "travelperk", label: "TravelPerk" },
  { id: "hibob", label: "HiBob" },
  { id: "figma", label: "Figma" },
  { id: "adobe", label: "Adobe Suite" },
  { id: "avocode", label: "Avocode" },
  { id: "lunacy", label: "Lunacy" },
  { id: "zoom", label: "Zoom" },
  { id: "slack", label: "Slack" },
  { id: "teams", label: "Microsoft Teams" },

  // Load-test chips, empty unless FILLER_ON is flipped in _filler.ts.
  ...(FILLER_ON ? fillerChips() : []),
]

const byId = new Map(skillChips.map((chip) => [chip.id, chip]))

export function skillChip(id: ContentId): SkillChip | undefined {
  return byId.get(id)
}

/**
 * The home arrangement. Identity leads because that is what the roles being
 * targeted screen for. Anything not defensible in an interview stays out: no
 * PAM while admin rights are permanent, and Intune sits under test
 * environments, not production. The exhaustive list belongs to the CV, so a
 * keyword added there never leaks onto the home.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: "identity",
    featured: true,
    chips: [
      "saml",
      "scim",
      "oidc",
      "sso",
      "ldap",
      "entra",
      "mfa",
      "conditional",
      "passkeys",
      ...(FILLER_ON ? fillerChipIds("identity") : []),
    ],
  },
  {
    id: "security",
    featured: true,
    chips: [
      "ztna",
      "xdr",
      "tls",
      "san",
      "fortinet",
      "proxies",
      "soc2",
      "gpo",
      ...(FILLER_ON ? fillerChipIds("security") : []),
    ],
  },
  {
    id: "platforms",
    featured: true,
    chips: [
      "compose",
      "linux",
      "winserver",
      "macos",
      "esxi",
      "proxmox",
      "aws",
      "intune",
      ...(FILLER_ON ? fillerChipIds("platforms") : []),
    ],
  },
  {
    id: "fullstack",
    featured: true,
    chips: [
      "react",
      "typescript",
      "node",
      "redux",
      "rest",
      "mongodb",
      "scss",
      "pwa",
      ...(FILLER_ON ? fillerChipIds("fullstack") : []),
    ],
  },
  {
    id: "ops",
    featured: true,
    chips: [
      "powershell",
      "python",
      "bash",
      "grafana",
      "prometheus",
      "zendesk",
      "jira",
      "confluence",
      ...(FILLER_ON ? fillerChipIds("ops") : []),
    ],
  },
]
