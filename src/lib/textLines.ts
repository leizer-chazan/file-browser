const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'json', 'csv', 'tsv', 'log', 'yml', 'yaml',
  'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'htm', 'xml', 'svg',
  'sh', 'py', 'java', 'c', 'cpp', 'h', 'rs', 'go', 'rb', 'php',
  'sql', 'ini', 'conf', 'env',
])

export function isSupportedTextFile(file: Pick<Blob, 'type'> & { name: string }): boolean {
  if (file.type.startsWith('text/')) return true
  if (file.type === 'application/json' || file.type === 'application/xml') return true
  if (file.type) return false
  const extension = file.name.split('.').pop()?.toLowerCase()
  return Boolean(extension && extension !== file.name && TEXT_EXTENSIONS.has(extension))
}

export function countLines(content: string): number {
  if (content === '') return 0
  const lines = content.split(/\r\n|\r|\n/)
  if (lines[lines.length - 1] === '') lines.pop()
  return lines.length
}
