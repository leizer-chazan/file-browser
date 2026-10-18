---
paths:
  - "src/lib/**"
---

# `src/lib/` stays framework-free

Code under `src/lib/` never imports React, JSX, or `react-dom`. It is plain TypeScript: pure functions and types, testable with Vitest without rendering anything.

- UI components (in `src/App.tsx` and friends) call into `src/lib/` — not the other way around.
- If a helper needs React (hooks, components, `ReactNode`), it does not belong in `src/lib/`; keep it in the component file instead.
- Every exported function here should be easy to unit test in isolation — see `src/lib/fileTree.test.ts` and `src/lib/textLines.test.ts` for the pattern.
