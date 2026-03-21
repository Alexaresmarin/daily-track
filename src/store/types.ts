export type HabitFrequency =
  | { type: 'daily' }
  | { type: 'days_of_week'; days: number[] } // 0 = Sun, 6 = Sat
  | { type: 'times_per_week'; times: number }

export type Habit = {
  id: string
  name: string
  emoji: string
  color: string
  frequency: HabitFrequency
  createdAt: string // ISO date string
}

export type CompletionLog = {
  habitId: string
  date: string // 'YYYY-MM-DD'
}
