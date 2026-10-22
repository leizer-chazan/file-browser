---
title: "Product Brief: Folio v2 — Folder Insights"
status: final
created: 2026-10-22
updated: 2026-10-22
---

# Product Brief: Folio v2 — Folder Insights

## Summary

Folio is a read-only, browser-only file explorer. In v1 you open a folder and get a file tree. The tree shows what is in the folder, but not what takes up the space. v2 adds **Folder Insights**: for the selected folder, the total size of each file type (by extension) and the 10 largest individual files. It answers "where did the space go?" without leaving the app and without breaking Folio's read-only, local-only promise.

## Who This Serves

Folio's existing user: someone on desktop Chrome who opens a local folder and wants to understand it, including what is using the space, without installing anything or sending data anywhere.

## The Problem

To find what is filling a folder today, you have to expand the tree branch by branch and compare file sizes by eye. That is slow for small folders and impractical for deep ones. Two questions go unanswered:

- **Which kinds of files weigh the most?** For example, videos versus images versus archives.
- **Which individual files are the biggest?**

## The Solution

A Folder Insights view for the selected folder, with two parts:

1. **Size by type.** One row per file extension with its total size, largest first.
   - Extensions are case-insensitive (`.JPG` = `.jpg`).
   - Files with no extension are grouped under "(no extension)" instead of being dropped.
2. **Top 10 largest files.** The 10 largest files, each shown with its full path and size, largest first. When two files are the same size, the one whose full path comes first A→Z ranks higher, so the list is identical on every run. A folder with fewer than 10 files shows all of them.

The scan covers every subfolder of the selected folder, and both parts come from that one scan. While it runs, the view shows only a running count of files processed. Totals appear once the scan finishes, never partially.

Hidden files count, because they take up space. A file the browser cannot read is left out of the totals. The view then shows how many files were skipped ("N files skipped"), so a total can never be wrong without the user knowing.

## Constraints

- Read-only and local-only: no network calls, no persistence of any kind, no writes to the picked files or folders.
- No new dependencies.
- Desktop Chrome is the only supported target.

## Scope

**Out of scope:** deleting or moving files, finding duplicates, and charts or other visualizations.

## Success Criteria

- The behavior matches the EARS requirements in `docs/v2-ears-folder-insights.md`, including their test cases:
  - `a.JPG` (2 MB) + `b.jpg` (1 MB) + `c.txt` (5 MB) → `txt` 5 MB, then `jpg` 3 MB.
  - `Makefile` (1 KB) → a "(no extension)" row with 1 KB.
  - During a scan, only the file counter is visible.
- The top-10 list follows EARS requirement 4 and is identical across repeated runs on the same folder.
- Unreadable files are reported as "N files skipped", never dropped without notice.
- A folder with 10,000 files is scanned to the end while the app stays responsive: the file counter keeps updating and the view can be scrolled. There is no time target.
