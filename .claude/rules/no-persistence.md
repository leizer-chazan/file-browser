# Read-only, local-only

Folio is a read-only, browser-only file explorer. For any code in this project:

- No network calls (`fetch`, `XMLHttpRequest`, websockets, analytics, telemetry).
- No persistence of file contents or metadata — no `localStorage`, no `sessionStorage`, no IndexedDB, no cookies.
- No writes back to the files or folders the user picked.

The only state a feature may keep is in-memory React state for the current session. If a feature seems to need storage or a network call, it's out of scope — flag it instead of adding it.
