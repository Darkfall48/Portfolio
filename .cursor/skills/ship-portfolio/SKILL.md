---
name: ship-portfolio
description: Finishes a portfolio change with locales, convention review, and UI verification. Use when the user asks to ship, finish, or wrap up a portfolio change.
---

# Ship a portfolio change

Run this after the code change works. Do not skip locales. Do not commit from this skill — `commit-portfolio` runs only if the user asks.

## Checklist

```
- [ ] Copy in en, fr, and he (no hardcoded UI strings)
- [ ] Content facts in src/content/ when the change is data, not chrome
- [ ] SCSS partial registered in main.scss if styles were added
- [ ] /spellcheck-portfolio + /review-conventions-portfolio (propose, wait for approval)
- [ ] /verify-portfolio-ui if layout, panels, or locales changed
```

## After

If the user wants a commit, tell them to run `/commit-portfolio` (title only vs agent commit). Do not commit here.
