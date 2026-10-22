Task: In the detail pane, next to the last-modified date, show a relative time ("just now", "5 minutes ago", "3 days ago", "2 months ago", "1 year ago"), computed by a pure function in src/lib/ that receives both the date and "now".
Guardrails: no new dependencies; keep the existing absolute date and the order of the detail rows; don't touch the tree, search or EXIF code; don't commit.
Done when: npm run check exits 0 with unit tests for seconds, minutes, hours, days, months, years and a future date — then summarize in five lines what you changed and what you assumed.
