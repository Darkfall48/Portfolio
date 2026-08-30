// Dumps the paragraph structure of a .docx so the template can be built against
// real paragraph properties instead of guesswork. Read-only, dev tooling only.
import { readFileSync } from "node:fs"
import PizZip from "pizzip"

const path = process.argv[2]
if (!path) {
  console.error("usage: node scripts/cv/inspect-docx.mjs <file.docx> [raw indexes] [--num ids]")
  process.exit(1)
}

const args = process.argv.slice(3)
const rawWanted = new Set(args.filter((a) => /^\d+$/.test(a)).map(Number))
const numWanted = args.includes("--num")
  ? args[args.indexOf("--num") + 1].split(",")
  : []

const zip = new PizZip(readFileSync(path))
const xml = zip.file("word/document.xml").asText()

const body = xml.slice(xml.indexOf("<w:body>"), xml.indexOf("</w:body>"))
const paragraphs = body.match(/<w:p(?: [^>]*)?>[\s\S]*?<\/w:p>|<w:p(?: [^>]*)?\/>/g) ?? []

const text = (p) =>
  p
    .replace(/<w:tab[^>]*\/>/g, "\t")
    .replace(/<w:br[^>]*\/>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")

paragraphs.forEach((p, i) => {
  const pPr = p.match(/<w:pPr>[\s\S]*?<\/w:pPr>/)?.[0] ?? ""
  const numId = pPr.match(/<w:numId w:val="(\d+)"/)?.[1]
  const ilvl = pPr.match(/<w:ilvl w:val="(\d+)"/)?.[1]
  const style = pPr.match(/<w:pStyle w:val="([^"]+)"/)?.[1]
  const ind = pPr.match(/<w:ind [^>]*\/>/)?.[0] ?? ""
  const sizes = [...p.matchAll(/<w:sz w:val="(\d+)"\/>/g)].map((m) => m[1])
  const runs = (p.match(/<w:r(?: [^>]*)?>/g) ?? []).length
  const bold = /<w:b\/>/.test(p)
  const underline = /<w:u /.test(p)

  const tags = [
    style && `style=${style}`,
    numId && `num=${numId}/${ilvl}`,
    sizes.length && `sz=${[...new Set(sizes)].join(",")}`,
    `runs=${runs}`,
    bold && "b",
    underline && "u",
    ind && ind.replace(/<w:ind |\/>/g, "").trim(),
  ]
    .filter(Boolean)
    .join(" ")

  console.log(`[${String(i).padStart(3, "0")}] ${tags}`)
  console.log(`      ${JSON.stringify(text(p))}`)
  if (rawWanted.has(i)) console.log(`      RAW ${p}`)
})

console.log(`\ntotal paragraphs: ${paragraphs.length}`)

if (numWanted.length) {
  const numbering = zip.file("word/numbering.xml").asText()
  for (const id of numWanted) {
    const num = numbering.match(
      new RegExp(`<w:num w:numId="${id}"(?: [^>]*)?>[\\s\\S]*?</w:num>`),
    )?.[0]
    const abstractId = num?.match(/<w:abstractNumId w:val="(\d+)"/)?.[1]
    const abstract = numbering.match(
      new RegExp(
        `<w:abstractNum w:abstractNumId="${abstractId}"(?: [^>]*)?>[\\s\\S]*?</w:abstractNum>`,
      ),
    )?.[0]
    const level0 = abstract?.match(/<w:lvl w:ilvl="0"[\s\S]*?<\/w:lvl>/)?.[0]
    console.log(`\nnumId ${id} -> abstract ${abstractId}`)
    console.log(level0 ?? "  (not found)")
  }
}
