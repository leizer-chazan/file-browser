import type { ExplorerEntry } from './fileTree'

export function searchFileTree(root: ExplorerEntry, query: string, maxResults = 100): ExplorerEntry[] {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return []
  const results: ExplorerEntry[] = []
  collectMatches(root, normalized, maxResults, results)
  return results
}

function collectMatches(
  entry: ExplorerEntry,
  query: string,
  maxResults: number,
  results: ExplorerEntry[],
): void {
  if (results.length >= maxResults) return
  if (entry.name.toLocaleLowerCase().includes(query)) results.push(entry)
  for (const child of entry.children ?? []) {
    if (results.length >= maxResults) return
    collectMatches(child, query, maxResults, results)
  }
}

export function getAncestorPaths(path: string): string[] {
  const segments = path.split('/')
  const ancestors: string[] = []
  for (let index = 1; index < segments.length; index++) {
    ancestors.push(segments.slice(0, index).join('/'))
  }
  return ancestors
}
