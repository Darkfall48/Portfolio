---
name: pre-commit-review-portfolio
description: Re-checks portfolio changes before a commit (spelling, active rules, secrets, structure). Use when the user is about to commit, asks to review the diff, or invokes /pre-commit-review-portfolio.
---

# Pre-commit review portfolio

Gate before `/commit-portfolio`. Do not commit from this skill.

## Steps

1. Follow `spellcheck-portfolio` on the diff.
2. Follow `review-conventions-portfolio` on the diff.
3. Check **import order** against the frontend rule: `//? Libraries` → Content / i18n → Components → Hooks → Config → Icons.
4. Check structure: one concern per file, SCSS partial registered in `main.scss`, no leftover `console` debug, no `.env` or secrets in the diff, no unapproved product screenshots.
5. Confirm locale keys used in TSX exist in `en`, `fr`, and `he`.
6. Ignore `.cursor/rules/_parked.md`. Do not fail the review for a parked convention.

## Verdict

```
Pre-commit
- Spelling: OK | N issues
- Conventions: OK | N issues
- Order / structure / i18n keys: OK | N issues
- Ready to commit: yes | no
```

If **no**: list concrete corrections. Ask the user what to apply. Re-run this skill after fixes. Only then may `/commit-portfolio` continue.

If **yes**: tell the user it is safe to run `/commit-portfolio` (title only vs agent commit).
