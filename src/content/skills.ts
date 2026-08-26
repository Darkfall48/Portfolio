import type { SkillGroup } from "./types"
import { FILLER_ON, fillerChips } from "./_filler"

/**
 * Identity leads because that is what the roles being targeted screen for.
 * Anything not defensible in an interview stays out: no PAM while admin rights
 * are permanent, and Intune sits under test environments, not production.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: "identity",
    featured: true,
    chips: [
      { id: "saml", label: "SAML" },
      { id: "scim", label: "SCIM" },
      { id: "oidc", label: "OIDC" },
      { id: "sso", label: "SSO" },
      { id: "ldap", label: "LDAP" },
      { id: "entra", label: "Entra ID" },
      { id: "mfa", label: "MFA" },
      { id: "conditional", label: "Conditional access" },
      { id: "passkeys", label: "Passkeys" },
      // Load-test chips, empty unless FILLER_ON is flipped in _filler.ts.
      ...(FILLER_ON ? fillerChips("identity") : []),
    ],
  },
  {
    id: "security",
    featured: true,
    chips: [
      { id: "ztna", label: "ZTNA" },
      { id: "xdr", label: "Defender XDR" },
      { id: "tls", label: "SSL/TLS" },
      { id: "san", label: "SAN certificates" },
      { id: "fortinet", label: "Fortinet" },
      { id: "proxies", label: "Reverse proxies" },
      { id: "soc2", label: "SOC 2" },
      { id: "gpo", label: "GPO" },
      ...(FILLER_ON ? fillerChips("security") : []),
    ],
  },
  {
    id: "platforms",
    featured: true,
    chips: [
      { id: "compose", label: "Docker Compose" },
      { id: "linux", label: "Linux" },
      { id: "winserver", label: "Windows Server" },
      { id: "macos", label: "macOS" },
      { id: "esxi", label: "VMware ESXi" },
      { id: "proxmox", label: "Proxmox" },
      { id: "aws", label: "AWS" },
      { id: "intune", label: "Intune" },
      ...(FILLER_ON ? fillerChips("platforms") : []),
    ],
  },
  {
    id: "fullstack",
    featured: true,
    chips: [
      { id: "react", label: "React" },
      { id: "typescript", label: "TypeScript" },
      { id: "node", label: "Node.js" },
      { id: "redux", label: "Redux" },
      { id: "rest", label: "REST" },
      { id: "mongodb", label: "MongoDB" },
      { id: "scss", label: "SCSS" },
      { id: "pwa", label: "PWA" },
      ...(FILLER_ON ? fillerChips("fullstack") : []),
    ],
  },
  {
    id: "ops",
    featured: true,
    chips: [
      { id: "powershell", label: "PowerShell" },
      { id: "python", label: "Python" },
      { id: "bash", label: "Bash" },
      { id: "grafana", label: "Grafana" },
      { id: "prometheus", label: "Prometheus" },
      { id: "zendesk", label: "Zendesk" },
      { id: "jira", label: "Jira" },
      { id: "confluence", label: "Confluence" },
      ...(FILLER_ON ? fillerChips("ops") : []),
    ],
  },
]
