import { describe, it, expect } from 'vitest'
import {
  toDateString,
  isDueOn,
  isDueToday,
  isCompletedOn,
  getStreak,
  getCompletionsForRange,
} from './useHabitStore'
import type { Habit, CompletionLog } from './types'

// ─── Helpers ────────────────────────────────────────────────────────────────

// Returns the last N dates (relative to today) that fall on any of the given days-of-week
function lastOccurrencesOf(dows: number[], n: number): string[] {
  const result: string[] = []
  const today = new Date()
  for (let i = 0; result.length < n; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (dows.includes(d.getDay())) result.push(toDateString(d))
  }
  return result
}

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Test',
    emoji: '✅',
    color: '#000',
    frequency: { type: 'daily' },
    createdAt: '2026-01-01',
    ...overrides,
  }
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toDateString(d)
}

// ─── toDateString ────────────────────────────────────────────────────────────

describe('toDateString', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(toDateString(new Date('2026-03-15T10:00:00'))).toBe('2026-03-15')
  })

  it('uses local date, not UTC (catches midnight boundary regression)', () => {
    // Set to 11pm local tonight. In zones west of UTC (e.g. America/New_York, UTC-5),
    // 11pm local = 4am UTC next day, so toISOString().slice(0,10) would return tomorrow.
    // Our local implementation must return today's local date regardless.
    // CI runs with TZ=America/New_York to guarantee a negative UTC offset.
    const d = new Date()
    d.setHours(23, 0, 0, 0)
    const expected = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-')
    expect(toDateString(d)).toBe(expected)
    // getTimezoneOffset() is positive for zones west of UTC (UTC-x).
    // Only in those zones does 11pm local spill into the next UTC day.
    const utcDate = d.toISOString().slice(0, 10)
    if (new Date().getTimezoneOffset() > 0) {
      expect(utcDate).not.toBe(expected)
    }
  })
})

// ─── isDueOn / isDueToday ────────────────────────────────────────────────────

describe('isDueOn', () => {
  it('daily habit is due every day', () => {
    const habit = makeHabit({ frequency: { type: 'daily' } })
    expect(isDueOn(habit, '2026-03-10')).toBe(true)
    expect(isDueOn(habit, '2026-03-15')).toBe(true)
  })

  it('days_of_week habit is due only on specified days', () => {
    // Monday = 1, Wednesday = 3
    const habit = makeHabit({ frequency: { type: 'days_of_week', days: [1, 3] } })
    expect(isDueOn(habit, '2026-03-16')).toBe(true)  // Monday
    expect(isDueOn(habit, '2026-03-18')).toBe(true)  // Wednesday
    expect(isDueOn(habit, '2026-03-17')).toBe(false) // Tuesday
    expect(isDueOn(habit, '2026-03-21')).toBe(false) // Saturday
  })

  it('times_per_week habit is eligible every day', () => {
    const habit = makeHabit({ frequency: { type: 'times_per_week', times: 3 } })
    expect(isDueOn(habit, '2026-03-16')).toBe(true)
    expect(isDueOn(habit, '2026-03-21')).toBe(true)
  })

  it('isDueToday returns true for a daily habit', () => {
    const habit = makeHabit({ frequency: { type: 'daily' } })
    expect(isDueToday(habit)).toBe(true)
  })
})

// ─── isCompletedOn ───────────────────────────────────────────────────────────

describe('isCompletedOn', () => {
  const logs: CompletionLog[] = [
    { habitId: 'h1', date: '2026-03-15' },
    { habitId: 'h2', date: '2026-03-15' },
  ]

  it('returns true when log exists', () => {
    expect(isCompletedOn(logs, 'h1', '2026-03-15')).toBe(true)
  })

  it('returns false for different habit', () => {
    expect(isCompletedOn(logs, 'h3', '2026-03-15')).toBe(false)
  })

  it('returns false for different date', () => {
    expect(isCompletedOn(logs, 'h1', '2026-03-16')).toBe(false)
  })

  it('returns false for empty logs', () => {
    expect(isCompletedOn([], 'h1', '2026-03-15')).toBe(false)
  })
})

// ─── getStreak ───────────────────────────────────────────────────────────────

describe('getStreak — daily', () => {
  it('returns 0 with no completions', () => {
    const habit = makeHabit()
    expect(getStreak(habit, [])).toBe(0)
  })

  it('returns 1 when only today is completed', () => {
    const habit = makeHabit()
    const logs: CompletionLog[] = [{ habitId: 'h1', date: daysAgo(0) }]
    expect(getStreak(habit, logs)).toBe(1)
  })

  it('counts consecutive days correctly', () => {
    const habit = makeHabit()
    const logs: CompletionLog[] = [
      { habitId: 'h1', date: daysAgo(0) },
      { habitId: 'h1', date: daysAgo(1) },
      { habitId: 'h1', date: daysAgo(2) },
    ]
    expect(getStreak(habit, logs)).toBe(3)
  })

  it('does not break streak when today is not yet completed', () => {
    const habit = makeHabit()
    const logs: CompletionLog[] = [
      { habitId: 'h1', date: daysAgo(1) },
      { habitId: 'h1', date: daysAgo(2) },
    ]
    expect(getStreak(habit, logs)).toBe(2)
  })

  it('breaks streak on a missed day', () => {
    const habit = makeHabit()
    const logs: CompletionLog[] = [
      { habitId: 'h1', date: daysAgo(0) },
      { habitId: 'h1', date: daysAgo(1) },
      // gap on daysAgo(2)
      { habitId: 'h1', date: daysAgo(3) },
    ]
    expect(getStreak(habit, logs)).toBe(2)
  })
})

describe('getStreak — days_of_week', () => {
  it('skips non-due days when counting streak', () => {
    // Mon + Wed only — use dynamic dates so this never time-bombs
    const habit = makeHabit({ frequency: { type: 'days_of_week', days: [1, 3] } })
    const recentDates = lastOccurrencesOf([1, 3], 4) // last 4 Mon or Wed occurrences
    const logs: CompletionLog[] = recentDates.map(date => ({ habitId: 'h1', date }))
    expect(getStreak(habit, logs)).toBeGreaterThanOrEqual(4)
  })
})

describe('getStreak — times_per_week', () => {
  it('returns 0 when no week met the quota', () => {
    const habit = makeHabit({ id: 'h1', frequency: { type: 'times_per_week', times: 3 } })
    expect(getStreak(habit, [])).toBe(0)
  })
})

// ─── getCompletionsForRange ──────────────────────────────────────────────────

describe('getCompletionsForRange', () => {
  it('returns only dates within range that have completions', () => {
    const logs: CompletionLog[] = [
      { habitId: 'h1', date: daysAgo(0) },
      { habitId: 'h1', date: daysAgo(2) },
      { habitId: 'h1', date: daysAgo(10) }, // outside 7-day range
    ]
    const result = getCompletionsForRange(logs, 'h1', 7)
    expect(result).toContain(daysAgo(0))
    expect(result).toContain(daysAgo(2))
    expect(result).not.toContain(daysAgo(10))
  })

  it('returns empty array when no completions', () => {
    expect(getCompletionsForRange([], 'h1', 7)).toEqual([])
  })
})
