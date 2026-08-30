// Rebuilds the docxtemplater CV templates from the reference .docx.
//
// Only word/document.xml is rewritten: styles, numbering, fonts, page margins
// and the decorative rule under the header are carried over untouched, so the
// generated CV keeps the exact formatting of the reference document.
//
// Two templates come out of one pass. The mirrored one is the same document
// read from the right, for the Hebrew CV.
//
// Run with: npm run cv:template
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname } from "node:path"
import PizZip from "pizzip"

// The reference lives in the gitignored CVs/ folder because it carries the
// phone number; the template it produces holds a placeholder instead, so it is
// safe to commit and to serve from the public site.
const SOURCE = "CVs/2026/Sidney Sebban 2026 - IT Specialist.docx"
const TARGETS = {
  ltr: "public/cv/cv-template.docx",
  rtl: "public/cv/cv-template-rtl.docx",
}

const zip = new PizZip(readFileSync(SOURCE))
const xml = zip.file("word/document.xml").asText()

const OPEN = "<w:body>"
const bodyStart = xml.indexOf(OPEN) + OPEN.length
const bodyEnd = xml.indexOf("</w:body>")
const body = xml.slice(bodyStart, bodyEnd)

const paragraphs =
  body.match(/<w:p(?: [^>]*)?>[\s\S]*?<\/w:p>|<w:p(?: [^>]*)?\/>/g) ?? []
// Body-level sectPr: page size and margins live here, so it must survive.
const sectPr = body.slice(body.lastIndexOf("</w:p>") + "</w:p>".length)

if (paragraphs.length !== 42) {
  throw new Error(
    `expected 42 paragraphs in the reference CV, found ${paragraphs.length}`,
  )
}

const ARIAL = '<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>'
const BIDI = '<w:rFonts w:asciiTheme="minorBidi" w:hAnsiTheme="minorBidi"/>'
const BOLD = "<w:b/><w:bCs/>"
const UNDER = '<w:u w:val="single"/>'
const sz = (n) => `<w:sz w:val="${n}"/><w:szCs w:val="${n}"/>`

/** Run properties follow the order the OOXML schema imposes: fonts, b, sz, u. */
function run(rPr, text) {
  return `<w:r><w:rPr>${rPr}</w:rPr><w:t xml:space="preserve">${text}</w:t></w:r>`
}

function pPrOf(index) {
  return paragraphs[index].match(/<w:pPr>[\s\S]*?<\/w:pPr>/)?.[0] ?? ""
}

/** First run properties of a paragraph, to inherit a heading's exact look. */
function rPrOf(index) {
  const firstRun = paragraphs[index].match(/<w:r(?: [^>]*)?>[\s\S]*?<\/w:r>/)[0]
  return firstRun.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/)?.[1] ?? ""
}

function paragraph(sourceIndex, runs) {
  return `<w:p>${pPrOf(sourceIndex)}${runs.join("")}</w:p>`
}

/** A paragraph holding nothing but a loop tag; docxtemplater drops it. */
function loopTag(tag) {
  return `<w:p>${run(ARIAL + sz(2), tag)}</w:p>`
}

// --- Header line -----------------------------------------------------------
// Rebuilt around the original spacing runs and hyperlinks: the gap between the
// name and the contacts is tuned by hand in the reference and must be kept
// verbatim, and the LinkedIn / GitHub links carry relationship ids.
const header = paragraphs[1]
const nameEnd =
  header.indexOf("</w:r>", header.indexOf("<w:t>Sidney Sebban</w:t>")) +
  "</w:r>".length
const phoneStart = header.lastIndexOf("<w:r ", header.indexOf("<w:t>054</w:t>"))
const emailEnd =
  header.indexOf(
    "</w:r>",
    header.indexOf("<w:t>sidneysebban@gmail.com</w:t>"),
  ) + "</w:r>".length

const spacingRuns = header.slice(nameEnd, phoneStart)
const linkRuns = header.slice(emailEnd, header.lastIndexOf("</w:p>"))

const headerParagraph = [
  "<w:p>",
  pPrOf(1),
  run(`${ARIAL}${BOLD}<w:noProof/>${sz(32)}`, "{name}"),
  spacingRuns,
  // The phone carries its own trailing separator so an empty value leaves no
  // dangling pipe in the contact line.
  run(`${BIDI}${BOLD}${sz(22)}`, "{phone}"),
  run(`${BIDI}${sz(22)}`, "{email}"),
  linkRuns,
  "</w:p>",
].join("")

