---
status: draft
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories]
inputDocuments:
  - prds/prd-file-browser-2026-10-25/prd.md
  - architecture/architecture-file browser-2026-10-25/ARCHITECTURE-SPINE.md
  - ux-designs/ux-file-browser-2026-10-25/DESIGN.md
  - ux-designs/ux-file-browser-2026-10-25/EXPERIENCE.md
---

# Folio v2 — Folder Insights - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Folio v2 — Folder Insights, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

Requirement IDs keep the source numbering (PRD `FR-n` / `NFR-n`, architecture `AD-n`) so acceptance criteria trace straight back to the source documents. Terms follow PRD §3 (Glossary).

## Requirements Inventory

### Functional Requirements

FR-1: Size by type (EARS 1) — When the scan of the selected folder finishes, show the total size of all files under that folder grouped by file extension (case-insensitive), sorted by total size descending; equal totals ordered by file type label A→Z. Tests: `a.JPG` 2 MB + `b.jpg` 1 MB + `c.txt` 5 MB → `txt` 5 MB, `jpg` 3 MB; `x.png` 2 MB + `y.gif` 2 MB → `gif`, `png`; `archive.tar.gz` → `gz`; `file.` → "(no extension)".
FR-2: Progress during the scan (EARS 2) — While the folder is being scanned, show the number of files processed so far and do not show partial totals. Test: large folder → only the counter is visible during the scan; the table appears only when the scan ends.
FR-3: Files with no extension (EARS 3) — If a file has no extension, count it under a "(no extension)" group rather than omitting it. Test: `Makefile` 1 KB → "(no extension)" row with 1 KB.
FR-4: Top 10 largest files (EARS 4) — When the scan finishes, list the ten largest files under the folder, each with its full path and size, largest first; equal sizes ordered by full path A→Z ignoring case, then with case as a tiebreak. Tests: `b.bin`/`a.bin` 4 MB + `c.bin` 9 MB → `c.bin`, `a.bin`, `b.bin`; only 3 files → all 3 listed; repeated scan → identical list and order; `B.bin`/`a.bin` 4 MB → `a.bin` first.
FR-5: Skipped files and folders are reported — An unreadable file is left out of both results and counted as skipped; an unreadable subfolder's contents are left out and the folder is counted as skipped. Messages: "1 file skipped" / "N files skipped", "1 folder skipped" / "N folders skipped". A file deleted during the scan is a skipped file. No message when nothing was skipped.
FR-6: Files whose names start with a dot — Included in the scan and both results; `.env` / `.gitignore` have file type `env` / `gitignore`, not "(no extension)". Test: 1 KB `.env` → 1 KB in the `env` row.
FR-7: Opening, closing, and changing the selection — Each open runs a new scan (no separate re-scan action). While open, selecting a different folder (during or after a scan) stops any running scan and scans the new folder. Closing during a scan stops it. Selecting a file closes Folder Insights and shows the file's details. Tests: select B during A's scan → only B's results; select B after A finished → new scan of B; close mid-scan and reopen → new scan from the start; select a file → Insights closes, file details shown.
FR-8: Folder with no file contents — No files, or only empty folders → scan ends at once, both results shown empty, no error. 0-byte files count like any other. Tests: empty folder and only-empty-subfolders → empty table and list, no error; one 0-byte `a.txt` → `txt` row with 0 bytes and `a.txt` in the top 10.
FR-9: Size format — Sizes use the same format Folio v1 uses for file sizes. Test: a file shows the same size text in Insights as in the existing file details.
FR-10: When Folder Insights is available — Can be opened only when a folder (including the root) is selected; not when a file or nothing is selected.
FR-11: Links — The scan does not follow links (symlinks or shortcuts) to other folders; each file is counted once. Test: a folder containing a link to itself → the scan finishes and each file appears once.

### NonFunctional Requirements

