# PRD Quality Review — Folio v2 — Folder Insights PRD

## Overall verdict
This is a tight, honest PRD for a small brownfield feature. It has a clear thesis ("where the space went"), FRs that each come with concrete test cases, and real non-goals. Because there is a test case for nearly every rule, the weak spots are the state transitions the tests don't exercise: what happens after a finished scan when the selection changes, when the selected item is a file, or when a whole subfolder can't be read. There are also two definitional conflicts, one about hidden files and one about how file types are shown in the table. These gaps are small to fix but would otherwise be settled by guesswork during story creation.

## Decision-readiness — strong
Decisions are stated as decisions, not hedged. Examples: "it is not shown automatically" (§4.1), "There is no time target" (§4.1 NFR), "Hidden files are counted like any other file" (§3), and "No charts or other visualizations" (§5). The trade-off the PRD gives up is named directly in SM-C1: speed is sacrificed for completeness and correctness ("showing partial totals or skipping files to finish faster would break FR-2 and FR-5"). §8 "None" is believable, because the earlier open items were turned into FR-5 to FR-9 and are traceable there.

### Findings
- **low** No `[NOTE FOR PM]` at the one real tension (§4.1, FR-2) — Hiding all totals until the end is a deliberate UX cost on large folders, and nothing in the PRD acknowledges it as one. *Fix:* Add one sentence saying that live partial totals were considered and rejected because they would mislead.

## Substance over theater — strong
There is one persona and one UJ, and the UJ drives the FRs: the counter maps to FR-2, the table to FR-1, the top 10 to FR-4, and "3 files skipped" to FR-5. The Vision is specific to this product ("where the space went"; "expanding branch after branch and comparing sizes by eye") and could not be swapped into another PRD. The only NFR has product-specific bounds (10,000 files, counter keeps updating, scrollable). Nothing reads as furniture.

## Strategic coherence — strong
The thesis is "one view answers where the space went, and the numbers can be trusted" (§1, §2.1 third JTBD). Every FR serves either the answer (FR-1, FR-3, FR-4, FR-6) or the trust (FR-2, FR-5, FR-7, FR-9). The success metrics are about conformance rather than outcomes. For a course project that is stated openly in §7 ("Success for this course project means the behavior matches this PRD"), so it is acceptable. A counter-metric is present.

### Findings
- **low** SM-2 and SM-3 restate FR test cases (§7) — SM-2 duplicates the third FR-4 test case, and both are already included in SM-1. *Fix:* Either drop them or say why they get extra weight (for example, determinism and trust are the thesis).

## Done-ness clarity — adequate
Most FRs have exact, checkable test cases with sizes and expected order (FR-1, FR-4). These are the PRD's strongest feature. The gaps are in states and edge rules that no test touches. Since story creation will rely on this section most, these matter.

