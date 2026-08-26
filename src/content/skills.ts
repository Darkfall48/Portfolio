import type { SkillGroup } from "./types"
import { FILLER_ON, fillerChips } from "./_filler"

export const skillGroups: SkillGroup[] = [
  {
    id: "identity",
    featured: true,
    chips: [
      { id: "saml", label: "SAML" },
      { id: "scim", label: "SCIM" },
      { id: "sso", label: "SSO" },
      { id: "ldap", label: "LDAP" },
      { id: "entra", label: "Entra ID" },
      { id: "tls", label: "SSL/TLS" },
      // Load-test chips, empty unless FILLER_ON is flipped in _filler.ts.
      ...(FILLER_ON ? fillerChips("identity") : []),
    ],
  },
  {
    id: "fullstack",
    featured: true,
    chips: [
      { id: "react", label: "React" },
      { id: "typescript", label: "TypeScript" },
      { id: "node", label: "Node.js" },
      { id: "rest", label: "REST" },
      { id: "redux", label: "Redux" },
      { id: "scss", label: "SCSS" },
      { id: "docker", label: "Docker" },
      ...(FILLER_ON ? fillerChips("fullstack") : []),
    ],
  },
  {
    id: "it-support",
    featured: true,
    chips: [
      { id: "linux", label: "Linux" },
      { id: "windows", label: "Windows" },
      { id: "macos", label: "macOS" },
      { id: "compose", label: "Docker Compose" },
      { id: "jira", label: "Jira" },
      { id: "zendesk", label: "Zendesk" },
      ...(FILLER_ON ? fillerChips("it-support") : []),
    ],
  },
]
