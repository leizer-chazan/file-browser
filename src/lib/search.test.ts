import { describe, expect, it } from 'vitest'
import { buildFileTree, type LocalFile } from './fileTree'
import { getAncestorPaths, searchFileTree } from './search'

function file(name: string, relativePath: string): LocalFile {
  return Object.assign(
    new Blob([new Uint8Array(10)]),
    { name, webkitRelativePath: relativePath, lastModified: 0 },
  )
}

describe('searchFileTree', () => {
  const tree = buildFileTree([
    file('setting.txt', 'Root/folder1/subfolder/setting.txt'),
    file('setting.txt', 'Root/folder2/setting.txt'),
    file('other.txt', 'Root/folder2/other.txt'),
  ], 'Root')

  it('matches entries by name across nested folders and returns full paths', () => {
    const results = searchFileTree(tree, 'setting')
    expect(results.map((entry) => entry.path)).toEqual([
      'Root/folder1/subfolder/setting.txt',
      'Root/folder2/setting.txt',
    ])
  })

  it('is case-insensitive and matches substrings', () => {
    expect(searchFileTree(tree, 'SET')).toHaveLength(2)
  })

  it('returns no results for an empty or blank query', () => {
    expect(searchFileTree(tree, '   ')).toEqual([])
  })

  it('caps the number of results to the given maximum', () => {
    const manyFiles = Array.from(
      { length: 150 },
      (_, index) => file(`match-${index}.txt`, `Many/match-${index}.txt`),
    )
    const bigTree = buildFileTree(manyFiles, 'Many')
    expect(searchFileTree(bigTree, 'match', 100)).toHaveLength(100)
  })
})

describe('getAncestorPaths', () => {
  it('returns every ancestor directory path, excluding the entry itself', () => {
    expect(getAncestorPaths('Root/folder1/subfolder/setting.txt')).toEqual([
      'Root',
      'Root/folder1',
      'Root/folder1/subfolder',
    ])
  })

  it('returns an empty array for a root-level path', () => {
    expect(getAncestorPaths('Root')).toEqual([])
  })
})
