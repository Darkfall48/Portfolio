import type { WorkItem } from "./types"
import { FILLER_ON, fillerWork } from "./_filler"

/**
 * Order is the home order: the first HOME_SLOTS.work rows are the ones a
 * recruiter sees before expanding, so the identity work leads.
 */
export const work: WorkItem[] = [
  {
    id: "idp-lab",
    featured: true,
  },
  {
    id: "identity",
    featured: true,
    url: "https://github.com/Darkfall48/Universal-SAML-SSO-Template",
  },
  {
    id: "ops-platform",
    featured: true,
  },
  {
    id: "helpdesk",
    featured: true,
  },
  {
    id: "web-forge",
    featured: true,
  },
  {
    id: "xdr",
    featured: true,
  },
  {
    id: "it-automation",
    featured: true,
  },
  // Load-test rows, empty unless FILLER_ON is flipped in _filler.ts.
  ...(FILLER_ON ? fillerWork() : []),
]
