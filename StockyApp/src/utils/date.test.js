import { describe, it, expect, vi, afterEach } from 'vitest'
import { todayIso, toIso, addDays, formatDisplayDate, isToday } from './date'

describe('toIso', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toIso(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('pads single-digit months and days', () => {
    expect(toIso(new Date(2026, 8, 9))).toBe('2026-09-09')
  })
})

describe('addDays', () => {
  it('adds positive days within a month', () => {
    expect(addDays('2026-07-22', 3)).toBe('2026-07-25')
  })

  it('subtracts days across a month boundary', () => {
    expect(addDays('2026-07-01', -1)).toBe('2026-06-30')
  })

  it('rolls over a year boundary', () => {
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01')
  })
})

describe('formatDisplayDate', () => {
  it('formats an ISO date into a short weekday/month/day string', () => {
    const result = formatDisplayDate('2026-07-22')
    expect(result).toContain('22')
    expect(result).toMatch(/Jul/)
  })
})

describe('todayIso / isToday', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('todayIso matches toIso(new Date())', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 22))
    expect(todayIso()).toBe('2026-07-22')
  })

  it('isToday is true for the current date and false otherwise', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 22))
    expect(isToday('2026-07-22')).toBe(true)
    expect(isToday('2026-07-21')).toBe(false)
  })
})