NFR-1: Responsiveness — A folder with 10,000 files is scanned to the end while the app stays usable: the file counter keeps updating and the view can be scrolled during the scan. No time target (SM-C1: scan speed is a counter-metric; never show partial totals or skip files to go faster).
CON-1 (PRD §6): Read-only and local-only — no network access, results live only in memory, no writes to the picked files or folders (`.claude/rules/no-persistence.md`).
CON-2 (PRD §6): No new third-party software added to the app.
CON-3 (PRD §6): Desktop Chrome only.
Non-goals (PRD §5): no deleting/moving/renaming, no duplicate detection, no charts or visualizations.

### Additional Requirements

Brownfield — no starter template; Folio v1 already ships. Paradigm: functional core (`src/lib/`) / imperative shell (`src/App.tsx`, `src/hooks/`).

- AD-1: `src/lib/` is framework-free — no React, JSX, `react-dom`, `window`, or `document`; every exported function has a Vitest test next to it (`*.test.ts`); browser objects enter through structural interfaces.
- AD-2: Stale async results are dropped by request ID — the scan takes `const requestId = ++insightsRequest.current` and checks it before every `setState` (the existing `metadataRequest` pattern), **and** passes an `AbortSignal` to the scan. Both are required.
- AD-3: Insights reads from disk, not from the in-memory `File[]` — each scan walks the selected folder through a `FileSystemDirectoryHandle` and calls `getFile()` per file; it never reads `files` state or `ExplorerEntry.file`. Tree, search, and detail pane keep using `File[]` unchanged.
- AD-4: Root handle kept in memory and resolved by path — `chooseFolder` stores the root `FileSystemDirectoryHandle` in React state next to `files`, replaced on every pick, never persisted. The selected folder's handle is resolved by walking `getDirectoryHandle()` over the path segments after the root name; a failed walk is a scan-level error, not a skip. When the root handle is null (`webkitdirectory` fallback), the Folder insights button is not shown.
- AD-5: Scan engine and result shape — `src/lib/folderInsights.ts` owns `scanFolder(dir, { signal, onProgress }): Promise<ScanResult>` (handle interfaces move from `App.tsx` into lib), pure `summarizeByType(records)` and `topLargest(records, 10)` over `{ path, size }[]`, and `ScanResult = { byType: { label, size }[], largest: { path, size }[], filesProcessed, skippedFiles, skippedFolders }`. Sizes are raw bytes, formatted only in the shell with `formatFileSize`. `path` is relative to the selected folder, `/`-joined, without the folder's own name.
- AD-6: Skip classification — `getFile()` rejects → one skipped file, counts toward `filesProcessed`, no record. Subfolder `values()` rejects → one skipped folder, drop everything already collected from it, not counted as a file. Skips never throw out of `scanFolder`; only an abort or a failure to resolve the selected folder rejects.
- AD-7: `getExtensionLabel(name)` in `folderInsights.ts` — text after the last dot, lowercased; `"(no extension)"` when there is no dot or nothing after it; `.env` → `env`. v1 `getFileType` unchanged.
- AD-8: Explicit comparators, no `localeCompare` — `byType`: size desc, then label by code unit. `largest`: size desc, then `path.toLowerCase()` by code unit, then `path` by code unit.
- AD-9: Cycle guard — before descending, `scanFolder` checks `isSameEntry()` against every handle on the ancestor chain; a match is ignored (not scanned, not reported as skipped).
- AD-10: Progress and responsiveness — `onProgress` reports only `filesProcessed`; records stay private until resolve. Yield to the event loop (`setTimeout(0)`) at least once every 200 files. Shell throttles counter state to ~one update per animation frame; the `aria-live` announcement is throttled separately to ~one per second. No Web Worker.
- Insights state lives in `App` as React state: `open`, `status: 'scanning' | 'done' | 'error'`, `count`, `result`. Selecting a file sets `open=false`; changing the folder bumps `insightsRequest` and resets to `scanning`, count 0, result null. Shell state and refs use the `insights*` prefix.
- Errors: a scan-level failure shows one inline message in the Insights view; per-entry failures only change skip counts, never an error.
- Styling only through classes using `src/tokens.css` variables; no inline styles except the existing `--depth` custom property pattern; no new CSS files. Keep each file's existing line endings. No `Date.now()` or other impure calls during render.
- Definition of done for every story: `npm run check` passes with no Oxlint warnings (CI runs only `npm run build`).

