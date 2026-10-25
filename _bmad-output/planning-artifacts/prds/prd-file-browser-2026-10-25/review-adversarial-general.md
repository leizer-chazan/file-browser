# Adversarial Review: Folio v2 — Folder Insights PRD

- **Reviewed:** `prd.md` (2026-10-25), against `brief.md` (2026-10-22) and `docs/v2-ears-folder-insights.md`
- **Review date:** 2026-10-25
- **Stance:** I assumed the PRD is wrong somewhere and looked for where.

## Verdict

**Not ready to call "final".** The PRD carries the brief and EARS sources over faithfully and stays within scope, but its central claim, "Every decision in it has been confirmed; none is left as an assumption" (§0), along with "Open Questions: None" (§8), does not hold. FR-1 and FR-2 conflict on timing. The determinism promise (FR-4, SM-2) depends on an undefined "full path" and an unspecified A→Z collation. Failures at folder level, symlinks, cancellation, and re-scan are not specified. Severity counts: **0 critical, 4 high, 9 medium, 5 low**.

---

## High

### H1. FR-1 and FR-2 contradict each other on when totals appear
- **Where:** FR-1 "When the user **opens** Folder Insights … the system shall show the total size…"; FR-2 "While the folder is being scanned … shall not show partial totals"; §4.1 Description "When the scan ends, the view shows the size by type".
- **Problem:** FR-1's trigger is opening the view. Read literally, the totals must appear at open time, but FR-2 forbids them until the scan ends. FR-4 uses the correct trigger ("When the scan … finishes"). The EARS source has the same flaw, and the PRD quotes it "exactly" without flagging the conflict. A tester could fail an implementation that follows FR-2 because it violates FR-1, or the reverse.
- **Fix:** Keep the EARS text verbatim if the course requires it, but add a binding note under FR-1: "Totals are shown when the scan triggered by opening finishes (see FR-2)". Better still, revise the EARS trigger to "When the scan of the selected folder finishes".

