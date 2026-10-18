<project_material>
  <project>
    This is Folio, a read-only file explorer that runs entirely in the browser.
    Files must stay on the user's device: do not upload, modify, or persist file
    contents, and do not add network or storage behavior.
    The project uses React and TypeScript. Its quality-check command is:
    npm run check
  </project>

  <relevant_code_to_read_first>
    Inspect src/App.tsx before changing anything. The selected entry is represented
    by ExplorerEntry; selected.file is available for selected files. The existing
    DetailRow component renders rows in the INFORMATION inspector. Reuse the
    existing patterns for selected-file details and for handling asynchronous
    results when the selection changes. Inspect the relevant tests and styling too.
  </relevant_code_to_read_first>

  <line_count_examples>
    <example input="alpha&#10;beta" expected="2"/>
    <example input="alpha&#10;beta&#10;" expected="2"/>
    <example input="" expected="0"/>
    <example input="alpha&#13;&#10;beta&#13;gamma&#10;" expected="3"/>
  </line_count_examples>
</project_material>

<role technique="Give a role">
  You are a careful senior frontend engineer working within this repository's
  existing architecture and conventions.
</role>

<brief technique="Brief once">
  <goal>
    Show the line count for a selected plain-text file in the INFORMATION inspector.
  </goal>
  <reason>
    Help users quickly understand the size of a text file without opening or
    changing it.
  </reason>
  <scope>
    Add a "Lines" detail row for supported text files only. Reuse existing UI
    components and styling conventions. Keep all processing local in the browser.
    Do not add dependencies, network access, persistent storage, or file writes.
    Do not alter existing image metadata or folder behavior.
  </scope>
  <done_when>
    The line count follows the examples above, including LF, CRLF, and CR line
    endings; a trailing newline does not add an extra line. Empty content is 0.
    Non-text files do not show a line count. Async results must not appear for a
    different file if the user changes selection while counting. Add or update
    focused tests where appropriate, and ensure npm run check passes.
  </done_when>
</brief>

<task technique="Be specific">
  Implement this feature now. First inspect the relevant source, tests, and styles;
  then make the smallest complete change. Decide which files count as supported
  text by following the project's existing file-type conventions—do not treat
  arbitrary binary files as text. Handle loading and read errors using the
  project's existing UI/error patterns. Do not silently display a misleading
  count. Run npm run check and report its result.
</task>

<examples technique="Multishot">
  Use the four varied input/output examples in <line_count_examples> as behavioral
  examples and tests. Include empty content, a trailing newline, mixed line-ending
  styles, and ordinary LF input.
</examples>

<format technique="XML structure">
  Follow the tagged sections in this prompt to distinguish project material, role,
  brief, task, examples, and constraints.
</format>

<effort technique="Dial effort, not words">
  Effort is controlled in Claude Code, not by asking for extra reasoning in this
  prompt. Do not change the effort setting as part of the implementation.
</effort>

<save_and_commit>
  Save this exact prompt, with all seven technique labels intact, as
  prompts/exercise-3-line-count.md. After the feature and tests pass, commit only
  the files for this feature and the saved prompt. First check git status; do not
  include unrelated existing changes. If unrelated changes make a safe commit
  unclear, stop and report that instead of staging them.
</save_and_commit>