### UX Design Requirements

UX-DR1: Folder insights button — native `<button>` labelled "Folder insights", outline style matching `.tree-toolbar-button` (`--line` border, hover/focus `--accent` + `--accent-soft`, `--radius-small`), placed in the preview heading where files show their size chip. Shown only when a folder (including the root) is selected and Insights is closed.
UX-DR2: Close button — native `<button>` labelled "Close", same outline style, in the same place, replacing the open button while Insights is open. Stops a running scan and returns to the folder preview.
UX-DR3: Insights is a view mode, not a route or dialog — it replaces the content of `.preview-column`; tree, breadcrumb, and inspector stay visible and the tree stays fully interactive during a scan. `Esc` does not close it; no new keyboard shortcuts.
UX-DR4: Insights heading — kicker "FOLDER INSIGHTS" (`.section-kicker`) above the folder name in title typography (`.preview-heading h1`), with the Close button.
UX-DR5: Scan counter card — `--surface` background, `--line` border, `--radius-medium`, may use `--shadow` (it takes `.preview-card`'s place); one large number in title typography with thousands separators and the caption "files processed" in data typography, `--ink-faint`; `font-variant-numeric: tabular-nums`. It is the only scan output while scanning — no tables and no partial numbers.
UX-DR6: Screen-reader announcements — the counter sits in an `aria-live="polite"` region throttled to about one announcement per second; when the scan ends a polite announcement reads "Scan complete", plus the skipped text when there is any.
UX-DR7: Size by type table — section title "Size by type" (heading typography); a real `<table>` with column headers "Type" and "Size" in `--ink-faint`; label in `--ink`, size in `--ink-soft`, right-aligned, tabular numbers; `.detail-list` anatomy (1px `--line` frame, `--radius-small`, rows divided by `--line`); full column width; rows not interactive; "(no extension)" styled like any other row.
UX-DR8: Top 10 list — section title "Top 10 largest files" (kept even with fewer than 10 files); a real `<ol>` in the same frame with visible "File" / "Size" labels; each row shows the full path and its size; a long path is cut with an ellipsis, with the full path in a tooltip and available to assistive tech; rows not interactive.
UX-DR9: Skipped notice — `.inspector-footnote` + `.info-icon` anatomy (`--surface-muted`, `--ink-soft`, caption size, `--radius-small`), never `--danger`; PRD FR-5 wording word for word, joined with " · " when both apply (e.g. "3 files skipped · 1 folder skipped"); shown above the tables only when something was skipped.
UX-DR10: Empty state — both sections show a single row "No files in this folder" in `--ink-faint`, `.search-results-empty` style; no error.
UX-DR11: Layout order — heading → [skipped notice] → Size by type → Top 10, separated by the 25px section gap (`.metadata-section` spacing); during a scan the counter card sits where the tables will appear.
UX-DR12: Focus management — opening Insights moves focus to the Close button; closing returns focus to the Folder insights button. Both buttons work with Tab, Enter, and Space.
UX-DR13: Folder changed while open — old results disappear at once and the counter restarts at 0 for the new folder; nothing from the previous folder is shown.
UX-DR14: Token discipline — no new colors, fonts, or CSS variables; `--accent` only on the Insights button's hover/focus, never on data rows; no bars, charts, or percentage meters; new rules go in `src/tokens.css`.
UX-DR15: Voice — plain and factual; avoid "Analyzing…", "Oops", percentages, and judgments ("huge", "wasted space").

### FR Coverage Map

FR-1: Epic 1 - Size by type, size descending, ties by label
FR-2: Epic 1 - File counter only during the scan
FR-3: Epic 1 - "(no extension)" group
FR-4: Epic 1 - Top 10, full path, stable order
FR-5: Epic 1 - Skipped files and folders reported
FR-6: Epic 1 - Dot-names: `.env` → `env`
FR-7: Epic 1 - Open, close, change selection
FR-8: Epic 1 - Empty folder, 0-byte files
FR-9: Epic 1 - Sizes via `formatFileSize`
FR-10: Epic 1 - Available only when a folder is selected
FR-11: Epic 1 - Links not followed, each file counted once
NFR-1: Epic 1 - 10,000 files, app stays usable

## Epic List

### Epic 1: Folder Insights — where did the space go?

Leizer opens Folder Insights on any selected folder and, from one scan of the disk, sees how much space each file type takes and which ten files are the biggest — with anything that couldn't be counted reported, and with results that always belong to the folder currently selected.

**FRs covered:** FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-8, FR-9, FR-10, FR-11 · **NFRs:** NFR-1, CON-1..CON-3

**Implementation notes:**

- One epic: every story touches the same core files (`src/lib/folderInsights.ts`, `src/App.tsx`, `src/tokens.css`), and all planning inputs are final.
- Three vertical slices; after each, something works in the app and `npm run check` is green.
- Two deliberate interim behaviours in Story 1.1, each replaced by a later story:
  - An unreadable file or folder fails the whole scan with the inline error (no silent drop) — replaced by AD-6 skip classification and the skipped notice in Story 1.2.
  - Any selection change while Insights is open closes Insights and aborts the scan — replaced by the full FR-7 behaviour in Story 1.3.
- No dependency on a future epic; the epic builds only on shipped Folio v1.

## Epic 1: Folder Insights — where did the space go?

Leizer opens Folder Insights on any selected folder and, from one scan of the disk, sees how much space each file type takes and which ten files are the biggest — with anything that couldn't be counted reported, and with results that always belong to the folder currently selected.

### Story 1.1: Size by type for the selected folder

As Leizer,
I want to open Folder Insights on a selected folder and see how much space each file type takes,
So that I know which kind of file is filling the folder before I go looking.

**Acceptance Criteria:**

**AC1 — Availability (FR-10, AD-4, UX-DR1)**
**Given** a folder is selected in the tree (including the root) and Folder Insights is closed
**When** the folder preview renders
**Then** a native `<button>` "Folder insights" appears in the preview heading, where files show their size chip, styled like `.tree-toolbar-button`
**And** no button is shown when a file is selected, when nothing is selected, or when no root handle is held (`webkitdirectory` fallback)

**AC2 — Root handle (AD-4)**
**Given** the user picks a folder with `showDirectoryPicker`
**When** `chooseFolder` finishes loading
**Then** the root `FileSystemDirectoryHandle` is kept in React state next to `files`, replaced on every pick, and never persisted
**And** the selected folder's handle is resolved by walking `getDirectoryHandle()` over the path segments after the root name; if that walk fails, the scan ends in the error state (AC9), not as a skip

**AC3 — Opening starts a scan from disk (FR-2, FR-7, AD-3, UX-DR3, UX-DR4, UX-DR5, UX-DR11, UX-DR12)**
**Given** the "Folder insights" button is shown
**When** the user activates it (mouse, Enter, or Space)
**Then** the preview column content is replaced by the Insights heading (kicker "FOLDER INSIGHTS", folder name, "Close" button) and the counter card "{N} files processed", N with thousands separators and tabular numbers
**And** focus moves to the Close button; the tree, breadcrumb, and inspector stay visible and interactive
**And** the scan reads every file with `getFile()` through the folder handle; it never reads `files` state or `ExplorerEntry.file`

**AC4 — Progress without partial totals (FR-2, AD-10, UX-DR6)**
**Given** a scan is running
**When** files are processed
**Then** only the counter is shown — no table and no partial size
**And** `scanFolder` reports only `filesProcessed` through `onProgress`, keeps its records private until it resolves, and yields with `setTimeout(0)` at least once every 200 files
**And** the shell updates counter state at most about once per animation frame, and the `aria-live="polite"` region announces at most about once per second

**AC5 — Size by type result (FR-1, FR-3, FR-6, FR-9, AD-5, AD-7, AD-8, UX-DR7)**
**Given** a scan finishes
**When** the result is shown
**Then** the counter is replaced by the "Size by type" section: a real `<table>` with "Type" / "Size" headers, one row per file type label, sizes right-aligned and formatted only with `formatFileSize`
**And** rows are ordered by size descending, then label in code-unit order (no `localeCompare`)
**And** a polite announcement reads "Scan complete"
**And** these cases hold: `a.JPG` 2 MB + `b.jpg` 1 MB + `c.txt` 5 MB → `txt`, `jpg` (3 MB); `x.png` 2 MB + `y.gif` 2 MB → `gif`, `png`; `archive.tar.gz` → `gz`; `file.` and `Makefile` → "(no extension)"; `.env` 1 KB → `env` 1 KB

**AC6 — Empty folder (FR-8, UX-DR10)**
**Given** the selected folder has no files, or only empty subfolders
**When** the scan finishes
**Then** it finishes at once and the table shows a single row "No files in this folder", with no error
**And** a folder with one 0-byte `a.txt` shows a `txt` row with "0 bytes"

**AC7 — Close and stale-result guard (FR-7, AD-2, UX-DR2, UX-DR12)**
**Given** Insights is open (scanning or done)
**When** the user activates "Close"
**Then** the scan's `AbortController` is aborted, `insightsRequest` is incremented, and no later progress or result from that scan reaches state (every `setState` checks `insightsRequest.current === requestId`)
**And** the folder preview returns and focus goes back to the "Folder insights" button
**And** reopening starts a new scan from 0

**AC8 — INTERIM: any selection change closes Insights (FR-7 partial; replaced in Story 1.3)**
**Given** Insights is open (scanning or done)
**When** the user selects a different entry — from the tree or from search results — or picks a new root folder
**Then** Insights closes exactly as in AC7 (abort + request ID), and nothing from that scan is shown
**And** re-clicking the already-selected folder (to expand or collapse it) does not close Insights

**AC9 — INTERIM: an unreadable entry fails the scan (replaced in Story 1.2 by AD-6)**
**Given** a file's `getFile()` rejects or a subfolder's `values()` rejects during the scan
**When** the scan ends
**Then** Insights shows one inline message, "This folder couldn't be scanned.", in place of the results — no partial table, nothing dropped silently

**AC10 — Lib boundary and tests (AD-1, AD-5)**
**Given** the story is implemented
**Then** `src/lib/folderInsights.ts` holds the handle interfaces (moved from `App.tsx`), `getExtensionLabel`, `summarizeByType`, and `scanFolder(dir, { signal, onProgress })` returning `{ byType, filesProcessed }` (Story 1.2 adds the remaining AD-5 fields), with no React and no `window`/`document`
**And** `src/lib/folderInsights.test.ts` uses fake in-memory handles to cover every case in AC5 and AC6, abort rejecting the scan, and `onProgress` reporting counts only

**AC11 — Definition of done**
**Then** `npm run check` passes with no Oxlint warnings; styles live only in `src/tokens.css` using existing variables; each touched file keeps its line endings; nothing impure (`Date.now()`, `requestAnimationFrame`) runs during render
**And** the DESIGN.md / EXPERIENCE.md floor holds (UX-DR3, UX-DR14, UX-DR15): sizes and the counter use `font-variant-numeric: tabular-nums`; `--accent` appears only on the Insights button's hover/focus; no new CSS variables, colors, or fonts; no bars, charts, or percentages; `Esc` does not close Insights and no keyboard shortcut is added; no copy such as "Analyzing…", "Oops", percentages, or judgments
**And** AC3, AC7 and AC8 are verified manually in the running app (`npm run dev`): open, close, select another entry, re-click the selected folder — steps and results listed in the story's completion notes

### Story 1.2: Top 10 largest files and honest skip reporting

As Leizer,
I want to see the ten biggest files by path, and be told when something couldn't be counted,
So that I can decide what to deal with and trust that the totals are complete.

**Acceptance Criteria:**

**AC1 — Top 10 list (FR-4, FR-9, AD-5, AD-8, UX-DR8, UX-DR11)**
**Given** a scan finishes
**When** the result is shown
**Then** a "Top 10 largest files" section appears below "Size by type": a real `<ol>` in the same frame with visible "File" / "Size" labels, each row showing the full path and its size formatted with `formatFileSize`
**And** the full path is relative to the selected folder, `/`-joined, without the folder's own name (e.g. `videos/clip.mp4`)
**And** a long path is cut with an ellipsis by CSS; the full path stays in the DOM text for assistive tech and in a tooltip; rows are not interactive

**AC2 — Top 10 order (FR-4, AD-8, SM-2)**
**Given** files of various sizes
**When** the list is built
**Then** it is ordered by size descending, then `path.toLowerCase()` by code unit, then `path` by code unit (no `localeCompare`)
**And** these cases hold: `b.bin`/`a.bin` 4 MB + `c.bin` 9 MB → `c.bin`, `a.bin`, `b.bin`; `B.bin`/`a.bin` 4 MB → `a.bin` first; a folder with only 3 files → all 3, title still "Top 10 largest files"; scanning the same folder twice → identical list and order

**AC3 — Empty folder (FR-8, UX-DR10)**
**Given** the selected folder has no files, or only empty subfolders
**When** the scan finishes
**Then** the Top 10 section also shows the single row "No files in this folder"
**And** a folder with one 0-byte `a.txt` lists `a.txt` with "0 bytes"

**AC4 — Skipped files (FR-5, AD-6) — replaces Story 1.1 AC9 for files**
**Given** a file's `getFile()` rejects during the scan — including a file deleted while the scan runs
**When** the scan finishes
**Then** that file counts as one skipped file and toward `filesProcessed`, and appears in no Size by type row and not in the Top 10
**And** the scan no longer fails with "This folder couldn't be scanned." for this case

**AC5 — Skipped folders (FR-5, AD-6) — replaces Story 1.1 AC9 for subfolders**
**Given** iterating a subfolder (`values()`) rejects during the scan
**When** the scan finishes
**Then** that subfolder counts as one skipped folder (not a file), and every record already collected from it, at any depth, is dropped from both results
**And** files already reached inside it stay in `filesProcessed` (the counter never goes backwards)
**And** if the **selected folder itself** cannot be iterated, the scan still ends in the "This folder couldn't be scanned." error — the glossary defines a skipped folder as one *inside* the selected folder

**AC6 — Skipped notice (FR-5, UX-DR6, UX-DR9, UX-DR11)**
**Given** a scan finishes with skips
**When** the result is shown
**Then** a notice in the `.inspector-footnote` + `.info-icon` style (never `--danger`) appears above the tables, worded exactly "1 file skipped" / "N files skipped" and "1 folder skipped" / "N folders skipped", joined with " · " when both apply
**And** the "Scan complete" announcement includes the same skipped text
**And** when nothing was skipped, no notice is rendered

**AC7 — Links and cycles (FR-11, AD-9)**
**Given** a subfolder whose handle `isSameEntry()` matches any folder on the current ancestor chain
**When** the scan reaches it
**Then** it is ignored — not scanned and not counted as skipped
**And** a folder that contains a link to itself finishes, and each file appears once

**AC8 — Result shape and lib tests (AD-1, AD-5, AD-6, AD-9)**
**Given** the story is implemented
**Then** `ScanResult` is the full AD-5 shape (`byType`, `largest`, `filesProcessed`, `skippedFiles`, `skippedFolders`); `topLargest(records, 10)` is pure and synchronous; the handle interfaces gain `isSameEntry`; skips never throw out of `scanFolder` — only an abort or a failure on the selected folder rejects
**And** `folderInsights.test.ts` covers every case in AC2–AC5 and AC7 with fake handles, including a nested unreadable folder whose deeper records are dropped and a cycle through a fake handle; skip coverage in this story lives in these lib tests

**AC9 — Definition of done**
**Then** `npm run check` passes with no Oxlint warnings; styles only in `src/tokens.css` using existing variables; line endings kept
**And** verified manually in the running app (`npm run dev`): Top 10 sizes match the file details pane for the same files (FR-9), and no skipped notice is shown when nothing was skipped — steps and results listed in the story's completion notes (the deleted-file-mid-scan check is in Story 1.3)

### Story 1.3: Insights follows the selection and holds up on big folders

As Leizer,
I want Folder Insights to follow the folder I select and to stay usable while it scans a large folder,
So that the numbers on screen always belong to the folder I'm looking at, and I'm never stuck waiting.

**Acceptance Criteria:**

**AC1 — Selecting another folder rescans (FR-7, AD-2, UX-DR13) — replaces Story 1.1 AC8 for folders**
**Given** Insights is open (scanning or done)
**When** the user selects a different folder — from the tree or from search results
**Then** Insights stays open: the running scan is aborted, `insightsRequest` is incremented, and state resets to `scanning`, count 0, result null
**And** the previous results disappear at once, the heading shows the new folder's name, and a new scan of that folder starts
**And** these cases hold: selecting B during A's scan → only B's results appear; selecting B after A's scan finished → a new scan of B starts
**And** focus stays where the user put it (the tree row); it does not move to Close

**AC2 — Selecting a file closes Insights (FR-7) — replaces Story 1.1 AC8 for files**
**Given** Insights is open (scanning or done)
**When** the user selects a file — from the tree or from search results
**Then** the scan is aborted and the request ID bumped as in Story 1.1 AC7, Insights closes, and the file's preview and details are shown

**AC3 — Picking a new root folder closes Insights**
**Given** Insights is open
**When** the user picks a new folder with the picker
**Then** Insights closes as in Story 1.1 AC8 (the root handle is replaced and v1 resets the selection to the new root)

**AC4 — Unchanged behaviours stay**
**Given** Insights is open
**When** the user re-clicks the already-selected folder, or closes and reopens Insights
**Then** re-clicking does not restart or close the scan, and close + reopen starts a new scan from 0 (Story 1.1 AC7)
**And** the interim "any selection change closes Insights" code path is removed — no dead branch is left

**AC5 — 10,000 files, automated (NFR-1, AD-10)**
**Given** a fake folder of 10,000 files in `folderInsights.test.ts`
**When** `scanFolder` runs
**Then** it resolves with `filesProcessed` 10,000 and correct totals, `onProgress` is called repeatedly with increasing counts, and the scan yields with `setTimeout(0)` at least 50 times (once every ≤ 200 files)

**AC6 — 10,000 files, in the app (NFR-1, SM-4)**
**Given** a real folder of 10,000 files on desktop Chrome, generated outside the repo (the command used is recorded in the completion notes)
**When** the user opens Folder Insights on it
**Then** the scan finishes, the counter keeps visibly climbing throughout, the column can be scrolled, and the tree can be scrolled during the scan
**And** the final result shows all 10,000 files counted

**AC7 — Deleted file mid-scan, in the app (FR-5)**
**Given** a scan of the 10,000-file folder is running
**When** the user deletes a file the scan has not reached yet (e.g. in the last subfolder)
**Then** the result shows "1 file skipped" and that file is in neither table

**AC8 — Folder switch mid-scan, in the app (FR-7, UX-DR13)**
**Given** a scan of the 10,000-file folder is running
**When** the user selects a small subfolder in the tree
**Then** the counter restarts at 0, and only that subfolder's results appear — nothing from the large folder shows up later

**AC9 — Definition of done**
**Then** `npm run check` passes with no Oxlint warnings; line endings kept; nothing impure runs during render
**And** AC1–AC4 and AC6–AC8 are verified manually in the running app (`npm run dev`), with steps and results listed in the story's completion notes
