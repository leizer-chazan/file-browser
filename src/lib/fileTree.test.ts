import { describe, expect, it } from 'vitest'
import { buildFileTree, formatFileSize, getAllDirectoryPaths, getFileType, type LocalFile } from './fileTree'

function file(name: string, relativePath: string, type = '', size = 1024): LocalFile {
  return Object.assign(
    new Blob([new Uint8Array(size)], { type }),
    { name, webkitRelativePath: relativePath, lastModified: 0 },
  )
}

describe('buildFileTree', () => {
  it('creates nested folders and sorts directories before files', () => {
    const tree = buildFileTree([
      file('zeta.txt', 'Photos/zeta.txt'),
      file('cover.png', 'Photos/Trips/cover.png', 'image/png'),
      file('alpha.txt', 'Photos/alpha.txt'),
    ], 'Photos')

    expect(tree.children?.map(({ name }) => name)).toEqual(['Trips', 'alpha.txt', 'zeta.txt'])
    expect(tree.children?.[0].children?.[0].path).toBe('Photos/Trips/cover.png')
  })

  it('sorts file names naturally without case sensitivity', () => {
    const tree = buildFileTree([
      file('photo10.jpg', 'Gallery/photo10.jpg'),
      file('photo2.jpg', 'Gallery/photo2.jpg'),
    ], 'Gallery')

    expect(tree.children?.map(({ name }) => name)).toEqual(['photo2.jpg', 'photo10.jpg'])
  })
})

describe('getAllDirectoryPaths', () => {
  it('collects the root and every nested directory, excluding files', () => {
    const tree = buildFileTree([
      file('cover.png', 'Photos/Trips/cover.png', 'image/png'),
      file('alpha.txt', 'Photos/alpha.txt'),
    ], 'Photos')

    expect(getAllDirectoryPaths(tree)).toEqual(['Photos', 'Photos/Trips'])
  })
})

describe('file formatting helpers', () => {
  it('formats sizes across units and handles invalid values', () => {
    expect(formatFileSize(0)).toBe('0 bytes')
    expect(formatFileSize(1536)).toBe('1.5 KB')
    expect(formatFileSize(-1)).toBe('—')
  })

  it('uses MIME type or falls back to the extension', () => {
    expect(getFileType(file('picture.png', 'Folder/picture.png', 'image/png'))).toBe('image/png')
    expect(getFileType(file('notes.md', 'Folder/notes.md'))).toBe('MD file')
  })
})
