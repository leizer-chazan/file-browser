import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties, InputHTMLAttributes, ReactNode } from 'react'
import {
  buildFileTree,
  formatFileSize,
  getAllDirectoryPaths,
  getFileType,
  isLargeFile,
  type ExplorerEntry,
} from './lib/fileTree'
import { readImageMetadata, type ImageMetadata } from './lib/imageMetadata'
import { formatRelativeTime } from './lib/relativeTime'
import { getAncestorPaths, searchFileTree } from './lib/search'
import { countLines, isSupportedTextFile } from './lib/textLines'
import { useDebouncedValue } from './hooks/useDebouncedValue'

const SEARCH_DEBOUNCE_MS = 300
const MAX_SEARCH_RESULTS = 100
const RELATIVE_TIME_REFRESH_MS = 60_000

interface DirectoryHandleLike {
  readonly name: string
  values(): AsyncIterable<DirectoryHandleLike | FileHandleLike>
}

interface FileHandleLike {
  readonly name: string
  getFile(): Promise<File>
}

interface DirectoryPickerWindow extends Window {
  showDirectoryPicker?: () => Promise<DirectoryHandleLike>
}

async function collectDirectoryFiles(
  handle: DirectoryHandleLike,
  rootName = handle.name,
  parentPath = rootName,
): Promise<File[]> {
  const collected: File[] = []
  for await (const entry of handle.values()) {
    if ('getFile' in entry) {
      const file = await entry.getFile()
      Object.defineProperty(file, 'webkitRelativePath', {
        configurable: true,
        value: `${parentPath}/${file.name}`,
      })
      collected.push(file)
    } else {
      collected.push(...await collectDirectoryFiles(entry, rootName, `${parentPath}/${entry.name}`))
    }
  }
  return collected
}

function TreeItem({
  entry,
  depth,
  selectedPath,
  expandedPaths,
  onSelect,
  onToggle,
}: {
  entry: ExplorerEntry
  depth: number
  selectedPath: string
  expandedPaths: Set<string>
  onSelect: (entry: ExplorerEntry) => void
  onToggle: (path: string) => void
}) {
  const isDirectory = entry.kind === 'directory'
  const expanded = expandedPaths.has(entry.path)
  const selected = selectedPath === entry.path
  return (
    <>
      <button
        className={`tree-row${selected ? ' selected' : ''}`}
        style={{ '--depth': depth } as CSSProperties}
        data-path={entry.path}
        onClick={() => {
          onSelect(entry)
          if (isDirectory) onToggle(entry.path)
        }}
        aria-expanded={isDirectory ? expanded : undefined}
        aria-current={selected ? 'true' : undefined}
      >
        <span className={`chevron${expanded ? ' open' : ''}`} aria-hidden="true">
          {isDirectory ? '›' : ''}
        </span>
        <span className={`entry-icon ${isDirectory ? 'folder-icon' : 'file-icon'}`} aria-hidden="true">
          {isDirectory ? '▰' : '▤'}
        </span>
        <span className="tree-label">{entry.name}</span>
      </button>
      {isDirectory && expanded && entry.children?.map((child) => (
        <TreeItem
          key={child.path}
          entry={child}
          depth={depth + 1}
          selectedPath={selectedPath}
          expandedPaths={expandedPaths}
          onSelect={onSelect}
          onToggle={onToggle}
        />
      ))}
    </>
  )
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  )
}

