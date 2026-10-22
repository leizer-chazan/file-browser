import { describe, expect, it } from 'vitest'
import { formatRelativeTime } from './relativeTime'

const NOW = new Date('2026-10-22T12:00:00Z')

function before(ms: number): Date {
  return new Date(NOW.getTime() - ms)
}

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

describe('formatRelativeTime', () => {
  it('returns "just now" for differences under a minute', () => {
    expect(formatRelativeTime(NOW, NOW)).toBe('just now')
    expect(formatRelativeTime(before(59 * SECOND), NOW)).toBe('just now')
  })

  it('formats minutes', () => {
    expect(formatRelativeTime(before(MINUTE), NOW)).toBe('1 minute ago')
    expect(formatRelativeTime(before(5 * MINUTE + 30 * SECOND), NOW)).toBe('5 minutes ago')
  })

  it('formats hours', () => {
    expect(formatRelativeTime(before(HOUR), NOW)).toBe('1 hour ago')
    expect(formatRelativeTime(before(23 * HOUR + 59 * MINUTE), NOW)).toBe('23 hours ago')
  })

  it('formats days', () => {
    expect(formatRelativeTime(before(DAY), NOW)).toBe('1 day ago')
    expect(formatRelativeTime(before(3 * DAY), NOW)).toBe('3 days ago')
  })

  it('formats months', () => {
    expect(formatRelativeTime(before(30 * DAY), NOW)).toBe('1 month ago')
    expect(formatRelativeTime(before(65 * DAY), NOW)).toBe('2 months ago')
    expect(formatRelativeTime(before(364 * DAY), NOW)).toBe('11 months ago')
  })

  it('formats years', () => {
    expect(formatRelativeTime(before(365 * DAY), NOW)).toBe('1 year ago')
    expect(formatRelativeTime(before(3 * 365 * DAY), NOW)).toBe('3 years ago')
  })

  it('formats future dates with "in"', () => {
    expect(formatRelativeTime(new Date(NOW.getTime() + 2 * HOUR), NOW)).toBe('in 2 hours')
    expect(formatRelativeTime(new Date(NOW.getTime() + 10 * SECOND), NOW)).toBe('just now')
  })

  it('accepts millisecond timestamps', () => {
    expect(formatRelativeTime(before(5 * MINUTE).getTime(), NOW.getTime())).toBe('5 minutes ago')
  })
})
