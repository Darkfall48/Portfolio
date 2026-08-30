// Renders the template with every line selected, which must reproduce the
// reference CV. Used to check template fidelity after `npm run cv:template`,
// without going through the browser.
//
// Run with: npm run cv:sample -- [phone]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import Docxtemplater from "docxtemplater"
import PizZip from "pizzip"

const TEMPLATE = "public/cv/cv-template.docx"
const TARGET = ".tmp/cv-sample.docx"

const locale = JSON.parse(readFileSync("src/locales/en.json", "utf8"))
const doc = locale.cv.doc
const phone = process.argv[2] ?? ""

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

const template = new Docxtemplater(new PizZip(readFileSync(TEMPLATE)), {
  paragraphLoop: true,
  linebreaks: false,
})
template.render(data)

mkdirSync(".tmp", { recursive: true })
writeFileSync(TARGET, template.getZip().generate({ type: "nodebuffer" }))

console.log(`sample written to ${TARGET}`)