### H2. "Full path" and "A→Z" are underspecified, which breaks the determinism guarantee
- **Where:** §3 "Full path — a file's location inside the selected folder, including every folder name on the way to it"; FR-4 "ordered by full path A→Z"; SM-2.
- **Problem:** The PRD doesn't say whether the selected folder's own name is included, which separator is used (`/` or `\`), or how A→Z compares strings: case-sensitive or not, code-unit or locale (`localeCompare`), and how digits and accents sort. `B.bin` vs `a.bin` and `img10` vs `img2` come out differently under each choice. Every choice is deterministic on its own, so SM-2 still passes, but FR-4's tie order isn't testable against a single expected answer once names differ in case or contain digits.
- **Fix:** Define it explicitly: the path relative to the selected folder, without the folder's own name, `/`-separated, compared by plain code-unit order (or name a specific collation). Add a test case with mixed case, such as `B.bin` and `a.bin` at the same size.

### H3. Unreadable folders aren't covered, only unreadable files
- **Where:** §3 "Skipped file — a file the browser could not read"; FR-5 "If a file cannot be read…"; §2.1 "if something couldn't be counted, I want to be told".
- **Problem:** The usual failure is a subfolder that can't be listed (permission denied, or a system folder Chrome blocks). Its files are never seen, so the scan can't count them as skipped files. FR-5 as written allows silently dropping a whole subtree, which is exactly the outcome the JTBD and SM-3 ("never dropped without notice") say must not happen. It also doesn't say what happens when the selected folder itself becomes unreadable mid-scan (for example, it was deleted or permission was revoked).
- **Fix:** Add an FR: "If a folder inside the selected folder cannot be read, the system shall report it (for example, 'N folders skipped'), and the totals exclude its contents." Also specify how the whole scan fails when the root is lost. Add a test for each.

### H4. The scan can't be cancelled, and closing the view mid-scan is undefined
- **Where:** FR-7 covers only "selects a different folder while a scan is running"; §4.1 "explicit action" opens the view, but there is no close behaviour.
- **Problem:** Several cases are left open:
  - The user closes Folder Insights during a scan. Does the scan keep running in the background?
  - The user reselects the same folder.
  - The user selects a file instead of a folder.
  - The user picks a whole new root folder in Folio.
  - The user reopens Insights after a finished scan. Do they get the cached result or a fresh scan?

  The FR-4 test "Running the scan again on the same folder" relies on a re-run action that no FR defines. On a large tree, a scan that can't be stopped also undermines the responsiveness NFR.
- **Fix:** Add FRs for these:
  - Closing the view stops the scan and discards partial work.
  - Every open starts a fresh scan, with no cached results (this also keeps faith with the no-persistence rule).
  - Selecting a file or the same folder has a defined behaviour.
  - How the user re-runs a scan.

---

## Medium

### M1. Symlinks, junctions, and cycles are not addressed
- **Where:** §3 "Scan — one pass through every file … at any depth".
- **Problem:** "At any depth" with no rule for links allows an infinite loop, or the same files counted twice, if links are followed. If links aren't followed, the totals quietly differ from what the OS reports. Neither result is specified, and the user isn't told either way.
- **Fix:** State that links aren't followed (or that each file is counted once), and say whether skipped links count toward "N skipped".

### M2. The "Hidden file" definition can't be tested
- **Where:** §3 "a file the operating system hides by default"; FR-6.
- **Problem:** The browser can't see the Windows hidden attribute, so the definition doesn't match anything Folio can detect. In practice FR-6 only tests dotfiles. "Counted like any other file" is really just "count everything", so the definition does no work.
- **Fix:** Replace it with "All files are counted regardless of OS hidden status or leading dot." Drop the OS-based definition, or say that Folio can't detect it.

### M3. FR-6's dotfile rule is new, and the extension rule is still incomplete
- **Where:** FR-6 "`.env` … has the file type after the dot (`env`, `gitignore`)"; §3 "File type — a file's extension".
- **Problem:** The dotfile rule doesn't come from the brief or the EARS source (both are silent), and it contradicts common convention (Node `path.extname('.env') === ''`). That makes it a product decision presented as a clarification. These cases are still undefined:
  - `archive.tar.gz`: is the type `gz` or `tar.gz`?
  - A trailing dot, as in `file.`.
  - A name that is only a dot.
  - Extensions with non-ASCII case folding.
- **Fix:** Define the extension as "the text after the last dot, if non-empty", spell out the `file.` case, and add test cases for `archive.tar.gz` and `file.`. Note in the PRD that the dotfile rule is a new decision.

### M4. "Files processed" is undefined with respect to skipped files
- **Where:** FR-2 "the number of files processed so far".
- **Problem:** It doesn't say whether skipped files count as processed, or whether folders do. If not, the final counter won't match the number of files in the table, which looks like a bug to the user.
- **Fix:** Define "processed" as files attempted, both read and skipped, and exclude folders.

### M5. The responsiveness NFR is vague and only covers one size
- **Where:** §4.1 NFR "a folder with 10,000 files … app stays usable"; SM-4.
- **Problem:** "Usable" has no measurable bound: there's no update cadence for the counter and no limit on input latency. Nothing is said about 100k or 1M files, where memory, not speed, is the risk (keeping every path in memory for the top 10). No test fixture or method is defined either.
- **Fix:** Add a measurable bound, for example that the counter updates at least every 500 ms and no main-thread task runs longer than about 200 ms. State the expected behaviour beyond 10k files, even if that's only "must finish without crashing on 100k". Name the fixture.

### M6. The folder contents can change during or after the scan
- **Where:** Not covered.
- **Problem:** Files may be added, deleted, or resized while a scan is running, and results go stale afterwards. A file deleted mid-scan becomes a "skipped file" under FR-5, which is wrong. The results also aren't marked as a snapshot.
- **Fix:** State that results are a snapshot taken during the scan, and that a file that disappears during the scan is either skipped or ignored (pick one).

### M7. "Total" is ambiguous for the top-10 list
- **Where:** §3 "Skipped file … not counted in any total"; FR-5 "leaves it out of every total".
- **Problem:** The top-10 list isn't a total. A file whose size is known from its metadata but whose read failed could still appear in the top 10 under a strict reading.
- **Fix:** Say "left out of the size by type and the top 10 largest files".

### M8. The "N files skipped" wording contradicts its own test
- **Where:** FR-5 "shown as 'N files skipped'" vs test "shows '1 file skipped'".
- **Problem:** The template and the singular example disagree, so a literal test of the template fails at N=1.
- **Fix:** Specify both forms ("1 file skipped" / "N files skipped").

### M9. The success metrics have no real counter-metric on correctness
- **Where:** §7 SM-1 to SM-4, SM-C1.
- **Problem:** SM-2 and SM-3 are already covered by SM-1, so they add nothing. SM-3's "never … ever" can't be proved by tests. The single counter-metric only guards speed. Nothing guards against reporting totals that are much lower than reality. For example, a large share of skipped files or folders makes the result technically compliant and useless.
- **Fix:** Add a counter-metric: the sum of size by type equals the sum of all file sizes minus skipped files, checked against a fixture with a known total. Merge SM-2 and SM-3 into SM-1, or turn them into independent checks.

---

## Low

### L1. The size units in the test cases are ambiguous
- **Where:** FR-1 and FR-3 tests ("2 MB", "1 KB"); FR-9.
- **Problem:** The tests don't say whether units are 1000- or 1024-based. FR-9 defers to the v1 format without stating it. Sums of rounded values can also look inconsistent ("1.5 MB + 1.5 MB = 2.9 MB").
- **Fix:** Write test fixture sizes in bytes, and say that totals are summed in bytes before formatting.

### L2. FR-8 misses near-empty edge cases
- **Problem:** It doesn't cover a folder that holds only empty subfolders, or zero-byte files. Does a 0-byte file get a row, and can it appear in the top 10? It also doesn't say whether the empty state shows any message.
- **Fix:** Add a test for each case.

### L3. The "quoted exactly" claim hides an added test
- **Where:** §0 "word for word, together with their test cases"; FR-4's third test (repeat run) isn't in the EARS source.
- **Problem:** This is a minor provenance drift. It's harmless, but it isn't labelled as an addition.
- **Fix:** Mark the test as added in the PRD.

### L4. "Explicit action" isn't defined
- **Where:** §4.1 Description.
- **Problem:** Leaving the UX to a later document is acceptable, but nothing says whether Insights can be opened for the root folder, or whether it can be opened while no folder is selected.
- **Fix:** Add one line on its availability: only when a folder is selected, including the root.

### L5. The no-persistence constraint is looser than the project rule
- **Where:** §6 "nothing saved between sessions (results live only while the app is open)".
- **Problem:** The project rule forbids all storage APIs, even within a session (for example, sessionStorage). The PRD's wording allows session-scoped storage.
- **Fix:** Restate it as "results live only in memory".

---

## Scope check

No scope creep found. The non-goals match the brief. FR-6's dotfile typing (M3) is the only decision that goes beyond the sources.
