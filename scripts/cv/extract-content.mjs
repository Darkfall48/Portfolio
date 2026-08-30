// Extracts the reference CV text into the shape the template expects, so the
// locale file is transcribed from the document itself instead of by hand.
//
// Prints JSON on stdout. Run with: npm run cv:extract
import { readFileSync } from "node:fs"
import PizZip from "pizzip"

const SOURCE = "CVs/2026/Sidney Sebban 2026 - IT Specialist.docx"

const zip = new PizZip(readFileSync(SOURCE))
const xml = zip.file("word/document.xml").asText()
const body = xml.slice(xml.indexOf("<w:body>"), xml.indexOf("</w:body>"))
const paragraphs =
  body.match(/<w:p(?: [^>]*)?>[\s\S]*?<\/w:p>|<w:p(?: [^>]*)?\/>/g) ?? []

const decode = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")

/** Runs of a paragraph, flattened to { text, bold, underline }. */
function runsOf(index) {
  const matches =
    paragraphs[index].match(/<w:r(?: [^>]*)?>[\s\S]*?<\/w:r>/g) ?? []
  return matches
    .map((r) => {
      const rPr = r.match(/<w:rPr>[\s\S]*?<\/w:rPr>/)?.[0] ?? ""
      const text = [...r.matchAll(/<w:t(?: [^>]*)?>([\s\S]*?)<\/w:t>/g)]
        .map((m) => decode(m[1]))
        .join("")
      return {
        text,
        bold: /<w:b\/>/.test(rPr),
        underline: /<w:u w:val="single"\/>/.test(rPr),
      }
    })
    .filter((r) => r.text !== "")
}

/** Merges neighbouring runs that share formatting into one segment. */
function segmentsOf(index) {
  const segments = []
  for (const run of runsOf(index)) {
    const last = segments.at(-1)
    if (last && last.bold === run.bold && last.underline === run.underline) {
      last.text += run.text
    } else {
      segments.push({ ...run })
    }
  }
  return segments
}

/** Leading emphasised run, then the plain remainder. */
function leadAndText(index, emphasis) {
  const segments = segmentsOf(index)
  const lead = segments[0] && emphasis(segments[0]) ? segments.shift().text : ""
  return { lead, text: segments.map((s) => s.text).join("") }
}

/** Plain prefix, underlined middle, plain suffix — the education line shape. */
function periodTitleSuffix(index) {
  const segments = segmentsOf(index)
  const period = segments[0] && !segments[0].underline ? segments.shift().text : ""
  const title = segments[0] && segments[0].underline ? segments.shift().text : ""
  return { period, title, suffix: segments.map((s) => s.text).join("") }
}

/** Alternating bold label / plain value pairs on one line. */
function partsOf(index) {
  const parts = []
  for (const segment of segmentsOf(index)) {
    if (segment.bold || parts.length === 0) {
      parts.push({ label: segment.bold ? segment.text : "", text: segment.bold ? "" : segment.text })
    } else {
      parts.at(-1).text += segment.text
    }
  }
  return parts
}

function roleHeader(index) {
  const segments = segmentsOf(index)
  const emphasised = (s) => s.bold && s.underline
  const lead = segments[0] && emphasised(segments[0]) ? segments.shift().text : ""
  const period = segments[0] && !emphasised(segments[0]) ? segments.shift().text : ""
  const title = segments[0] && emphasised(segments[0]) ? segments.shift().text : ""
  return { lead, period, title, suffix: segments.map((s) => s.text).join("") }
}

const plain = (index) => segmentsOf(index).map((s) => s.text).join("")
const range = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i)

const doc = {
  email: "sidneysebban@gmail.com",
  workTitle: plain(8),
  educationTitle: plain(28),
  skillsTitle: plain(33),
  languagesLabel: "Languages",
  languages: plain(39).replace(/^Languages:\s*/, ""),
  footnote: plain(41),
  summary: range(3, 6).map((i) =>
    leadAndText(i, (s) => s.bold && s.underline),
  ),
  roles: {
    cyolo: { ...roleHeader(9), bullets: range(10, 21).map((i) => leadAndText(i, (s) => s.bold)) },
    idf: { ...roleHeader(23), bullets: range(24, 26).map((i) => leadAndText(i, (s) => s.bold)) },
  },
  education: range(29, 31).map(periodTitleSuffix),
  skills: range(34, 37).map((i) => ({ parts: partsOf(i) })),
}

console.log(JSON.stringify(doc, null, 2))
