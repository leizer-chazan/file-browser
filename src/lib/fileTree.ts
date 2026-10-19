export interface LocalFile extends Blob {
  readonly name: string
  readonly lastModified: number
  readonly webkitRelativePath: string
}

export interface ExplorerEntry {
  readonly name: string
  readonly path: string
  readonly kind: 'file' | 'directory'
  readonly file?: LocalFile
  readonly children?: ExplorerEntry[]
}

interface MutableEntry {
  name: string
  path: string
  kind: 'file' | 'directory'
  file?: LocalFile
  children?: MutableEntry[]
}

export function buildFileTree(files: readonly LocalFile[], rootName: string): ExplorerEntry {
  const root: MutableEntry = { name: rootName, path: rootName, kind: 'directory', children: [] }

  for (const file of files) {
    const relativePath = file.webkitRelativePath.split('/').filter(Boolean)
    const parts = relativePath[0] === rootName ? relativePath.slice(1) : relativePath
    let current = root

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1
      const path = `${current.path}/${part}`
      let entry = current.children?.find((child) => child.name === part)
      if (!entry) {
        entry = isFile
          ? { name: part, path, kind: 'file', file }
          : { name: part, path, kind: 'directory', children: [] }
        current.children?.push(entry)
      }
      if (!isFile) current = entry
    })
  }

  sortEntries(root)
  return root
}

function sortEntries(entry: MutableEntry): void {
  entry.children?.sort((left, right) => {
    if (left.kind !== right.kind) return left.kind === 'directory' ? -1 : 1
    return left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: 'base' })
  })
  entry.children?.forEach(sortEntries)
}

export function getAllDirectoryPaths(entry: ExplorerEntry): string[] {
  if (entry.kind !== 'directory') return []
  const paths = [entry.path]
  for (const child of entry.children ?? []) {
    paths.push(...getAllDirectoryPaths(child))
  }
  return paths
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 bytes'
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB']
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / (1024 ** unitIndex)
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

const LARGE_FILE_THRESHOLD_BYTES = 10 * 1024 * 1024

export function isLargeFile(size: number): boolean {
  return size > LARGE_FILE_THRESHOLD_BYTES
}

export function getFileType(file?: Pick<LocalFile, 'name' | 'type'>): string {
  if (!file) return 'Unknown'
  if (file.type) return file.type
  const extension = file.name.split('.').pop()
  return extension && extension !== file.name ? `${extension.toUpperCase()} file` : 'Unknown'
}