// --- Body ------------------------------------------------------------------
const out = [
  paragraphs[0], // top spacer
  headerParagraph,
  paragraphs[2], // decorative rule

  // Section conditionals: dropping every line of a section must take its
  // heading and its trailing spacer with it, not leave an orphan title.
  loopTag("{#hasSummary}"),
  loopTag("{#summary}"),
  paragraph(3, [
    run(`${ARIAL}${BOLD}${sz(21)}${UNDER}`, "{lead}"),
    run(`${ARIAL}${BOLD}${sz(21)}`, "{text}"),
  ]),
  loopTag("{/summary}"),
  paragraphs[7], // spacer
  loopTag("{/hasSummary}"),

  loopTag("{#hasRoles}"),
  paragraph(8, [run(rPrOf(8), "{workTitle}")]),
  loopTag("{#roles}"),
  paragraph(9, [
    run(`${ARIAL}${BOLD}${sz(22)}${UNDER}`, "{lead}"),
    run(`${ARIAL}${sz(21)}`, "{period}"),
    run(`${ARIAL}${BOLD}${sz(21)}${UNDER}`, "{title}"),
    run(`${ARIAL}${sz(21)}`, "{suffix}"),
  ]),
  loopTag("{#bullets}"),
  paragraph(10, [
    run(`${BIDI}${BOLD}${sz(21)}`, "{lead}"),
    run(`${BIDI}${sz(21)}`, "{text}"),
  ]),
  loopTag("{/bullets}"),
  paragraphs[22], // spacer closing each role block
  loopTag("{/roles}"),
  loopTag("{/hasRoles}"),

  loopTag("{#hasEducation}"),
  paragraph(28, [run(rPrOf(28), "{educationTitle}")]),
  loopTag("{#education}"),
  paragraph(30, [
    run(`${ARIAL}${sz(21)}`, "{period}"),
    run(`${ARIAL}${sz(21)}${UNDER}`, "{title}"),
    run(`${ARIAL}${sz(21)}`, "{suffix}"),
  ]),
  loopTag("{/education}"),
  paragraphs[32], // spacer
  loopTag("{/hasEducation}"),

  loopTag("{#hasSkills}"),
  paragraph(33, [run(rPrOf(33), "{skillsTitle}")]),
  loopTag("{#skills}"),
  // Inline loop: skill lines alternate bold labels and plain values an
  // arbitrary number of times within a single paragraph.
  paragraph(34, [
    run(`${ARIAL}${sz(21)}`, "{#parts}"),
    run(`${ARIAL}${BOLD}${sz(21)}`, "{label}"),
    run(`${ARIAL}${sz(21)}`, "{text}"),
    run(`${ARIAL}${sz(21)}`, "{/parts}"),
  ]),
  loopTag("{/skills}"),
  paragraphs[38], // spacer
  loopTag("{/hasSkills}"),

  paragraph(39, [
    run(`${ARIAL}${BOLD}${sz(22)}${UNDER}`, "{languagesLabel}"),
    run(`${ARIAL}${sz(22)}`, ":"),
    `<w:r><w:rPr>${ARIAL}${sz(21)}</w:rPr><w:tab/></w:r>`,
    run(`${ARIAL}${sz(21)}`, "{languages}"),
  ]),
  paragraphs[40], // spacer
  paragraph(41, [run(`${ARIAL}${sz(21)}`, "{footnote}")]),
].join("")

const document = xml.slice(0, bodyStart) + out + sectPr + xml.slice(bodyEnd)

// --- Mirrored variant ------------------------------------------------------
// The reference was authored in a Hebrew Word, so its paragraph styles are
// already bidi and every paragraph opts out with `<w:bidi w:val="0"/>`. Making
// the Hebrew CV is mostly a matter of letting them opt back in.

