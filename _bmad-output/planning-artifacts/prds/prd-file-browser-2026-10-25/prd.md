---
title: "Folio v2 — Folder Insights PRD"
status: final
created: 2026-10-25
updated: 2026-10-25
---

# Folio v2 — Folder Insights PRD

## 0. Document Purpose

This PRD defines what Folder Insights must do, written for anyone who needs to agree on the behavior, developer or not. It builds on the final v2 product brief (2026-10-22) and brings in the four EARS requirements written for this feature, word for word, together with their test cases (§4). Test cases added in this PRD rather than taken from the EARS source are marked *(added)*. How the feature is built is left to the architecture document. Terms in §3 are used exactly as defined.

Every decision in this PRD has been confirmed by the user. One decision goes beyond the brief and the EARS source and is marked as such: how names that start with a dot get their file type (FR-6). The validation review of 2026-10-25 found several gaps; they are now resolved in §3 and §4. Review items accepted without change are listed in §8.

Context: brownfield (Folio v1 already ships), a course project, one user.

## 1. Vision

Folio lets you open a folder on your own computer, in the browser, and look through it as a tree, without installing anything and without anything leaving the machine. What the tree cannot tell you is **where the space went**. Today, finding that out means expanding branch after branch and comparing sizes by eye.

Folder Insights answers that in one view: how much space each type of file takes, and which individual files are the biggest. It looks through the whole folder, including every folder inside it, and keeps Folio's promise: it only reads, it stores nothing, and it sends nothing anywhere.

## 2. Target User

### 2.1 Jobs To Be Done

- When a folder is bigger than I expected, I want to see which kinds of files take up the space, so I know where to look first.
- I want to see the few biggest files by name and location, so I can decide what to deal with.
- I want to trust the numbers: if something couldn't be counted, I want to be told.

### 2.2 Key User Journey

- **UJ-1. Leizer finds out why a project folder is 8 GB.** Leizer has a project folder open in Folio on desktop Chrome and selects it, then opens Folder Insights. While Folio looks through the folder, a counter of files processed climbs, and the view stays scrollable. When the scan finishes, the size-by-type table shows `mp4` at the top with most of the space, and the top-10 list shows three screen recordings deep in a subfolder. Leizer now knows what is filling the folder. **Edge case:** a few files couldn't be read; the view says "3 files skipped", so Leizer knows the totals leave them out.

## 3. Glossary

- **Selected folder** — the folder the user has selected in Folio's tree, including the root folder. Folder Insights always describes this folder.
- **Scan** — one pass through every file in the selected folder and all folders inside it, at any depth. Both parts of Folder Insights come from the same scan. The results are a snapshot of the folder as it was while the scan ran; later changes on disk are not reflected.
- **File type** — the text after the last dot in a file's name, ignoring upper/lower case (`.JPG` and `.jpg` are the same file type). `archive.tar.gz` has the file type `gz`. A name with no dot, or with nothing after its last dot (`file.`), belongs to the file type "(no extension)". For names that start with a dot, see FR-6.
- **File type label** — how a file type is shown: in lowercase, without the dot (`jpg`, not `.JPG`).
- **Size by type** — the table with one row per file type and the total size of its files.
- **Top 10 largest files** — the list of the ten biggest individual files in the scan.
- **Full path** — a file's location relative to the selected folder, without the selected folder's own name, with folders separated by `/` (for example `videos/clip.mp4`).
- **Files processed** — every file the scan has reached so far, including skipped files. Folders are not counted.
- **Skipped file** — a file the browser could not read during the scan, including a file deleted while the scan was running. It is left out of the size by type and the top 10 largest files.
- **Skipped folder** — a folder inside the selected folder whose contents the browser could not read during the scan. Its contents are left out of the size by type and the top 10 largest files.

Every file the browser shows is counted, including files whose names start with a dot.

## 4. Features

### 4.1 Folder Insights

**Description:** The user opens Folder Insights for the selected folder through an explicit action; it is not shown automatically. Folio runs a scan. During the scan the view shows only a count of files processed so far. When the scan ends, the view shows the size by type and the top 10 largest files and, if anything was skipped, how many files and folders. Realizes UJ-1.

**Functional Requirements:**

The first four FRs are the EARS requirements, quoted exactly; their test cases are listed under each one.

#### FR-1: Size by type (EARS 1, event-driven)

> When the scan of the selected folder finishes, the system shall show the total size of all files under that folder grouped by file extension (case-insensitive), sorted by total size descending.

File types with the same total size are ordered by file type label A→Z.

**Test cases:**
- Folder with `a.JPG` (2 MB), `b.jpg` (1 MB), `c.txt` (5 MB) → rows: `txt` 5 MB, then `jpg` 3 MB.
- *(added)* `x.png` (2 MB) and `y.gif` (2 MB) → rows: `gif`, then `png`.
- *(added)* `archive.tar.gz` (1 KB) → a `gz` row with 1 KB; `file.` (1 KB) → a "(no extension)" row with 1 KB.

#### FR-2: Progress during the scan (EARS 2, state-driven)

> While the folder is being scanned, the system shall show the number of files processed so far and shall not show partial totals.

**Test cases:**
- Large folder → during the scan only the counter is visible; the table appears only when the scan ends.

#### FR-3: Files with no extension (EARS 3, unwanted behaviour)

> If a file has no extension, then the system shall count it under a "(no extension)" group rather than omitting it.

