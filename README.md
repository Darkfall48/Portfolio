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

| What                 | Files                                                                  |
| -------------------- | ---------------------------------------------------------------------- |
| Name, links, CV path | `src/content/profile.ts`                                               |
| Roles                | `src/content/experience.ts` + `experience.<id>.*` in all three locales |
| Work                 | `src/content/work.ts` + `work.<id>.*` in all three locales             |
| Skill groups         | `src/content/skills.ts` + `skills.<id>` in all three locales           |

Home only shows items with `featured: true` and without `hidden: true`. Set `hidden: true` to keep an entry off the home without deleting it.

### Public CV

Put a PDF in `public/cv/` (for example `public/cv/sidney-sebban.pdf`) and set `cvPath` in `src/content/profile.ts` to `cv/sidney-sebban.pdf`. Leave `cvPath` empty to hide the download control. Do not commit the `CVs/` folder.

Anything under `public/` is published. Strip the phone number from the PDF before adding it.

### Portrait

Put a square image in `public/img/` (for example `public/img/sidney-sebban.jpg`) and set `photoPath` in `src/content/profile.ts` to `img/sidney-sebban.jpg`. Leave `photoPath` empty to hide the photo.

The portrait never renders larger than about 84 px, so ship a tight head-and-shoulders crop at 512x512 and under 100 kB. Keep untouched originals in `assets-src/`, which is ignored by git and never published.

## Stack notes

- Production `base` is `/Portfolio/`. Local dev uses `/`.
- No Redux, no backend, no secrets in source.
