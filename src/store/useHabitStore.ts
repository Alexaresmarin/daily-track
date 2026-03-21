import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Habit, CompletionLog, HabitFrequency } from './types'

// Returns today's date as 'YYYY-MM-DD'
export function toDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

// Returns the day-of-week index for a given date string (0 = Sun, 6 = Sat)
function dayOfWeek(dateStr: string): number {
  return new Date(dateStr + 'T12:00:00').getDay()
}

// Returns all 'YYYY-MM-DD' strings for the week containing the given date (Mon–Sun)
function getWeekDates(dateStr: string): string[] {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay() // 0 = Sun
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday)
    dd.setDate(monday.getDate() + i)
    return toDateString(dd)
  })
}

// Whether a habit is due on a specific date
export function isDueOn(habit: Habit, dateStr: string): boolean {
  const { frequency } = habit
  if (frequency.type === 'daily') return true
  if (frequency.type === 'days_of_week') return frequency.days.includes(dayOfWeek(dateStr))
  if (frequency.type === 'times_per_week') {
    // times_per_week habits are always "eligible" on any day —
    // the user decides which days they complete them
    return true
  }
  return false
}

// Whether a habit is due today
export function isDueToday(habit: Habit): boolean {
  return isDueOn(habit, toDateString())
}

// Whether a habit was completed on a specific date
export function isCompletedOn(logs: CompletionLog[], habitId: string, dateStr: string): boolean {
  return logs.some(l => l.habitId === habitId && l.date === dateStr)
}

// Current streak for a habit (consecutive due days completed, counting back from today)
export function getStreak(habit: Habit, logs: CompletionLog[]): number {
  let streak = 0
  const today = new Date()

  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = toDateString(d)

    if (!isDueOn(habit, dateStr)) continue // skip non-due days

    if (habit.frequency.type === 'times_per_week') {
      // For times_per_week: check if the weekly target was met for that week
      const weekDates = getWeekDates(dateStr)
      const completionsThisWeek = weekDates.filter(wd => isCompletedOn(logs, habit.id, wd)).length
      if (completionsThisWeek >= habit.frequency.times) {
        // Only count each week once (when we hit Monday of that week)
        if (dateStr === weekDates[0]) streak++
        continue
      } else {
        break
      }
    }

    if (isCompletedOn(logs, habit.id, dateStr)) {
      streak++
    } else {
      // Allow missing today without breaking the streak
      if (i === 0) continue
      break
    }
  }

  return streak
}

// Completions for a habit over the last N days
export function getCompletionsForRange(
  logs: CompletionLog[],
  habitId: string,
  days: number
): string[] {
  const today = new Date()
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (days - 1 - i))
    return toDateString(d)
  }).filter(dateStr => isCompletedOn(logs, habitId, dateStr))
}

type HabitStore = {
  habits: Habit[]
  logs: CompletionLog[]

  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void
  updateHabit: (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void
  deleteHabit: (id: string) => void

  toggleCompletion: (habitId: string, date: string) => void
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: [],
      logs: [],

      addHabit: (habit) =>
        set((state) => ({
          habits: [
            ...state.habits,
            { ...habit, id: nanoid(), createdAt: toDateString() },
          ],
        })),

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          logs: state.logs.filter((l) => l.habitId !== id),
        })),

      toggleCompletion: (habitId, date) =>
        set((state) => {
          const exists = isCompletedOn(state.logs, habitId, date)
          return {
            logs: exists
              ? state.logs.filter((l) => !(l.habitId === habitId && l.date === date))
              : [...state.logs, { habitId, date }],
          }
        }),
    }),
    { name: 'daily-track-store' }
  )
)

// Frequency label for display
export function frequencyLabel(frequency: HabitFrequency): string {
  if (frequency.type === 'daily') return 'Every day'
  if (frequency.type === 'times_per_week') return `${frequency.times}× per week`
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return frequency.days.map((d) => dayNames[d]).join(', ')
}
