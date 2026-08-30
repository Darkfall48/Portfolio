// Renders a template with every line selected, which must reproduce the
// reference CV. Used to check template fidelity after `npm run cv:template`,
// without going through the browser. Pair it with `npm run cv:pdf` to confirm
// the result still lands on a single page.
//
// Run with: npm run cv:sample -- [locale] [phone]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import Docxtemplater from "docxtemplater"
import PizZip from "pizzip"

const TEMPLATE = {
  ltr: "public/cv/cv-template.docx",
  rtl: "public/cv/cv-template-rtl.docx",
}

const locale = process.argv[2] ?? "en"
const phone = process.argv[3] ?? ""
const template = TEMPLATE[locale === "he" ? "rtl" : "ltr"]
const target = `.tmp/cv-sample-${locale}.docx`

const doc = JSON.parse(readFileSync(`src/locales/${locale}.json`, "utf8")).cv
  .doc

const values = (record) => Object.values(record)

const data = {
  name: "Sidney Sebban",
  phone: phone ? `${phone} | ` : "",
  email: doc.email,
  hasSummary: true,
  summary: values(doc.summary),
  hasRoles: true,
  workTitle: doc.workTitle,
  roles: values(doc.roles).map((role) => ({
    ...role,
    bullets: values(role.bullets),
  })),
  hasEducation: true,
  educationTitle: doc.educationTitle,
  education: values(doc.education),
  hasSkills: true,
  skillsTitle: doc.skillsTitle,
  skills: values(doc.skills),
  languagesLabel: doc.languagesLabel,
  languages: doc.languages,
  footnote: doc.footnote,
}

const rendered = new Docxtemplater(new PizZip(readFileSync(template)), {
  paragraphLoop: true,
  linebreaks: false,
})
rendered.render(data)

mkdirSync(".tmp", { recursive: true })
writeFileSync(target, rendered.getZip().generate({ type: "nodebuffer" }))

console.log(`sample written to ${target} (from ${template})`)
