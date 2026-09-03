// Regression check for the job-offer matcher. Two parts: every ad in
// `scripts/cv/ads` must land on the angle its file name claims, and a set of
// traps must still behave. Fails loudly, so a change to an alias, a preset's
// `dropSkills` or a `roleTerms` list cannot quietly reroute an ad.
//
// The ads are written for this repository, not scraped: no employer copy, no
// real posting. Add one by dropping `<angle>-<locale>-<n>.txt` in `ads/`.
//
// Run with: npm run cv:match
import { readdirSync, readFileSync, mkdirSync } from "node:fs"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { build } from "esbuild"

const ADS = "scripts/cv/ads"
const bundle = ".tmp/cv-match.mjs"

mkdirSync(".tmp", { recursive: true })

// Same trick as `cv:sample`: the matcher is TypeScript, so it is compiled on
// the fly rather than restated here and left to drift.
await build({
  stdin: {
    contents: [
      'export { matchOffer, tailorSelection } from "./src/services/jobMatch"',
      'export { buildCvData, estimateCvFill } from "./src/services/cvDocument"',
      'export { cvPresets } from "./src/content/cv"',
      'export * from "./src/content/skills"',
    ].join("\n"),
    resolveDir: ".",
    loader: "ts",
  },
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: bundle,
  logLevel: "error",
})

const {
  matchOffer,
  tailorSelection,
  buildCvData,
  estimateCvFill,
  cvPresets,
  ambiguousTerms,
  skillChips,
  unclaimedSkills,
} = await import(pathToFileURL(resolve(bundle)).href)

const docs = Object.fromEntries(
  ["en", "fr", "he"].map((locale) => [
    locale,
    JSON.parse(readFileSync(`src/locales/${locale}.json`, "utf8")).cv.doc,
  ]),
)

let failures = 0
function check(label, pass, detail = "") {
  if (!pass) failures += 1
  console.log(
    `  ${pass ? "ok  " : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`,
  )
}

console.log("ads land on the angle their file name claims")
const files = readdirSync(ADS)
  .filter((name) => name.endsWith(".txt"))
  .sort()
if (files.length === 0) throw new Error(`no ads in ${ADS}`)

for (const file of files) {
  const parsed = file.match(/^(.*)-(en|fr|he)-\d+\.txt$/)
  if (!parsed) throw new Error(`invalid ad file name: ${file}`)
  const [, expected, locale] = parsed
  const text = readFileSync(`${ADS}/${file}`, "utf8")
  const match = matchOffer(text)
  const { keys, angle } = tailorSelection(match, docs[locale], locale, "")
  const fill = estimateCvFill(buildCvData(docs[locale], keys, ""), locale)

  const asked = (list) => list.filter((demand) => demand.required).length

  check(
    file.padEnd(20),
    angle === expected && fill <= 1,
    `angle ${angle}, ${Math.round(fill * 100)}% full, ` +
      `${match.found.length} recognised (${asked(match.found)} required), ` +
      `${match.gaps.length} not covered (${asked(match.gaps)} required)`,
  )
}

console.log("\nan ambiguous term still names something real")
const vocabulary = new Set()
for (const chip of skillChips) {
  for (const term of [chip.label, chip.cvLabel, ...(chip.aliases ?? [])]) {
    if (term) vocabulary.add(term.toLowerCase())
  }
}
for (const term of unclaimedSkills) vocabulary.add(term.toLowerCase())
for (const term of ambiguousTerms) {
  check(`"${term}" is in the vocabulary`, vocabulary.has(term.toLowerCase()))
}

console.log("\nthe tool is found, the ordinary word is not")
const found = (text) => new Set(matchOffer(text).found.map((d) => d.value))
const gaps = (text) => new Set(matchOffer(text).gaps.map((d) => d.value))