**Test cases:**
- `Makefile` (1 KB) → a "(no extension)" row with 1 KB.

#### FR-4: Top 10 largest files (EARS 4, event-driven)

> When the scan of the selected folder finishes, the system shall list the ten largest files under that folder, each with its full path and size, largest first; files of equal size are ordered by full path A→Z.

A→Z ignores upper/lower case. If two full paths are still equal when case is ignored, they are compared with case, so the order is always the same.

**Test cases:**
- `b.bin` and `a.bin` both 4 MB, `c.bin` 9 MB → `c.bin`, `a.bin`, `b.bin`.
- A folder with only 3 files → all 3 are listed.
- *(added)* Running the scan again on the same folder gives the same list in the same order.
- *(added)* `B.bin` and `a.bin` both 4 MB → `a.bin` first.

#### FR-5: Skipped files and folders are reported

If a file cannot be read during the scan, the system leaves it out of the size by type and the top 10 largest files and shows how many files were skipped. If a folder inside the selected folder cannot be read, the system does the same for its contents and shows how many folders were skipped. The messages read "1 file skipped" / "N files skipped" and "1 folder skipped" / "N folders skipped".

**Consequences (testable):**
- A folder with one unreadable file shows "1 file skipped", and its size appears in no row and not in the top 10.
- A folder with one unreadable subfolder shows "1 folder skipped", and nothing inside that subfolder appears in the results.
- A file deleted while the scan is running counts as a skipped file.
- When nothing was skipped, no skipped message is shown.

#### FR-6: Files whose names start with a dot

Files whose names start with a dot are included in the scan, the size by type, and the top 10 largest files. Such a name, like `.env` or `.gitignore`, has the file type after the dot (`env`, `gitignore`), not "(no extension)". *This rule is a new decision by the user; it is not in the brief or the EARS source.*

**Consequences (testable):**
- A folder with a 1 KB file `.env` shows 1 KB in the `env` row.

#### FR-7: Opening, closing, and changing the selection

Each time the user opens Folder Insights, the system runs a new scan; there is no separate re-scan action, and closing and reopening the view is how a scan is run again. While the view is open, selecting a different folder — during a scan or after it has finished — stops any running scan and starts a new scan of the newly selected folder. Closing the view during a scan stops the scan. Selecting a file closes Folder Insights and shows that file's details.

**Consequences (testable):**
- Selecting folder B during a scan of folder A → only results for folder B appear; nothing from folder A is shown.
- Selecting folder B after the scan of folder A has finished → a new scan of folder B starts.
- Closing the view during a scan and reopening it → a new scan starts from the beginning.
- Selecting a file while the view is open → Folder Insights closes and the file's details are shown.

#### FR-8: Folder with no file contents

When the selected folder contains no files, or contains only empty folders, the scan ends at once and the size by type and the top 10 largest files are shown empty. Files of 0 bytes are counted like any other file.

**Consequences (testable):**
- An empty folder → an empty table and an empty list, with no error.
- A folder that contains only empty subfolders → an empty table and an empty list, with no error.
- *(added)* A folder with one 0-byte `a.txt` → a `txt` row with 0 bytes, and `a.txt` in the top 10.

#### FR-9: Size format

Sizes in Folder Insights are shown in the same format Folio v1 already uses for file sizes.

**Consequences (testable):**
- A file shows the same size text in Folder Insights as in Folio's existing file details.

#### FR-10: When Folder Insights is available

Folder Insights can be opened only when a folder is selected, including the root folder. It cannot be opened when a file is selected or nothing is selected.

**Consequences (testable):**
- The root folder is selected → Folder Insights can be opened.
- A file is selected, or nothing is selected → Folder Insights cannot be opened.

#### FR-11: Links

The scan does not follow links (symlinks or shortcuts) to other folders, and each file is counted once.

**Consequences (testable):**
- A folder that contains a link to itself → the scan finishes, and each file appears once.

**Feature-specific NFRs:**
- **NFR-1 Responsiveness:** a folder with 10,000 files is scanned to the end while the app stays usable. The file counter keeps updating and the view can be scrolled during the scan. There is no time target.

## 5. Non-Goals

- Folder Insights does not change anything: no deleting, moving, or renaming files.
- No duplicate-file detection.
- No charts or other visualizations; the results are a table and a list.

## 6. Constraints

- **Read-only and local-only:** no network access, results live only in memory, no writes to the picked files or folders.
- **No new third-party software** added to the app.
- **Platform:** desktop Chrome only.

## 7. Success Metrics

Success for this course project means the behavior matches this PRD:

- **SM-1:** Every test case in FR-1 to FR-11 passes. Validates FR-1–FR-11.
- **SM-2:** The top 10 largest files are identical across repeated scans of the same folder. Validates FR-4.
- **SM-3:** No unreadable file or folder is ever dropped without the skipped notice. Validates FR-5.
- **SM-4:** The NFR-1 responsiveness check passes.

**Counter-metric (do not optimize):**
- **SM-C1:** Scan speed. There is no time target; showing partial totals or skipping files to finish faster would break FR-2 and FR-5.

## 8. Open Questions

None. Every open question and assumption has been confirmed and written into §3 and §4.

These validation findings from 2026-10-25 were reviewed and accepted without change:
- NFR-1 has no update rate and no reference machine; this is enough for a course project.
- The structure of the Success Metrics stays as it is, including the overlap of SM-2 and SM-3 with SM-1.
- Smaller wording items listed in `validation-report.md` under "Accepted as-is".
