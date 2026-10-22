# Level 4, exercise 3 — BMAD install and its cost

- Installed: BMAD v6.12.4 — modules `core` + `bmm`, IDE `claude-code` (see `_bmad/_config/manifest.yaml`).
- Languages: conversation in Hebrew, documents in English.
- Skills added: 29 `bmad-*` skills under `.claude/skills/` (43 skills visible in total).
- Context cost: ~2,500 tokens on every turn — names + descriptions only (from `/skills`; e.g. bmad-spec ~130, bmad-ux ~80).
  Full skill bodies (~60K tokens together) load only when a skill is invoked.
- Survives a re-install untouched: `_bmad/custom/`.
- Regenerated on every install (don't edit by hand): `_bmad/config.user.toml`.
- Not committed by design: `_bmad/render/` has its own `.gitignore`.