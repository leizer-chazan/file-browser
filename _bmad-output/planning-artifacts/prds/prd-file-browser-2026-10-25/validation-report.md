# Validation Report — Folio v2 — Folder Insights PRD

- **PRD:** `_bmad-output/planning-artifacts/prds/prd-file-browser-2026-10-25/prd.md`
- **Rubric:** `.claude/skills/bmad-prd/assets/prd-validation-checklist.md`
- **Run at:** 2026-10-25T23:40
- **Grade:** Fair

## Overall verdict
This is a tight, honest PRD for a small brownfield feature. It has a clear thesis ("where the space went"), FRs that each come with concrete test cases, and real non-goals. Because there is a test case for nearly every rule, the weak spots are the state transitions the tests don't exercise: what happens after a finished scan when the selection changes, when the selected item is a file, or when a whole subfolder can't be read. There are also two definitional conflicts, one about hidden files and one about how file types are shown in the table.

The adversarial reviewer goes further. It finds that the PRD's claims "none is left as an assumption" (§0) and "Open Questions: None" (§8) don't hold. FR-1's trigger ("when the user opens") conflicts with FR-2 (no partial totals). FR-4's determinism depends on an undefined "full path" and A→Z collation. Cancellation, re-scan, symlinks and unreadable folders are unspecified. No scope creep was found.

## Dimension verdicts
- Decision-readiness — strong
- Substance over theater — strong
- Strategic coherence — strong
- Done-ness clarity — adequate
- Scope honesty — strong
- Downstream usability — adequate
- Shape fit — strong

## Findings by severity

### Critical (0)

### High (5)
**[Done-ness / Adversarial H4]** — Selection change after a finished scan, closing the view mid-scan, and re-scan are undefined (§4.1, FR-7)
FR-7 only covers a change "while a scan is running". The FR-4 test "running the scan again" relies on a re-run action that no FR defines.
Fix: Add FRs: a selection change while the view is open starts a new scan; closing the view stops the scan; every open is a fresh scan; define how a re-run happens.

**[Done-ness / Adversarial H3]** — Unreadable folders aren't covered (FR-5, §3 "Skipped file")
A subfolder that can't be listed drops silently out of the totals, which breaks the third JTBD and SM-3. Losing the root folder mid-scan is also unspecified.
Fix: Add an FR that reports skipped folders ("N folders skipped"), with a test case.

**[Adversarial H1]** — FR-1 and FR-2 conflict on timing (FR-1, FR-2)
FR-1 shows totals "when the user opens"; FR-2 forbids them until the scan ends. The conflict comes from the EARS source.
Fix: Add a binding note under FR-1 ("totals shown when the scan finishes, see FR-2"), or change the trigger.

**[Adversarial H2]** — "Full path" and "A→Z" are underspecified (§3, FR-4, SM-2)
The PRD doesn't say whether the root folder's name is included, which separator is used, or whether sorting is case-sensitive or locale-aware.
Fix: Define the relative path, the `/` separator and the collation; add a mixed-case tie test.

### Medium (11)
**[Done-ness]** — Selected item is a file, or nothing is selected (§4.1, FR-1). Fix: "Available only when a folder is selected", plus a test.
**[Done-ness]** — How file types are labeled (lowercase, no dot) is implied only by a test (§3). Fix: State it in §3.
**[Done-ness / Adversarial M3]** — `archive.tar.gz`, `file.` and a name that is only a dot are undefined. The dotfile rule in FR-6 is a new decision not in the sources. Fix: "Text after the last dot; empty → (no extension)", tests, and mark FR-6 as new.
**[Downstream / Adversarial M2]** — The "Hidden file" definition (OS attribute) can't be tested in the browser and conflicts with FR-6's dotfile examples. Fix: Redefine it, or "every readable file is counted".
**[Adversarial M1]** — Symlinks, junctions and cycles aren't addressed. Fix: State that links aren't followed or that each file is counted once.
**[Adversarial M4]** — "Files processed" is ambiguous with respect to skipped files and folders (FR-2). Fix: Define it.
**[Adversarial M5]** — The responsiveness NFR has no measurable bound, no fixture, and says nothing beyond 10k files. Fix: Add an update cadence and name the fixture.
**[Adversarial M6]** — Files can change during or after the scan; a file deleted mid-scan becomes a "skipped file". Fix: Say results are a snapshot, and pick a behavior.
**[Adversarial M7]** — "Every total" is ambiguous for the top 10 (FR-5). Fix: Name both outputs.
**[Adversarial M8]** — The "N files skipped" template vs the "1 file skipped" test. Fix: Specify singular and plural.
**[Adversarial M9]** — No correctness counter-metric; SM-2 and SM-3 are redundant with SM-1. Fix: Add a known-total fixture check, and merge or justify SM-2/SM-3.

