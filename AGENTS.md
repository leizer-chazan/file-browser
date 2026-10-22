<!-- bmad:context -->
<!-- Verified 2026-10-22 against a5b1262. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## Folio

Read-only, browser-only local file explorer. React 19 + TypeScript + Vite, tested with Vitest, linted with Oxlint. Planning output lives in `_bmad-output/`.

## Policy

- Never push or merge to `master` — every push deploys to GitHub Pages. Work on feature branches (currently `feat/folder-insights`); committing there is fine, pushing is the user's call.
- Read-only, local-only rules (no network, no persistence, no writes to picked files) live in `.claude/rules/no-persistence.md`; `src/lib/` rules live in `.claude/rules/lib-framework-free.md`.
- Never add a dependency without asking first.
- Never hand-edit `_bmad-output/`; change it only through the BMAD workflows.

## Running and verifying

- Nothing is done until `npm run check` passes — CI runs only `npm run build`, so lint and tests are checked nowhere else.
- `npm run check` exits 0 on lint warnings; read the Oxlint output and fix warnings, don't just check the exit code.

## Conventions that differ from defaults

- Style only through CSS variables in `src/tokens.css`; no inline styles, no new CSS files.

## Known pitfalls

- Keep each file's existing line endings — the tree mixes CRLF and LF with no `.gitattributes`, and a converted file turns a few-line change into a whole-file diff.
- Do only what was asked; put extra ideas in the summary instead of the code — agents have added unrequested features (e.g. a refresh timer).
- Don't call `Date.now()` or other impure functions during render (Oxlint `react(purity)`); take "now" from state or props.

<!-- /bmad:context -->
