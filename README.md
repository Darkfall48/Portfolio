# Portfolio

Personal site for Sidney Sebban. Vite + React + TypeScript + SCSS. English, French, and Hebrew (RTL). Hosted on GitHub Pages at <https://darkfall48.github.io/Portfolio/>.

## Scripts

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
npm run preview
npm run deploy     # build + publish the gh-pages branch
```

Push to `main` also deploys via `.github/workflows/deploy.yml`. In the GitHub repo, set Pages source to the `gh-pages` branch.

## Add or remove content

Facts live in `src/content/`. UI copy lives in `src/locales/en.json`, `fr.json`, and `he.json`. Do not hardcode cards in components.

| What                 | Files                                                                         |
| -------------------- | ----------------------------------------------------------------------------- |
| Name, links, CV path | `src/content/profile.ts`                                                      |
| Roles                | `src/content/experience.ts` + `experience.<id>.*` in all three locales        |
| Work                 | `src/content/work.ts` + `work.<id>.*` in all three locales                    |
| Skill inventory      | `skillChips` in `src/content/skills.ts`                                       |
| Home skill groups    | `skillGroups` in `src/content/skills.ts` + `skills.<id>` in all three locales |
| Generated CV lines   | `src/content/cv.ts` + `cv.doc.*` in all three locales                         |

Home only shows items with `featured: true` and without `hidden: true`. Set `hidden: true` to keep an entry off the home without deleting it.

### Public CV

Put a PDF in `public/cv/` (for example `public/cv/sidney-sebban.pdf`) and set `cvPath` in `src/content/profile.ts` to `cv/sidney-sebban.pdf`. Leave `cvPath` empty to hide the download control. Do not commit the `CVs/` folder.

Anything under `public/` is published. Strip the phone number from the PDF before adding it.

### CV builder

The header opens a builder that ticks the CV apart line by line and downloads a `.docx`. It fills `public/cv/cv-template.docx`, which is the reference Word document with placeholders in place of the text, so the output keeps the reference styles, numbering, fonts, and margins exactly.

```bash
npm run cv:template                   # rebuild both templates from CVs/2026/...docx
npm run cv:extract                    # print the reference wording as JSON, to seed cv.doc
npm run cv:sample -- he 054-0000000   # render every line to .tmp/cv-sample-he.docx, through the app's own generator
npm run cv:pdf -- <in.docx> [out.pdf] # convert with Word, refuse anything over one page
```

`cv:pdf` drives Word through COM, so it needs Windows with Word installed. It is a local step and never runs in the build or the deploy.

Presets tailor the document to a targeted role. Each one is declared in `cvPresets` (`src/content/cv.ts`) as the lines the full document drops in `drop` and the tools it drops in `dropSkills`, with its label under `cv.builder.presets.<id>` in all three locales. Retargeting a CV is a data change there, not a code change. An id in `dropSkills` that is misspelled or never printed drops nothing and says nothing, so check an angle against the page fill after editing it.

A role header follows its bullets rather than carrying its own state: unticking the last bullet unticks the role, ticking one back brings it along, and the header shows a mixed state while only part of the role is kept. The document already drops a role with no bullet under it, so the panel now says out loud what the generator was doing quietly.

Picking a preset also renames the download, following the reference naming (`Sidney Sebban 2026 - IT Specialist`). The role wording lives under `cv.doc.fileTitles.<id>`, plus a `full` entry for the complete document. The field stays editable, and characters Windows rejects are stripped before the file is written.

The phone number is never in the repository. It is typed into the builder, kept in `localStorage`, and injected at generation time; the template ships a `{phone}` placeholder instead. The reference documents under `CVs/` stay ignored by git.

The reference CV takes 823.8 pt of the 830 pt a page offers, so there is no room to add a line without removing one. The builder's fill gauge estimates this; `npm run cv:pdf` is what actually enforces it, since only Word knows where the page breaks.

### Skills

Every tool is named once, in `skillChips` (`src/content/skills.ts`). The home and the CV are two arrangements over those ids, so a name cannot drift between them and a keyword only has to be recognised in one place. A chip carries `cvLabel` when the document spells it out for a machine reader (`Linux` on the home, `Linux (Ubuntu)` in the CV) and `translated` when it is a common noun the CV states in its own language, taken from `cv.doc.skillTerms.<id>`. Everything else is a product name and stays as written in all three locales.

The CV arrangement is `cvSections.skills` (`src/content/cv.ts`): each paragraph holds groups, and each group holds the runs the document separates with a semicolon. `cv.doc.skillLabels.<id>` carries the bold lead-in with its own colon and spacing, and `cv.doc.skillJoin` the run separator, which French writes with a non-breaking space. The paragraph is generated from whatever survived the selection, so a group whose tools are all deselected takes its lead-in with it.

Because the inventory is exhaustive for an applicant tracking system and the home is deliberately curated, adding an ATS keyword to `skillChips` never puts it on the home: it appears only where an arrangement lists it.

### CV languages

The document has its own language picker, separate from the site's: reading the portfolio in one language while applying in another is the normal case. The wording lives under `cv.doc` in all three locales. i18next falls back a whole branch rather than a single leaf, so a half-translated `cv.doc` would drop lines silently — keep the three in step, down to the leaf.

Hebrew renders from `public/cv/cv-template-rtl.docx`, built in the same pass as the Latin one. Word takes reading order from the run, not from the paragraph, so `w:bidi` alone right-aligns the text but still lays the runs out left to right. The mirror sets `w:bidi` on every paragraph, `w:rtl` on the runs that carry document copy, and `w:rtl` on the list levels so the bullets hang off the right. The name, phone and email keep their Latin direction: marking them would reorder the separators around them. Page margins are swapped; `w:lvlJc` is deliberately left alone, since flipping it pushes the bullet glyph out into the margin.

The Hebrew file name keeps the English role wording rather than translating it, so the attachment stays readable to applicant tracking systems that still mangle non-Latin names.

The fill gauge is fitted per language (`GLYPH_WIDTH` in `src/services/cvDocument.ts`). French sits lower than English not because its letters are narrower but because its longer words leave more slack at the end of a line than a character count suggests. The figures come from `npm run cv:pdf` on the full selection: English lands at 99%, French 97%, Hebrew 90%, and the gauge is within two points of each.

### Portrait

Put a square image in `public/img/` (for example `public/img/sidney-sebban.jpg`) and set `photoPath` in `src/content/profile.ts` to `img/sidney-sebban.jpg`. Leave `photoPath` empty to hide the photo.

The portrait never renders larger than about 84 px, so ship a tight head-and-shoulders crop at 512x512 and under 100 kB. Keep untouched originals in `assets-src/`, which is ignored by git and never published.

## Stack notes

- Production `base` is `/Portfolio/`. Local dev uses `/`.
- No Redux, no backend, no secrets in source.
