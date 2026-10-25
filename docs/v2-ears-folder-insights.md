# v2 goal — Folder Insights: EARS requirements

Level 4, exercise 1. These requirements go into the PRD in exercise 6.

## 1. Event-driven
When the scan of the selected folder finishes, the system shall show the total size of all files under that folder grouped by file extension (case-insensitive), sorted by total size descending.

- Test: folder with `a.JPG` (2 MB), `b.jpg` (1 MB), `c.txt` (5 MB) → rows: `txt` 5 MB, then `jpg` 3 MB.

## 2. State-driven
While the folder is being scanned, the system shall show the number of files processed so far and shall not show partial totals.

- Test: large folder → during the scan only the counter is visible; the table appears only when the scan ends.

## 3. Unwanted behaviour
If a file has no extension, then the system shall count it under a "(no extension)" group rather than omitting it.

- Test: `Makefile` (1 KB) → a "(no extension)" row with 1 KB.

## 4. Event-driven — ten largest files
When the scan of the selected folder finishes, the system shall list the ten largest files under that folder, each with its full path and size, largest first; files of equal size are ordered by full path A→Z.

- Test: `b.bin` and `a.bin` both 4 MB, `c.bin` 9 MB → `c.bin`, `a.bin`, `b.bin`.
- Test: a folder with only 3 files → all 3 are listed.

## Decisions to carry into the PRD
- "File type" = file extension, case-insensitive (`.JPG` = `.jpg`).
- Ten largest files: ties on size are ordered by full path, A→Z, so the ranking is identical on every run.