function App() {
  const [files, setFiles] = useState<File[]>([])
  const [rootName, setRootName] = useState('')
  const [selectedPath, setSelectedPath] = useState('')
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [searchInput, setSearchInput] = useState('')
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null)
  const [imageError, setImageError] = useState('')
  const [lineCount, setLineCount] = useState<number | null>(null)
  const [lineCountError, setLineCountError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const inputRef = useRef<HTMLInputElement>(null)
  const treeContainerRef = useRef<HTMLDivElement>(null)
  const metadataRequest = useRef(0)

  const root = useMemo(() => rootName ? buildFileTree(files, rootName) : null, [files, rootName])
  const selected = useMemo(
    () => root ? findEntry(root, selectedPath) : null,
    [root, selectedPath],
  )
  const debouncedSearchQuery = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)
  const searchResults = useMemo(
    () => root ? searchFileTree(root, debouncedSearchQuery, MAX_SEARCH_RESULTS) : [],
    [root, debouncedSearchQuery],
  )

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), RELATIVE_TIME_REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!selectedPath) return
    const row = treeContainerRef.current?.querySelector<HTMLElement>(
      `[data-path="${CSS.escape(selectedPath)}"]`,
    )
    row?.scrollIntoView({ block: 'nearest' })
  }, [selectedPath, expandedPaths])

  async function chooseFolder() {
    setError('')
    const picker = (window as DirectoryPickerWindow).showDirectoryPicker
    if (!picker) {
      inputRef.current?.click()
      return
    }
    try {
      setIsLoading(true)
      const handle = await picker()
      const folderFiles = await collectDirectoryFiles(handle)
      loadFiles(folderFiles, handle.name)
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') return
      setError(cause instanceof Error ? cause.message : 'The folder could not be opened.')
    } finally {
      setIsLoading(false)
    }
  }

  function loadFiles(nextFiles: File[], name: string) {
    setFiles(nextFiles)
    setRootName(name)
    setSelectedPath(name)
    setExpandedPaths(new Set([name]))
    setImageMetadata(null)
    setImageError('')
    setSearchInput('')
  }

  function handleDirectoryInput(event: ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.currentTarget.files ?? [])
    if (!chosen.length) return
    const name = chosen[0].webkitRelativePath.split('/')[0] || 'Folder'
    loadFiles(chosen, name)
    event.currentTarget.value = ''
  }

  function selectEntry(entry: ExplorerEntry) {
    const requestId = ++metadataRequest.current
    setSelectedPath(entry.path)
    setImageMetadata(null)
    setImageError('')
    setLineCount(null)
    setLineCountError('')
    if (entry.kind === 'file' && entry.file && entry.file.type.startsWith('image/')) {
      void readImageMetadata(entry.file)
        .then((metadata) => {
          if (metadataRequest.current === requestId) setImageMetadata(metadata)
        })
        .catch((cause: unknown) => {
          if (metadataRequest.current === requestId) {
            setImageError(cause instanceof Error ? cause.message : 'Image metadata could not be read.')
          }
        })
    } else if (entry.kind === 'file' && entry.file && isSupportedTextFile(entry.file)) {
      void entry.file.text()
        .then((content) => {
          if (metadataRequest.current === requestId) setLineCount(countLines(content))
        })
        .catch((cause: unknown) => {
          if (metadataRequest.current === requestId) {
            setLineCountError(cause instanceof Error ? cause.message : 'Lines could not be counted.')
          }
        })
    }
  }

  function expandAll() {
    if (!root) return
    setExpandedPaths(new Set(getAllDirectoryPaths(root)))
  }

  function collapseAll() {
    setExpandedPaths(new Set())
  }

  function togglePath(path: string) {
    setExpandedPaths((current) => {
      const next = new Set(current)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  function handleSearchResultSelect(entry: ExplorerEntry) {
    setExpandedPaths((current) => {
      const next = new Set(current)
      for (const ancestor of getAncestorPaths(entry.path)) next.add(ancestor)
      if (entry.kind === 'directory') next.add(entry.path)
      return next
    })
    selectEntry(entry)
    setSearchInput('')
  }

  const isImage = selected?.kind === 'file' && Boolean(selected.file?.type.startsWith('image/'))
  const imageUrl = useMemo(
    () => selected?.kind === 'file' && selected.file?.type.startsWith('image/')
      ? URL.createObjectURL(selected.file)
      : '',
    [selected],
  )
  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
  }, [imageUrl])

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">◫</span>
          <span>Folio</span>
          <span className="brand-divider" />
          <span className="brand-caption">Local file explorer</span>
        </div>
        <div className="privacy-note"><span className="privacy-dot" /> Files stay on your device</div>
      </header>

      <section className="workspace" aria-label="File explorer">
        <aside className="sidebar">
          <div className="sidebar-heading">
            <span className="section-kicker">BROWSER</span>
            {root && <span className="item-count">{files.length} items</span>}
          </div>
          <button className="choose-button" onClick={() => void chooseFolder()} disabled={isLoading}>
            <span className="button-icon" aria-hidden="true">＋</span>
            {isLoading ? 'Opening folder…' : root ? 'Choose another folder' : 'Choose a folder'}
          </button>
          <input
            ref={inputRef}
            className="visually-hidden"
            hidden
            type="file"
            multiple
            onChange={handleDirectoryInput}
            {...{ webkitdirectory: '', directory: '' } as InputHTMLAttributes<HTMLInputElement>}
          />
          {error && <p className="error-message" role="alert">{error}</p>}
          {root && (
            <div className="search-box-wrapper">
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input
                  aria-label="Search files"
                  placeholder="Search files"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </label>
              {searchInput.trim() && (
                <div className="search-results" role="listbox" aria-label="Search results">
                  {searchResults.length ? (
                    <>
                      {searchResults.map((entry) => (
                        <button
                          key={entry.path}
                          type="button"
                          className="search-result-row"
                          onClick={() => handleSearchResultSelect(entry)}
                        >
                          <span
                            className={`entry-icon ${entry.kind === 'directory' ? 'folder-icon' : 'file-icon'}`}
                            aria-hidden="true"
                          >
                            {entry.kind === 'directory' ? '▰' : '▤'}
                          </span>
                          <span className="search-result-path">{entry.path}</span>
                        </button>
                      ))}
                      {searchResults.length === MAX_SEARCH_RESULTS && (
                        <p className="search-results-note">Showing first {MAX_SEARCH_RESULTS} matches</p>
                      )}
                    </>
                  ) : (
                    <p className="search-results-empty">No matches found</p>
                  )}
                </div>
              )}
            </div>
          )}
          {root && (
            <div className="tree-toolbar">
              <button type="button" className="tree-toolbar-button" onClick={expandAll}>
                Expand all
              </button>
              <button type="button" className="tree-toolbar-button" onClick={collapseAll}>
                Collapse all
              </button>
            </div>
          )}
          <div className="tree-container" ref={treeContainerRef}>
            {root ? (
              <TreeItem
                entry={root}
                depth={0}
                selectedPath={selectedPath}
                expandedPaths={expandedPaths}
                onSelect={selectEntry}
                onToggle={togglePath}
              />
            ) : (
              <div className="empty-tree">
                <span className="empty-folder-icon" aria-hidden="true">▰</span>
                <p>Your files, beautifully organized.</p>
                <span>Choose a folder to get started.</span>
              </div>
            )}
          </div>
          <div className="sidebar-footer">
            <span className="lock-icon" aria-hidden="true">⌑</span>
            <span>Read-only · Nothing is uploaded</span>
          </div>
        </aside>

        <section className="content-area">
          <div className="toolbar">
            <div className="breadcrumb">
              <span className="breadcrumb-home" aria-hidden="true">⌂</span>
              <span className="breadcrumb-separator">/</span>
              <span>{rootName || 'No folder selected'}</span>
              {selected && selected.path !== rootName && (
                <>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-current">{selected.name}</span>
                </>
              )}
            </div>
          </div>

          {selected ? (
            <div className="detail-layout">
              <div className="preview-column">
                <div className="preview-heading">
                  <div>
                    <span className="section-kicker">PREVIEW</span>
                    <h1>{selected.name}</h1>
                  </div>
                  {selected.kind === 'file' && selected.file && (
                    <span className="file-size-chip">{formatFileSize(selected.file.size)}</span>
                  )}
                </div>
                <div className={`preview-card${isImage ? ' image-preview' : ''}`}>
                  {isImage && imageUrl ? (
                    <img src={imageUrl} alt={`Preview of ${selected.name}`} />
                  ) : selected.kind === 'directory' ? (
                    <div className="preview-placeholder">
                      <span className="large-folder-icon" aria-hidden="true">▰</span>
                      <h2>{selected.name}</h2>
                      <p>{selected.children?.length ?? 0} items in this folder</p>
                    </div>
                  ) : (
                    <div className="preview-placeholder">
                      <span className="large-file-icon" aria-hidden="true">▤</span>
                      <h2>{selected.name}</h2>
                      <p>{getFileType(selected.file)}</p>
                    </div>
                  )}
                </div>
                {isImage && (
                  <section className="metadata-section">
                    <div className="metadata-heading">
                      <h2>Image details</h2>
                      <span className="metadata-badge">IMAGE</span>
                    </div>
                    <div className="metadata-grid">
                      <DetailRow label="Dimensions" value={imageMetadata ? `${imageMetadata.width} × ${imageMetadata.height} px` : imageError || 'Reading…'} />
                      <DetailRow label="Camera" value={imageMetadata?.camera || '—'} />
                      <DetailRow label="Taken on" value={imageMetadata?.capturedAt || '—'} />
                      <DetailRow label="Exposure" value={imageMetadata?.exposure || '—'} />
                      <DetailRow label="ISO" value={imageMetadata?.iso || '—'} />
                      <DetailRow label="Location" value={imageMetadata?.location || '—'} />
                    </div>
                  </section>
                )}
              </div>

              <aside className="inspector">
                <div className="inspector-heading">
                  <span className="section-kicker">INFORMATION</span>
                  <span className="inspector-dots" aria-hidden="true">•••</span>
                </div>
                <div className="file-identity">
                  <span className={`identity-icon ${selected.kind === 'directory' ? 'folder-icon' : 'file-icon'}`} aria-hidden="true">
                    {selected.kind === 'directory' ? '▰' : '▤'}
                  </span>
                  <div className="identity-copy">
                    <strong>{selected.name}</strong>
                    <span>{selected.kind === 'directory' ? 'Folder' : getFileType(selected.file)}</span>
                  </div>
                </div>
                <div className="detail-list">
                  <DetailRow label="Kind" value={selected.kind === 'directory' ? 'Folder' : getFileType(selected.file)} />
                  <DetailRow
                    label="Size"
                    value={selected.kind === 'directory' ? (
                      `${selected.children?.length ?? 0} items`
                    ) : (
                      <>
                        {formatFileSize(selected.file?.size ?? 0)}
                        {isLargeFile(selected.file?.size ?? 0) && <span className="large-file-badge">Large</span>}
                      </>
                    )}
                  />
                  <DetailRow
                    label="Modified"
                    value={selected.kind === 'file' && selected.file ? (
                      <>
                        {new Date(selected.file.lastModified).toLocaleString()}
                        <span className="relative-time">{formatRelativeTime(selected.file.lastModified, now)}</span>
                      </>
                    ) : '—'}
                  />
                  {selected.kind === 'file' && selected.file && isSupportedTextFile(selected.file) && (
                    <DetailRow label="Lines" value={lineCountError || (lineCount === null ? 'Counting…' : lineCount)} />
                  )}
                  <DetailRow label="Location" value={selected.path} />
                </div>
                <div className="inspector-footnote">
                  <span className="info-icon" aria-hidden="true">i</span>
                  <span>This item is viewed locally. No files are changed.</span>
                </div>
              </aside>
            </div>
          ) : (
            <div className="welcome-state">
              <div className="welcome-mark" aria-hidden="true"><span>▰</span><span>▤</span></div>
              <span className="section-kicker">A CLEARER VIEW OF YOUR FILES</span>
              <h1>Make room for what matters.</h1>
              <p>Pick a folder to explore its contents. Your files never leave your device.</p>
              <button className="welcome-button" onClick={() => void chooseFolder()} disabled={isLoading}>
                <span aria-hidden="true">＋</span> Choose a folder
              </button>
              <span className="supported-note">Supports folders with images, documents, and more</span>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

function findEntry(root: ExplorerEntry, path: string): ExplorerEntry | null {
  if (root.path === path) return root
  for (const child of root.children ?? []) {
    const found = findEntry(child, path)
    if (found) return found
  }
  return null
}

export default App
