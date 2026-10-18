---
name: add-feature
description: Use when adding a new small feature to this file-browser (Folio) project — e.g. a new detail-pane field, a tree control, a filter, a badge. Implements the logic as a pure, framework-free helper in src/lib with a focused Vitest test, wires it into src/App.tsx by reusing existing patterns, styles it only with CSS variables in src/tokens.css, then runs the project's check command and commits. Trigger on requests like "add a feature", "show X in the inspector", "add a button that...", or any ask to extend the file browser's UI.
---

# Add a feature to Folio

Follow this order for any new feature in this project:

1. **Logic first, in `src/lib/`.** Write the pure TypeScript logic as functions/types in a new or existing file under `src/lib/` — no React imports (see the `lib-framework-free` rule). Add a focused `*.test.ts` file next to it, following the style of `src/lib/fileTree.test.ts` or `src/lib/textLines.test.ts`.

2. **Wire it into `src/App.tsx`.** Reuse existing patterns instead of inventing new ones:
   - `DetailRow` for a new row in the INFORMATION inspector.
   - The `requestId` guard pattern (see `metadataRequest` / `selectEntry`) for any async result tied to the current selection, so a stale result can't apply to a different file after the user re-selects.
   - Existing button/row classes (e.g. `choose-button`, `tree-row`, `tree-toolbar-button`) before adding a new one.

3. **Style only through `src/tokens.css`.** No inline styles, no new CSS files. Add classes there using the existing `--ink`, `--accent`, `--line`, `--radius-*`, `--transition` custom properties so the feature matches the rest of the app in both appearance and feel.

4. **Respect project rules.** No network calls, no `localStorage`/IndexedDB, no writes back to picked files or folders — read-only, local-only, always.

5. **Run the check command** (`npm run check` — typecheck + lint + tests) and make sure it is fully green before considering the feature done.

6. **Commit** with a descriptive message once the feature works end to end and checks are green.