### Low (13)
**[Decision-readiness]** — No note recording the rejected live-partial-totals option (FR-2).
**[Strategic coherence]** — SM-2 and SM-3 restate FR tests.
**[Done-ness]** — FR-1 has no tie-break for equal type totals.
**[Done-ness]** — The A→Z tie-break doesn't say whether case is ignored (overlaps H2).
**[Done-ness]** — Closing or reopening the view isn't specified (overlaps H4).
**[Done-ness]** — The NFR has no update rate or reference machine.
**[Scope honesty]** — Add a non-goal: no automatic re-scan when the disk changes.
**[Downstream]** — The NFR has no ID; SM-4 cites it by section number.
**[Adversarial L1]** — Size units are ambiguous (1000 vs 1024); write test fixtures in bytes.
**[Adversarial L2]** — FR-8 doesn't cover a folder with only empty subfolders or zero-byte files.
**[Adversarial L3]** — FR-4's third test was added, not quoted from EARS; label it.
**[Adversarial L4]** — The "explicit action" for opening the view and its availability for the root folder are undefined.
**[Adversarial L5]** — §6 "nothing saved between sessions" is looser than the project rule; say "results live only in memory".

## Mechanical notes
- The FR-1..FR-9, SM-1..SM-4 + SM-C1 and UJ-1 IDs are contiguous, and all cross-references resolve.
- There are no `[ASSUMPTION]` tags, which is consistent with §8.
- FR-5's template "N files skipped" vs the test "1 file skipped": state the plural rule.
- "Under that folder" (FR-1, FR-4) vs the glossary phrasing: unify them.
- UJ-1 has a named protagonist and carries its context inline.

## Resolution (Update, 2026-10-25)

### Fixed in prd.md
- **H4 / Done-ness high:** FR-7 rewritten. Every open runs a fresh scan, and closing then reopening is how a scan is re-run (there is no re-scan button). A selection change during or after a scan rescans. Closing the view mid-scan stops the scan. Selecting a file closes Insights and shows the file's details.
- **H3 / Done-ness high:** FR-5 now reports skipped folders ("N folders skipped"), with a test; the "Skipped folder" term is added to §3.
- **H1:** EARS 1 was updated in the source (`docs/v2-ears-folder-insights.md`); FR-1 quotes the new wording ("When the scan of the selected folder finishes…").
- **H2:** "Full path" is now defined as relative to the selected folder, without its name, `/`-separated. A→Z ignores case, with a case-sensitive tie-break. Added the test `B.bin`/`a.bin` → `a.bin` first.
- **Medium:**
  - Availability: FR-10, folder only, including the root.
  - File type labels: lowercase, no dot (§3).
  - Last-dot rule: `archive.tar.gz` → `gz`, `file.` → (no extension). The `.env` → `env` rule is marked as a new user decision in FR-6.
  - The OS-based "Hidden file" definition is removed; every file the browser shows is counted.
  - Links are not followed (FR-11).
  - "Files processed" includes skipped files.
  - Results are a snapshot; a file deleted mid-scan counts as skipped.
  - FR-5 names both outputs.
  - Singular and plural forms are defined for files and folders.
- **Low:**
  - FR-1 tie-break by file type label A→Z.
  - Empty subfolders and 0-byte files are covered in FR-8.
  - NFR-1 ID added.
  - FR-4 test 3 is marked *(added)*.
  - §6 now says "results live only in memory".
- **§0 and §8** were rewritten to reflect the actual state.

### Accepted as-is
- Medium: NFR-1 has no update rate or reference machine (enough for a course project); the Success Metrics structure stays (SM-2/SM-3 overlap with SM-1, no extra correctness counter-metric).
- Low:
  - No note on rejected live partial totals.
  - No non-goal for live updates.
  - Size units (1000 vs 1024) are left to the v1 format.
  - "Explicit action" wording is left to UX.
  - Wording unification of "under that folder".

## Reviewer files
- `review-rubric.md`
- `review-adversarial-general.md`
