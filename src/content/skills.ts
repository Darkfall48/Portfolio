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
  { id: "csharp", label: "C#", aliases: ["C-Sharp", "C sharp"] },
  { id: "php", label: "PHP" },
  { id: "matlab", label: "MATLAB" },
  { id: "bash", label: "Bash" },
  { id: "powershell", label: "PowerShell" },
  { id: "shell", label: "Shell" },
  { id: "react", label: "React" },
  { id: "vue", label: "Vue.js", aliases: ["Vue"] },
  { id: "angular", label: "Angular" },
  { id: "html", label: "HTML" },
  { id: "scss", label: "SCSS", cvLabel: "CSS/SCSS/SASS", aliases: ["SASS"] },
  {
    id: "responsive-design",
    label: "Responsive Design",
    translated: true,
    aliases: ["responsive"],
  },
  { id: "redux", label: "Redux" },
  { id: "node", label: "Node.js", aliases: ["Node"] },
  { id: "express", label: "Express" },
  {
    id: "rest",
    label: "REST",
    translated: true,
    aliases: ["REST API", "RESTful", "API"],
  },
  { id: "json", label: "JSON" },
  {
    id: "webhooks",
    label: "Webhooks",
    aliases: ["webhook"],
  },
  { id: "mongodb", label: "MongoDB" },
  { id: "mysql", label: "MySQL", aliases: ["SQL"] },
  { id: "sql-server", label: "SQL Server", aliases: ["MSSQL", "T-SQL", "SQL"] },
  { id: "phpmyadmin", label: "phpMyAdmin" },
  { id: "studio-3t", label: "Studio 3T" },
  { id: "vscode", label: "Visual Studio Code", aliases: ["VS Code", "VSCode"] },
  { id: "postman", label: "Postman" },
  {
    id: "saas-platforms",
    label: "SaaS platforms",
    translated: true,
    aliases: ["SaaS"],
  },
  {
    id: "pwa",
    label: "PWA",
    translated: true,
    aliases: ["Progressive Web App"],
  },
  {
    id: "oop-reactive",
    label: "Object-Oriented & Reactive",
    translated: true,
    aliases: ["OOP", "object-oriented"],
  },

  //? Platforms, infrastructure, virtualisation
  { id: "docker", label: "Docker" },
  { id: "compose", label: "Docker Compose", aliases: ["docker-compose"] },
  { id: "git", label: "Git" },
  { id: "github", label: "GitHub" },
  {
    id: "linux",
    label: "Linux",
    cvLabel: "Linux (Ubuntu)",
    aliases: ["Ubuntu"],
  },
  { id: "windows", label: "Windows" },
  { id: "winserver", label: "Windows Server" },
  { id: "macos", label: "macOS", aliases: ["Mac OS", "OS X", "OSX"] },
  {
    id: "aws",
    label: "AWS",
    cvLabel: "AWS EC2/S3",
    aliases: ["Amazon Web Services", "EC2", "S3"],
  },
  { id: "esxi", label: "VMware ESXi", aliases: ["VMware", "ESXi", "vSphere"] },
  { id: "proxmox", label: "Proxmox" },
  {
    id: "multi-os-vms",
    label: "Multi-OS virtual machines",
    translated: true,
    aliases: ["virtual machine", "hypervisor"],
  },

  //? Identity, security, networking
  {
    id: "azuread",
    label: "AzureAD",
    aliases: ["Azure AD", "Azure Active Directory"],
  },
  { id: "entra", label: "Entra ID", aliases: ["Entra"] },
  { id: "okta", label: "Okta" },
  { id: "active-directory", label: "Active Directory" },
  { id: "gpo", label: "GPO" },
  { id: "ldap", label: "LDAP" },
  { id: "sso", label: "SSO", aliases: ["Single Sign-On", "Single Sign On"] },
  { id: "scim", label: "SCIM" },
  { id: "saml", label: "SAML" },
  { id: "oidc", label: "OIDC", aliases: ["OpenID Connect", "OpenID"] },
  { id: "rbac", label: "RBAC", aliases: ["role-based access"] },
  { id: "mfa", label: "MFA", aliases: ["2FA", "multi-factor", "multifactor"] },
  { id: "conditional", label: "Conditional access" },
  { id: "passkeys", label: "Passkeys" },
  { id: "ztna", label: "ZTNA", aliases: ["Zero Trust", "Zero-Trust"] },
  { id: "soc2", label: "SOC 2", aliases: ["SOC2", "SOC II"] },
  {
    id: "xdr",
    label: "Defender XDR",
    cvLabel: "Microsoft XDR",
    aliases: ["Defender", "XDR"],
  },
  { id: "icap", label: "ICAP" },
  {
    id: "dns-records",
    label: "DNS records",
    translated: true,
    aliases: ["DNS"],
  },
  {
    id: "firewalls",
    label: "Firewalls",
    translated: true,
    aliases: ["firewall"],
  },
  {
    id: "proxies",
    label: "Reverse proxies",
    translated: true,
    aliases: ["reverse proxy", "proxies", "proxy"],
  },
  { id: "fortinet", label: "Fortinet" },
  { id: "tls", label: "SSL/TLS", aliases: ["TLS", "SSL"] },
  { id: "san", label: "SAN certificates", aliases: ["SAN"] },
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
  {
    id: "intune",
    label: "Intune",
    cvLabel: "Microsoft Intune",
    aliases: ["Endpoint Manager"],
  },
  {
    id: "m365-word",
    label: "Microsoft 365 Word",
    aliases: ["Microsoft 365", "M365", "Office 365", "O365"],
  },
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
  {
    id: "adobe",
    label: "Adobe Suite",
    aliases: ["Adobe", "Premiere Pro", "After Effects", "Photoshop"],
  },
  { id: "avocode", label: "Avocode" },
  { id: "lunacy", label: "Lunacy" },
  { id: "zoom", label: "Zoom" },
  { id: "slack", label: "Slack" },
  { id: "teams", label: "Microsoft Teams", aliases: ["Teams"] },

  // Load-test chips, empty unless FILLER_ON is flipped in _filler.ts.
  ...(FILLER_ON ? fillerChips() : []),
]

