---
name: commit-portfolio
description: Writes portfolio git commits in the project subject format. Use only when the user asks to commit portfolio changes or invokes /commit-portfolio.
disable-model-invocation: true
---

# Commit portfolio

## Before anything else

Run `pre-commit-review-portfolio` on the current diff. If it is not ready, stop, apply only the corrections the user accepts, and re-run the review. Do not propose a commit title until the verdict is **Ready to commit: yes**.

Never run `git commit` until the user has explicitly approved. First propose the title, then ask which option they want.

## Approval (required)

Present the proposed subject, then ask:

1. **Title only** — give the user the commit title and stop. They commit themselves.
2. **Agent commits** — wait for a clear yes, then create the commit with that title.

If they pick neither, or only say "ok" without choosing, ask again. Do not commit.

## Subject format

Do not use Conventional Commits (`feat:`, `fix:`).

```text
Portfolio - Frontend - <Area> - Implemented|Improved|Fixed|Updated|Enhanced|Migrated: <why>
```

| Verb        | When                               |
| ----------- | ---------------------------------- |
| Implemented | New behaviour, section, or page    |
| Improved    | Existing behaviour, better UX      |
| Fixed       | Bug                                |
| Updated     | Copy, content, or alignment change |
| Enhanced    | Extra safety, a11y, or robustness  |
| Migrated    | Tooling or stack move              |

```text
Portfolio - Frontend - Layout - Implemented: desktop bento home
Portfolio - Frontend - i18n - Implemented: Hebrew RTL locale
Portfolio - Frontend - Header - Fixed: language switcher clipped in RTL
```

## Rules

- One subject, one concern.
- Area is the section, component, or topic (e.g. `Header`, `Work panel`, `i18n`).
- The part after the colon is the why, not a file list.
- Never commit `.env`, secrets, `dist/`, or unapproved screenshots unless the user explicitly asks.