/** The schema fixes the order inside w:pPr: bidi sits after tabs, before spacing. */
function bidiParagraph(pPr) {
  const cleaned = pPr.replace('<w:bidi w:val="0"/>', "")
  if (cleaned.includes("<w:bidi/>")) return cleaned

  // The paragraph mark's own rPr can hold elements that share these names, so
  // the insertion point is looked for ahead of it only.
  const limit = cleaned.includes("<w:rPr>")
    ? cleaned.indexOf("<w:rPr>")
    : cleaned.indexOf("</w:pPr>")
  const at = ["<w:spacing", "<w:ind", "<w:jc"]
    .map((tag) => cleaned.indexOf(tag))
    .filter((index) => index !== -1 && index < limit)
    .reduce((min, index) => Math.min(min, index), limit)

  return `${cleaned.slice(0, at)}<w:bidi/>${cleaned.slice(at)}`
}

/**
 * Word takes reading order from the run, not from the paragraph: `w:bidi`
 * alone right-aligns the text and moves the list bullets, but still lays the
 * runs out left to right, which scrambles a Hebrew sentence. Only the runs
 * carrying document copy are flipped. The name, phone and email stay Latin
 * whatever the language, and marking them would reorder the separators that
 * sit between them in the contact line.
 */
const LATIN_FIELDS = ["{name}", "{phone}", "{email}"]

function rtlRun(run) {
  if (!run.includes("{")) return run
  if (LATIN_FIELDS.some((field) => run.includes(field))) return run

  return run.replace(/<w:rPr>[\s\S]*?<\/w:rPr>/, (rPr) => {
    if (rPr.includes("<w:rtl/>")) return rPr
    // rtl comes after u and before lang in the run property order.
    const lang = rPr.indexOf("<w:lang ")
    const at = lang === -1 ? rPr.lastIndexOf("</w:rPr>") : lang
    return `${rPr.slice(0, at)}<w:rtl/>${rPr.slice(at)}`
  })
}

function mirrorDocument(source) {
  return source
    .replace(/<w:pPr>[\s\S]*?<\/w:pPr>/g, bidiParagraph)
    .replace(/<w:r(?: [^>]*)?>[\s\S]*?<\/w:r>/g, rtlRun)
    .replace(/<w:jc w:val="right"\/>/g, '<w:jc w:val="__flip"/>')
    .replace(/<w:jc w:val="left"\/>/g, '<w:jc w:val="right"/>')
    .replace(/<w:jc w:val="__flip"\/>/g, '<w:jc w:val="left"/>')
    .replace(
      /<w:pgMar w:top="(\d+)" w:right="(\d+)" w:bottom="(\d+)" w:left="(\d+)"/,
      (_, top, right, bottom, left) =>
        `<w:pgMar w:top="${top}" w:right="${left}" w:bottom="${bottom}" w:left="${right}"`,
    )
    .replace("<w:docGrid", "<w:bidi/><w:docGrid")
}

/**
 * List bullets hang off the start of the line, which moves to the right. The
 * marker needs its own direction too: with only the indent mirrored, Word
 * anchors the glyph on the right indent but still draws it rightwards, which
 * puts it out in the margin.
 */
const mirrorNumbering = (source) =>
  source.replace(/<\/w:rPr><\/w:lvl>/g, "<w:rtl/></w:rPr></w:lvl>")

// --- Output ----------------------------------------------------------------
function write(target, parts) {
  const out = new PizZip(readFileSync(SOURCE))
  for (const [name, content] of Object.entries(parts)) out.file(name, content)

  // Word refuses the whole file over a single unbalanced tag, and the error it
  // reports points at a byte offset rather than at the paragraph, so the count
  // is checked here where the cause is still obvious.
  const rebuilt = out.file("word/document.xml").asText()
  const count = (pattern) => (rebuilt.match(pattern) ?? []).length
  const opened = count(/<w:p(?: [^>]*)?>/g) - count(/<w:p(?: [^>]*)?\/>/g)
  const closed = count(/<\/w:p>/g)
  if (opened !== closed) {
    throw new Error(
      `${target} has unbalanced paragraphs: ${opened} opened, ${closed} closed`,
    )
  }

  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, out.generate({ type: "nodebuffer" }))
  console.log(`template written to ${target}`)
}

write(TARGETS.ltr, { "word/document.xml": document })
write(TARGETS.rtl, {
  "word/document.xml": mirrorDocument(document),
  "word/numbering.xml": mirrorNumbering(
    zip.file("word/numbering.xml").asText(),
  ),
})
