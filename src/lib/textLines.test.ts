import { describe, expect, it } from 'vitest'
import { countLines, isSupportedTextFile } from './textLines'

describe('countLines', () => {
  it('counts LF-separated lines', () => {
    expect(countLines('alpha\nbeta')).toBe(2)
  })

  it('does not count an extra line for a trailing newline', () => {
    expect(countLines('alpha\nbeta\n')).toBe(2)
  })

  it('returns 0 for empty content', () => {
    expect(countLines('')).toBe(0)
  })

  it('handles mixed CRLF and CR line endings', () => {
    expect(countLines('alpha\r\nbeta\rgamma\n')).toBe(3)
  })
})

describe('isSupportedTextFile', () => {
  it('accepts text/* mime types', () => {
    expect(isSupportedTextFile({ type: 'text/plain', name: 'notes.txt' })).toBe(true)
  })

  it('accepts known extensions when the mime type is missing', () => {
    expect(isSupportedTextFile({ type: '', name: 'README.md' })).toBe(true)
  })

  it('rejects binary mime types', () => {
    expect(isSupportedTextFile({ type: 'image/png', name: 'cover.png' })).toBe(false)
  })

  it('rejects unknown extensions with no mime type', () => {
    expect(isSupportedTextFile({ type: '', name: 'archive.bin' })).toBe(false)
  })
})
