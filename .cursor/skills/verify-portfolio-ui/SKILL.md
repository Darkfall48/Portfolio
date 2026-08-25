---
name: verify-portfolio-ui
description: Verifies portfolio UI in the browser across locales, RTL, desktop layout, and mobile stack. Use after changing layout, copy, language switcher, or panels.
---

# Verify portfolio UI

A single screenshot is not enough. Exercise the page the way a recruiter would.

## Minimum path

1. Desktop ≥1280×800: layout holds together; open one work/experience panel and close it.
2. Language: switch `EN` → `FR` → `עב`. Copy updates; `lang` and `dir` match; Hebrew is RTL with no clipped chrome.
3. Mobile: viewport below `$break-narrow` (768px). Tiles stack; switcher, CV, and contact stay reachable.
4. Keyboard: tab through header, tiles, panel close. `prefers-reduced-motion`: no large motion.
5. If a panel or locale was changed, open it once in EN and once in HE.

## If something breaks

Fix it and re-run the same path before stopping.
