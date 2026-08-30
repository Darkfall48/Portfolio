// Renders a template with every line selected, which must reproduce the
// reference CV. Used to check template fidelity after `npm run cv:template`,
// without going through the browser. Pair it with `npm run cv:pdf` to confirm
// the result still lands on a single page.
//
// Given a job ad as a fourth argument, it renders what the builder would
// tailor for that ad instead, which is the only way to see a tailored page
// break for real rather than through the estimate.
//
// Run with: npm run cv:sample -- [locale] [phone] [offer.txt]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import Docxtemplater from "docxtemplater"
import PizZip from "pizzip"
import { build } from "esbuild"

const TEMPLATE = {
  ltr: "public/cv/cv-template.docx",
  rtl: "public/cv/cv-template-rtl.docx",
}

const locale = process.argv[2] ?? "en"
const phone = process.argv[3] ?? ""
const offerFile = process.argv[4]
const template = TEMPLATE[locale === "he" ? "rtl" : "ltr"]
const target = `.tmp/cv-sample-${locale}.docx`
const bundle = ".tmp/cv-generator.mjs"

mkdirSync(".tmp", { recursive: true })

// The generator is TypeScript, so the script compiles it on the fly instead of
// restating the composition and letting the two drift. esbuild ships with Vite,
// so this costs no extra dependency.
await build({
  stdin: {
    contents: [
      'export { buildCvData, estimateCvFill } from "./src/services/cvDocument"',
      'export { cvFullSelection } from "./src/content/cv"',
      'export { matchOffer, tailorSelection } from "./src/services/jobMatch"',
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
  buildCvData,
  cvFullSelection,
  estimateCvFill,
  matchOffer,
  tailorSelection,
} = await import(pathToFileURL(resolve(bundle)).href)

const doc = JSON.parse(readFileSync(`src/locales/${locale}.json`, "utf8")).cv
  .doc

let selection = cvFullSelection()
if (offerFile) {
  const match = matchOffer(readFileSync(offerFile, "utf8"))
  const tailored = tailorSelection(match, doc, locale, phone)
  selection = tailored.keys
  console.log(
    `tailored to "${tailored.angle}" on ${match.found.length} recognised terms` +
      (match.gaps.length ? `, ${match.gaps.length} not covered` : ""),
  )
}

const data = buildCvData(doc, selection, phone)
const rendered = new Docxtemplater(new PizZip(readFileSync(template)), {
  paragraphLoop: true,
  linebreaks: false,
})
rendered.render(data)

writeFileSync(target, rendered.getZip().generate({ type: "nodebuffer" }))

const fill = Math.round(estimateCvFill(data, locale) * 100)
console.log(`sample written to ${target} (from ${template}, ${fill}% full)`)
