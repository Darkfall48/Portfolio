---
name: spellcheck-portfolio
description: Checks spelling and typos in portfolio changes (UI copy, locales, comments, README). Use after implementing a change, or when the user asks to proofread or check spelling.
---

# Spellcheck portfolio

Review **changed files only**. List issues, then propose fixes. Do not apply edits until the user approves.

## Scope

- User-visible strings: locale JSON (`en` / `fr` / `he`), `title` attributes, buttons, README
- Comments and JSDoc (English)
- Do not "fix" proper nouns, protocol names, or product trademarks in copy (SAML, SCIM, SSO, LDAP, Entra ID, and similar)

## Output

```
Spelling
- [file:line] current → proposed (why)
```

If nothing is wrong, say so in one line. If the user approves, apply only the accepted items.
