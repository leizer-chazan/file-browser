const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const MONTH = 30 * DAY
const YEAR = 365 * DAY

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? '' : 's'}`
}

export function formatRelativeTime(date: Date | number, now: Date | number): string {
  const diff = new Date(now).getTime() - new Date(date).getTime()
  if (Number.isNaN(diff)) return ''
  const elapsed = Math.abs(diff)
  if (elapsed < MINUTE) return 'just now'

  let amount: string
  if (elapsed < HOUR) amount = plural(Math.floor(elapsed / MINUTE), 'minute')
  else if (elapsed < DAY) amount = plural(Math.floor(elapsed / HOUR), 'hour')
  else if (elapsed < MONTH) amount = plural(Math.floor(elapsed / DAY), 'day')
  else if (elapsed < YEAR) amount = plural(Math.min(11, Math.floor(elapsed / MONTH)), 'month')
  else amount = plural(Math.floor(elapsed / YEAR), 'year')

  return diff < 0 ? `in ${amount}` : `${amount} ago`
}
