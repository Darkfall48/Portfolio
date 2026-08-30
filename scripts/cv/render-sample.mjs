// Renders a template with every line selected, which must reproduce the
// reference CV. Used to check template fidelity after `npm run cv:template`,
// without going through the browser. Pair it with `npm run cv:pdf` to confirm
// the result still lands on a single page.
//
// Run with: npm run cv:sample -- [locale] [phone]
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
      'export { buildCvData } from "./src/services/cvDocument"',
      'export { cvFullSelection } from "./src/content/cv"',
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

const { buildCvData, cvFullSelection } = await import(
  pathToFileURL(resolve(bundle)).href
)

const doc = JSON.parse(readFileSync(`src/locales/${locale}.json`, "utf8")).cv
  .doc

const rendered = new Docxtemplater(new PizZip(readFileSync(template)), {
  paragraphLoop: true,
  linebreaks: false,
})
rendered.render(buildCvData(doc, cvFullSelection(), phone))

writeFileSync(target, rendered.getZip().generate({ type: "nodebuffer" }))

console.log(`sample written to ${target} (from ${template})`)