const byId = new Map(skillChips.map((chip) => [chip.id, chip]))

export function skillChip(id: ContentId): SkillChip | undefined {
  return byId.get(id)
}

/**
 * Vocabulary that is also an ordinary English or French word, and so is only
 * counted when it is capitalised the way a product name is. Ads write "React"
 * and "Node" for the tools, but "react quickly", "each node in the cluster",
 * "cross-functional teams", "en vue de" and "chef de projet" for the words —
 * and case is what separates the two every time.
 *
 * Case cannot save a word that also opens a sentence, which is why `Go` and
 * `Swift` are named `Golang` and left out entirely: "Go the extra mile" and
 * "Swift resolution" are ad boilerplate, and neither language is anywhere near
 * the roles this CV targets.
 */
export const ambiguousTerms: string[] = [
  "Chef",
  "Express",
  "Node",
  "React",
  "Teams",
  "Vue",
]

/**
 * Neighbouring technology the CV does not claim. Recognising these is the only
 * way the offer matcher can say what an ad asks for and the CV cannot answer;
 * without the list it could only ever report what is already there. Move an
 * entry into `skillChips` the day it becomes defensible in an interview.
 */
export const unclaimedSkills: string[] = [
  "Kubernetes",
  "Helm",
  "Terraform",
  "Ansible",
  "Puppet",
  "Chef",
  "Jenkins",
  "GitLab CI",
  "GitHub Actions",
  "ArgoCD",
  "Azure",
  "GCP",
  "Google Cloud",
  "Golang",
  "Rust",
  "Java",
  "Kotlin",
  "Ruby",
  "Next.js",
  "Svelte",
  "GraphQL",
  "gRPC",
  "Kafka",
  "RabbitMQ",
  "Redis",
  "PostgreSQL",
  "Elasticsearch",
  "Snowflake",
  "Datadog",
  "Splunk",
  "New Relic",
  "PagerDuty",
  "Sentry",
  "CrowdStrike",
  "SentinelOne",
  "Palo Alto",
  "Cisco",
  "Wazuh",
  "SIEM",
  "SOAR",
  "CyberArk",
  "HashiCorp Vault",
  "ServiceNow",
  "Freshdesk",
  "Intercom",
  "Notion",
  "Salesforce Apex",
  "SAP",
  "Kerberos",
  "Radius",
  "Jamf",
]

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
