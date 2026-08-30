//? Content / i18n
import type { CvTemplateData } from "./cvDocument"

/** Served from `public/`, and rebuilt by `npm run cv:template`. */
const TEMPLATE_PATH = "cv/cv-template.docx"

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

export async function renderCvDocx(data: CvTemplateData): Promise<Blob> {
  // Imported on demand: the docx toolchain weighs more than the whole page, and
  // most visitors never open the builder.
  const [{ default: PizZip }, { default: Docxtemplater }] = await Promise.all([
    import("pizzip"),
    import("docxtemplater"),
  ])

  const response = await fetch(`${import.meta.env.BASE_URL}${TEMPLATE_PATH}`)
  if (!response.ok) {
    throw new Error(`CV template unavailable (${response.status})`)
  }

  const template = new Docxtemplater(new PizZip(await response.arrayBuffer()), {
    paragraphLoop: true,
    linebreaks: false,
  })
  template.render(data)

  return template.getZip().generate({ type: "blob", mimeType: DOCX_MIME })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