### Findings
- **high** Behavior after a scan finishes and the selection changes is undefined (§4.1, FR-7) — FR-7 only covers "while a scan is running". If the user picks another folder after a scan completes, the PRD doesn't say whether the view rescans, keeps showing stale results for the old folder, or closes. Showing stale results would break the §3 rule that "Folder Insights always describes this folder". *Fix:* Add an FR: "When the selected folder changes while Folder Insights is open, the system starts a new scan of the new folder", with a test case.
- **high** An unreadable subfolder isn't covered (FR-5, §3 "Skipped file") — "Skipped file" is defined per file. If a whole folder can't be read, the number of files inside it is unknown, so "N files skipped" can't be counted honestly. This hits the third JTBD ("if something couldn't be counted, I want to be told") directly. *Fix:* Define what happens, for example "N files and M folders skipped", or count the folder as one skipped item, and add a test case.
- **medium** Selected item is a file, or nothing is selected (§4.1 description, FR-1) — v1 lets the user select both files and folders. The PRD doesn't say whether Folder Insights is unavailable, disabled, or scans the parent folder in those cases. *Fix:* State it, for example "available only when a folder is selected", and add a test case.
- **medium** How file types are labeled is unspecified (FR-1 test case, §3 "File type") — The test expects a row labeled `jpg` for `a.JPG` + `b.jpg`, but no rule says that labels are shown in lowercase, or with or without the dot. *Fix:* Add "File types are shown in lowercase without the leading dot" to §3.
- **medium** Names with several dots or a trailing dot (§3 "File type", FR-6) — The PRD doesn't say whether `archive.tar.gz` counts as `gz` or `tar.gz`, or where `notes.` goes. FR-6's dot-file rule shows the authors cared about this, but the general rule is missing. *Fix:* State "the text after the last dot; an empty result counts as (no extension)" and add a test case.
- **low** Ties in size by type (FR-1) — FR-4 gives a tie-break rule, but FR-1 doesn't, so the order of two types with equal totals isn't defined. That undercuts the determinism FR-4 works hard for. *Fix:* Add "ties by file type A→Z".
- **low** The A→Z tie-break isn't fully defined (FR-4) — It doesn't say whether the comparison is case-sensitive. *Fix:* Say "ignoring case", or say it explicitly if not.
- **low** Closing or reopening Folder Insights isn't specified (§4.1) — The PRD doesn't say whether closing the view mid-scan stops the scan, or whether reopening it rescans. *Fix:* Add one sentence.
- **low** The responsiveness NFR has no reference machine and no update rate (§4.1 NFR) — "The file counter keeps updating" can't be tested strictly without a rate. *Fix:* Say something like "updates at least once per second", or accept "visibly changes" as the bar.

## Scope honesty — strong
§5 Non-Goals does real work: no modification, no duplicate detection, no charts. §6 states the read-only, local-only constraints and the desktop-Chrome-only platform. The PRD has zero open items, and §0 and §8 say this explicitly ("Every decision in it has been confirmed"). That matches a green-light PRD. The only silent omissions are the Done-ness gaps above. Symlinks or shortcuts, and a live view of a folder whose contents change, could also each get a one-line non-goal.

### Findings
- **low** Add a non-goal for live updates (§5) — The PRD should say that results don't follow changes made on disk after a scan, so nobody adds watching or a refresh timer (a pitfall this project has already hit). *Fix:* Add "No automatic re-scan when folder contents change on disk."

## Downstream usability — adequate
The glossary is present and used consistently ("selected folder", "scan", "top 10 largest files", "skipped file"). The FR, SM and UJ IDs are contiguous and resolve. Each FR can be read on its own. One glossary entry contradicts an FR, which will confuse architecture and story work.

### Findings
- **medium** "Hidden file" definition conflicts with FR-6 (§3 vs. FR-6) — §3 defines a hidden file as one "the operating system hides by default". On Windows, which is this user's platform, that is an attribute, not a leading dot, and the browser cannot see it. FR-6 instead uses dot-files as its examples. A reader can't tell which definition the test of FR-6 relies on. *Fix:* Redefine it as "a file whose name starts with a dot", or drop the term and say "every file the browser can read is counted".
- **low** The NFR has no ID (§4.1, SM-4) — SM-4 refers to "the 10,000-file responsiveness check in §4.1" by section number. *Fix:* Give it an ID (NFR-1) and reference that.

## Shape fit — strong
A single-user course project with one UJ, a capability-spec shape, and conformance-style metrics is the right weight. The brownfield references hold up: v1 does have folder and file selection in the tree, and an existing file-size display that FR-9 can point to. §0 states the choice to leave out implementation detail for non-developer readers, and the PRD keeps to it without losing testability.

## Mechanical notes
- IDs: FR-1 to FR-9, SM-1 to SM-4 plus SM-C1, and UJ-1 are contiguous and unique. All cross-references resolve.
- Assumptions Index: there are no inline `[ASSUMPTION]` tags and §8 says none remain, so the roundtrip is consistent.
- Wording: FR-5 uses the template "N files skipped" but the test expects "1 file skipped". The singular/plural rule is implied. State it.
- Wording: FR-1 and FR-4 say "under that folder" while the glossary uses "in the selected folder and all folders inside it". These mean the same thing, but one phrasing would be better.
- UJ-1 has a named protagonist (Leizer) and carries its context inline.
