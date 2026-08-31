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
npm run cv:sample -- en "" ad.txt     # render what the builder would tailor for that job ad
npm run cv:match                      # replay every ad in scripts/cv/ads and the matcher's traps
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

### Matching a job offer

Paste an ad into the builder and it scores the CV against it, in the browser, with no model and no network. The wiring is two lists over the same inventory:

- Lines carry `skills` in `src/content/cv.ts`: the inventory ids that line is evidence for. A tag is a claim the line can back in an interview, not a keyword sprinkled on it. It may name a tool the skills section never prints, because demonstrating something and listing it are not the same thing.
- Chips carry `aliases` in `src/content/skills.ts`, for the other ways an ad writes the same tool (`Azure AD` for `Entra ID`, `M365` for Microsoft 365). Terms are matched whole and tolerant of a plural, of a hyphen, and of wherever the ad wrapped its lines — an ad that breaks `Docker Compose` across two lines still means Compose. Word boundaries would not do, since half the vocabulary ends in punctuation.
- `ambiguousTerms` lists the vocabulary that is also an ordinary word, matched case-sensitively so that `React` counts and `react quickly` does not. The same rule separates `Node` from a cluster node, `Teams` from cross-functional teams, `Vue` from `en vue de`, and `Chef` from `chef de projet`. Case cannot save a word that also opens a sentence, so `Go` is only recognised as `Golang`, and `Swift` is left out: `Swift resolution` is ad boilerplate and neither language is near the roles this CV targets.
- Presets carry `roleTerms` in `src/content/cv.ts`: how an ad names that job, in all three languages at once, since the ad's language has nothing to do with the one the site is being read in. Only multi-word titles — a bare "support" appears in every ad ever written.

Matching only against your own inventory can never report what you lack, so `unclaimedSkills` lists neighbouring technology the CV does not claim — Kubernetes, Terraform, a SIEM. An ad naming those gets a plain answer instead of silence. Move an entry into `skillChips` the day it becomes defensible.

Tailoring then picks an angle rather than packing the page: the full document already fits, so filling to the budget would hand back the full document whatever the ad said. What an angle really does is leave out what dilutes it, and that judgement is already in `cvPresets`. The offer picks an angle, overrules it wherever it asked for something the angle had dropped, and the page is trimmed from the least relevant end if that pushes it over. Landing on an angle also renames the download, exactly as clicking it would.

The job title picks the angle, and the tools only break a tie. Measured over the ad corpus, all three angles routinely covered the same 84% of an ad's tools, because the tools are largely shared; the choice then fell to whichever preset happened to be leanest, which means nothing. An ad states the role it is hiring for in its first line, and that is what a recruiter screens on. The tie-break is coverage times density — coverage alone rewards the roomiest angle for having room, density alone rewards the smallest.

What an ad insists on counts double what it merely hopes for, and a gap against a requirement is not a gap against a wish. The colon tells the two apart: `Nice to have:` opens a list and everything under it is a wish, while `Kubernetes exposure a plus` is an aside and demotes only its own sentence — plenty of ads close a paragraph that way and then carry on with requirements. A list runs until the ad opens another one, so a `Nice to have:` cannot swallow the `Networking basics:` behind it. The headings live in `bonusHeadings`, in all three languages like `roleTerms`.

Tailoring reports what it did rather than silently rewriting a hundred rows: the angle it chose, the job title that chose it, how many lines it added and removed, and an undo. A marked row names the tools it answers on hover, because the tags behind a line are a judgement its wording does not show. Recognised terms are listed for the same reason — case-sensitivity handles the ordinary words, but nothing catches a false positive that opens a sentence, and only the eye can tell.

A chip can sit in the inventory without appearing in the CV, and `m365` does: the estate bullet claims the tenant, the skills line has no room to repeat it, and an ad asking for Microsoft 365 must not be answered by the Office suite sitting further down that line. Vocabulary and printed content are the same list on purpose, but they do not have to be the same subset of it.

### Trusting the matcher

`npm run cv:match` replays every ad in `scripts/cv/ads` and must land each one on the angle its file name claims, on one page. Add an ad by dropping `<angle>-<locale>-<n>.txt` in that folder; the file name is the expectation. The ads are written for this repository, not scraped: no employer copy, no real posting.

The same run exercises the traps the matcher is known to fall into — the tool against the ordinary word, a term wrapped over two lines, an ad shouted in capitals, a requirement against a wish, an empty box. Without it the matcher is a set of heuristics over prose with nothing holding them in place: a new alias, a retouched `dropSkills` or an extra `roleTerms` entry can reroute an ad, and the presets are now matcher parameters as much as content. The check is what makes them safe to edit.

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