const pairs = [
  ["react", "Stack: React and Redux.", "You react quickly to incidents."],
  ["vue", "Front end in Vue and Angular.", "Une vue d'ensemble est attendue."],
  [
    "express",
    "Node.js and Express on the back.",
    "Livraison express des correctifs.",
  ],
  ["teams", "We run on Microsoft Teams.", "Work with cross-functional teams."],
  ["node", "Node and npm required.", "Each node in the cluster."],
]
for (const [id, tool, word] of pairs) {
  check(`${id}: the tool`, found(tool).has(id))
  check(`${id}: the word`, !found(word).has(id))
}
check("Chef the tool", gaps("Config management with Chef.").has("Chef"))
check("chef the boss", !gaps("Rattaché au chef de projet.").has("Chef"))
check("Golang, not Go", gaps("Backend services in Golang.").has("Golang"))
check("go the verb", gaps("Go the extra mile for customers.").size === 0)

console.log("\na suite is not the application inside it")
const tenant = found("We run Microsoft 365 and Entra ID for 400 staff.")
check("Microsoft 365 is the tenant", tenant.has("m365"))
check("and not the word processor", !tenant.has("m365-word"))
check("O365 too", found("Administering O365.").has("m365"))

console.log("\nwrapping and spelling do not hide a term")
check(
  "wrapped over a line",
  found("We use Docker\nCompose here.").has("compose"),
)
check("double spaced", found("We use Docker  Compose.").has("compose"))
check("plural tolerated", found("Experience with firewalls.").has("firewalls"))
check(
  "singular tolerated",
  found("Experience with a firewall.").has("firewalls"),
)
check(
  "full stack without the hyphen",
  matchOffer("Full Stack Engineer wanted.").roles.has("fullstack"),
)
check(
  "an ad shouted in capitals",
  found("SENIOR REACT AND NODE.JS DEVELOPER WANTED").has("react"),
)

console.log("\nrequired and merely wished for are told apart")
const demand = (text, id) =>
  matchOffer(text).found.find((entry) => entry.value === id)
check(
  "an aside only demotes its own sentence",
  demand("Kubernetes exposure a plus. Scripting in Python.", "python")
    ?.required === true,
)
check(
  "a list under a heading is all wishes",
  demand("Nice to have: Jamf, Okta, Grafana.", "grafana")?.required === false,
)
check(
  "the next heading closes the list",
  demand(
    "Nice to have: Jamf. Networking basics: DNS, firewalls.",
    "dns-records",
  )?.required === true,
)
check(
  "a wrapped list stays a list",
  demand("יתרון: Kubernetes,\nGrafana, וסקריפטים ב-Python.", "python")
    ?.required === false,
)
check(
  "a wish can trail its sentence",
  matchOffer("Terraform experience would be welcome.").gaps[0]?.required ===
    false,
)
check(
  "a wrapped sentence is read whole",
  matchOffer("Terraform and Ansible experience\nwelcome.").gaps.every(
    (gap) => !gap.required,
  ),
)
check(
  "a bullet is still its own line",
  matchOffer("Nice to have:\n- Kubernetes\n- Terraform").gaps.length === 2,
)
check(
  "a gap under a heading is not a blocker",
  matchOffer("Nice to have: Kubernetes.").gaps[0]?.required === false,
)
check(
  "a gap in the requirements is",
  matchOffer("You must know Kubernetes.").gaps[0]?.required === true,
)

console.log("\nnothing in, nothing out")
const blank = matchOffer("   \n  ")
check("blank text finds nothing", blank.found.length === 0)
check("blank text names no angle", blank.roles.size === 0)
const prose = matchOffer(
  "We want a motivated person to join our friendly team.",
)
check("plain prose finds nothing", prose.found.length === 0)
check("plain prose reports no gap", prose.gaps.length === 0)

console.log("\nevery angle is reachable by its title")
for (const preset of cvPresets) {
  const hit = preset.roleTerms.some((term) =>
    matchOffer(`We are hiring a ${term} to join us.`).roles.has(preset.id),
  )
  check(`"${preset.id}"`, hit)
}

console.log(
  failures === 0
    ? `\nall checks pass over ${files.length} ads`
    : `\n${failures} FAILURES over ${files.length} ads`,
)
process.exit(failures === 0 ? 0 : 1)
