---
name: Folio
status: final
updated: 2026-10-25
sources:
  - ../../prds/prd-file-browser-2026-10-25/prd.md
---

# Folio v2 — Experience Spine (Folder Insights)

## Foundation

Brownfield. Folio v1 ships as a single-page React app for **desktop Chrome only** (PRD §6). It uses no UI library. The visual reference is `DESIGN.md`, which is limited to `src/tokens.css`. This spine covers v1 only where Folder Insights touches it; everything else in v1 stays as it is.

Behavior rules come from the PRD and are not repeated here. They are referenced by FR number, and the terms follow PRD §3.

## Information Architecture

v1 layout, unchanged: top bar · sidebar (folder picker, search, tree) · content area (breadcrumb toolbar · preview column · inspector).

| Surface | Reached from | Purpose | New in v2 |
|---|---|---|---|
| Welcome | App open, no folder | Pick a folder | — |
| Folder preview | Select a folder in the tree | Folder name and item count | Adds the **Folder insights** button |
| File preview | Select a file | Preview and metadata | — |
| **Folder Insights** | The "Folder insights" button on Folder preview | Size by type and top 10 for the selected folder | **Yes** |

Folder Insights takes the place of the preview column's content. The tree, breadcrumb, and inspector stay visible, so the user keeps their place and can change the selection during a scan (FR-7). It is a view mode of the folder preview, not a route or a dialog.

## Voice and Tone

Plain, short, factual. Counts come before words. The PRD's exact wording is used for the skipped messages.

| Element | Copy |
|---|---|
| Open button | "Folder insights" |
| Close button | "Close" |
| Kicker | "FOLDER INSIGHTS" |
| Counter | "{N} files processed" (N with thousands separators) |
| Section titles | "Size by type" · "Top 10 largest files" |
| Table headers | "Type", "Size" · "File", "Size" |
| No-extension row | "(no extension)" (PRD FR-3) |
| Skipped | "1 file skipped" / "N files skipped"; "1 folder skipped" / "N folders skipped" (PRD FR-5, word for word); joined with " · " when both apply |
| Empty folder | "No files in this folder" in both tables |

Avoid: "Analyzing…", "Oops", percentages, and judgments ("huge", "wasted space").

## Component Patterns

| Component | Behavior |
|---|---|
| Folder insights button | Shown only when a folder (including the root) is selected and Insights is closed (FR-10). Activating it opens Insights and starts a new scan (FR-7). |
| Close button | Replaces the open button while Insights is open. Stops a running scan and returns to the folder preview (FR-7). |
| Scan counter | The only scan output while the scan runs (FR-2). Updates as files are processed; the column stays scrollable (NFR-1). |
| Size by type table | Appears only when the scan finishes. Sorted by FR-1. Labels follow PRD §3 (lowercase, no dot). Sizes use v1's `formatFileSize` (FR-9). Read-only; rows are not interactive. |
| Top 10 list | Appears with the table. Order follows FR-4. Each row shows the full path relative to the selected folder and its size. A long path is cut with an ellipsis, and the full path is in a tooltip. Rows are not interactive. |
| Skipped notice | Shown above the tables only when something was skipped (FR-5). Absent otherwise. |

## State Patterns

| State | Trigger | Treatment |
|---|---|---|
| Unavailable | A file is selected, or nothing is | No button is shown (FR-10). |
| Scanning | The view opens, or another folder is selected while it is open | Only the heading and the counter card. No tables and no partial numbers (FR-2). |
| Done, normal | The scan ends | Heading → [skipped notice] → Size by type → Top 10. |
| Done, empty | The folder has no files, or only empty folders | Both sections show their empty row; no error (FR-8). |
| Done, fewer than 10 files | — | The list shows all files and the title stays "Top 10 largest files" (FR-4). |
| Folder changed | Another folder is selected while the view is open | Old results disappear at once, and a new scan begins at 0. Nothing from the previous folder is shown (FR-7). |
| File selected | A file is selected while the view is open | Insights closes and the file preview opens (FR-7). |
| Closed mid-scan | Close is pressed during a scan | The scan stops. Reopening starts again from 0 (FR-7). |

Results are a snapshot (PRD §3). The view does not refresh itself, and there is no re-scan button: to scan again, close and reopen.

## Interaction Primitives

- Insights works with mouse or keyboard. Both buttons are native `<button>` elements and work with Tab, Enter, and Space.
- No new keyboard shortcuts. `Esc` does not close Insights, because it is a view and not a dialog.
- The tree stays fully interactive during a scan. Selecting another folder there changes what is scanned.
- Opening Insights moves focus to the Close button. Closing returns focus to the Folder insights button.

## Accessibility Floor

Baseline: desktop Chrome with keyboard and screen reader.

- The counter is in an `aria-live="polite"` region, throttled to about one announcement a second so screen readers are not flooded.
- When the scan ends, a polite announcement reads "Scan complete", plus the skipped text when there is any.
- Size by type is a real `<table>` with column headers; Top 10 is a real `<ol>`. Sizes are text, not only visual alignment.
- Truncated paths keep the full text available to assistive tech, not only in a hover tooltip.
- Contrast comes from the existing tokens. Nothing new is introduced (see DESIGN.md).

## Key Flows

### Flow 1 — Why is this project 8 GB? (Leizer, desktop Chrome; mirrors PRD UJ-1)

1. Leizer has a project folder open in Folio and selects it in the tree. The folder preview shows its name and item count, with **Folder insights** in the heading.
2. Leizer clicks it. The preview card is replaced by a counter, "1,204 files processed", which keeps climbing. Leizer scrolls the column, and the tree still responds.
3. The scan ends. The counter is replaced by the results. A notice reads "3 files skipped".
4. **Climax:** the first row of *Size by type* is `mp4`, far ahead of the rest. Below, *Top 10 largest files* begins with three `screen-recordings/…/*.mp4` paths. Leizer now knows exactly where the 8 GB went, without expanding a single branch.
5. Leizer clicks one of those recordings in the tree. Insights closes and the file's details open.

Edge: Leizer selects a different subfolder in the middle of the scan. The counter resets to 0 for the new folder, and nothing from the first folder appears.

## Out of Scope

- Clicking a top-10 row to reveal the file in the tree. It is not in the PRD; a possible future addition.
