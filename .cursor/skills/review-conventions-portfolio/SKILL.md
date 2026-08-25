---
name: review-conventions-portfolio
description: Compares portfolio changes to active project rules and skills and proposes convention fixes. Use after implementing a feature, or when the user asks to check conventions.
---

# Review portfolio conventions

Read **active** bullets only in `.cursor/rules/*.mdc` and `.cursor/skills/*/SKILL.md`. Ignore `.cursor/rules/_parked.md`. Do not reintroduce parked rules.

## Check against

- Guardrails: Vite + React + TypeScript + SCSS, no Redux, no backend, no secrets, i18n strings, content lists in `src/content/`, English comments
- Content/voice: data-driven headline, no filler adjectives, no bootcamp names on home, no phone in the UI, no employer screenshots unless approved
- Architecture: content lists vs locales, map over data (no one-off cards), semantic HTML, kebab-case classes, no CSS in TSX, import order, propose generics (wait for approval)
- SCSS: `@use` in `main.scss`, `pages/` vs `cmps/`, `&-` nesting, logical properties, `$break-narrow`
- i18n: three locales, `lang`/`dir`, RTL, untranslated protocol names

## Output

Propose diffs. Do not apply until the user approves.

```
Conventions
- [file] what is off → what to change (which rule/skill)
```

If the change already matches, say so in one line.
