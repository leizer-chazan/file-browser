---
name: Folio
description: Read-only, browser-only local file explorer. v2 adds Folder Insights. Every token below already exists in src/tokens.css; this file adds none.
status: final
updated: 2026-10-25
sources:
  - ../../prds/prd-file-browser-2026-10-25/prd.md
  - ../../../../src/tokens.css
colors:
  canvas: '#f8f9fb'          # --canvas
  surface: '#ffffff'         # --surface
  surface-muted: '#f5f6f8'   # --surface-muted
  surface-selected: '#edf2ff' # --surface-selected
  ink: '#20252e'             # --ink
  ink-soft: '#667085'        # --ink-soft
  ink-faint: '#98a0ad'       # --ink-faint
  line: '#e9ebef'            # --line
  accent: '#526fe5'          # --accent
  accent-hover: '#405dcc'    # --accent-hover
  accent-soft: '#eaf0ff'     # --accent-soft
  folder: '#f0b84c'          # --folder
  danger: '#b54747'          # --danger
typography:
  # Single family set on :root: Inter, ui-sans-serif, system-ui, … No new fonts.
  kicker:   { fontSize: 10px, fontWeight: '700', letterSpacing: 1.15px }  # .section-kicker
  title:    { fontSize: 20px, fontWeight: '650', letterSpacing: -0.5px }  # .preview-heading h1
  heading:  { fontSize: 13px, fontWeight: '650' }                        # .metadata-heading h2
  body:     { fontSize: 12px }                                           # tree rows, buttons
  data:     { fontSize: 11px }                                           # .detail-row
  caption:  { fontSize: 10px }                                           # chips, footnotes
rounded:
  sm: 7px    # --radius-small
  md: 11px   # --radius-medium
  lg: 16px   # --radius-large
  full: 20px # pill chips (existing literal in .file-size-chip)
spacing:
  # No scale variable exists; v1 uses literal px. Insights reuses the same values.
  row-padding: 11px 12px     # .detail-row
  section-gap: 25px          # .metadata-section margin-top
components:
  insights-button:
    note: 'Reuses .tree-toolbar-button look (outline, {colors.line} border, hover {colors.accent} + {colors.accent-soft})'
    radius: '{rounded.sm}'
  insights-counter:
    background: '{colors.surface}'
    border: '{colors.line}'
    radius: '{rounded.md}'
    foreground: '{colors.ink}'
    caption: '{colors.ink-faint}'
  insights-table:
    note: 'Same anatomy as .detail-list: 1px {colors.line} frame, {rounded.sm}, rows divided by {colors.line}'
    label: '{colors.ink}'
    value: '{colors.ink-soft}'
    header: '{colors.ink-faint}'
  skipped-notice:
    note: 'Same anatomy as .inspector-footnote with .info-icon'
    background: '{colors.surface-muted}'
    foreground: '{colors.ink-soft}'
    radius: '{rounded.sm}'
---

## Brand & Style

Folio is quiet, light, and precise: white surfaces on a pale canvas, hairline borders, one blue accent. Folder Insights adds no new visual language. It is a **data view built from the parts v1 already has**: the preview heading, the metadata section, the detail list, and the inspector footnote. A user should feel it was always part of Folio.

The constraint is absolute: only variables already in `src/tokens.css`. No new colors, fonts, or variables. The PRD rules out charts (§5), so no data-viz palette is needed.

## Colors

- **`{colors.ink}`** carries the facts: file type labels, paths, and the counter number.
- **`{colors.ink-soft}`** carries sizes and the skipped notice text.
- **`{colors.ink-faint}`** is used for column headers, kickers, and the "files processed" caption.
- **`{colors.line}`** frames the tables and divides rows.
- **`{colors.accent}`** appears only on the Insights button's hover and focus. It is never used on data rows, because no row is interactive.
- **`{colors.danger}`** is **not** used for skipped files. Skipping is information, not an error (PRD FR-5), so it uses the neutral footnote style.
- `{colors.folder}` and `{colors.surface-selected}` keep their v1 roles and are not used in Insights.

## Typography

Insights uses the existing ramp:

- `{typography.kicker}` "FOLDER INSIGHTS" above `{typography.title}` (the folder name).
- `{typography.heading}` for section titles: "Size by type" and "Top 10 largest files".
- `{typography.data}` for table rows.
- `{typography.caption}` for the skipped notice.
- Sizes and the counter use `font-variant-numeric: tabular-nums` so numbers line up. This is a CSS property, not a new font.

## Layout & Spacing

Insights replaces the content of `.preview-column` (the preview card and metadata). The tree and the inspector stay. Vertical order, separated by `{spacing.section-gap}`:

1. Preview heading (kicker + folder name + Close button)
2. Skipped notice, only when something was skipped
3. Size by type
4. Top 10 largest files

Both tables are full column width, in two columns: label on the left, size right-aligned. During a scan, the counter card sits where the tables will appear.

## Elevation & Depth

Flat, like v1's data areas. Only the counter card may use the existing `--shadow`, as `.preview-card` does, because it takes that card's place. The tables have no shadow.

## Shapes

`{rounded.sm}` for the tables, the notice, and the button. `{rounded.md}` for the counter card, matching `.preview-card`.

## Components

- **Insights button.** An outline button in the preview heading, where files show their size chip. Label: "Folder insights". Visually it matches `.tree-toolbar-button`.
- **Close button.** The same outline style, in the same place while Insights is open. Label: "Close".
- **Scan counter.** A card holding one large number (`{typography.title}`) and the caption "files processed" (`{typography.data}`, `{colors.ink-faint}`).
- **Size by type table.** A header row (`Type`, `Size`) in `{colors.ink-faint}`, then one row per file type. The label is `{colors.ink}`, the size is `{colors.ink-soft}` and right-aligned. "(no extension)" uses the same style as any other row.
- **Top 10 list.** The same frame, as an ordered list with visible `File` / `Size` labels. Each row shows the full path (ellipsis when long) and its size.
- **Skipped notice.** The `.inspector-footnote` look: info icon plus text, for example "3 files skipped · 1 folder skipped".
- **Empty table.** A single row of `{colors.ink-faint}` text, in the style of `.search-results-empty`.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Reuse v1 classes and variables | Add any new color, font, or CSS variable |
| Right-align sizes with tabular numbers | Add bars, charts, or percentage meters (PRD §5) |
| Use the neutral footnote for skipped files | Show skipped files in `{colors.danger}` |
| Add new rules to `src/tokens.css` | Add new CSS files or inline styles |
