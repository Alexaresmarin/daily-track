import { useHabitStore, getStreak, isDueOn, isCompletedOn, toDateString, frequencyLabel } from '../store/useHabitStore'
import type { Habit } from '../store/types'
import type { StatFilter } from '../pages/Stats'

const COLOR_HEX: Record<string, string> = {
  violet: '#7c3aed',
  blue: '#2563eb',
  green: '#16a34a',
  orange: '#ea580c',
  pink: '#db2777',
  red: '#dc2626',
}


type Cell = {
  dateStr: string
  due: boolean
  completed: boolean
  isFuture: boolean
  beforeCreation: boolean
  label: string
}

function buildCells(habit: Habit, logs: ReturnType<typeof useHabitStore.getState>['logs'], filter: StatFilter): Cell[] {
  const todayStr = toDateString()
  const today = new Date(todayStr + 'T12:00:00')

  if (filter === '7d') {
    const cells: Cell[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = toDateString(d)
      cells.push({
        dateStr,
        due: isDueOn(habit, dateStr),
        completed: isCompletedOn(logs, habit.id, dateStr),
        isFuture: false,
        beforeCreation: dateStr < habit.createdAt,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2),
      })
    }
    return cells
  }

  // For grid views: end on Sunday of current week
  const todayDow = (today.getDay() + 6) % 7
  const end = new Date(today)
  end.setDate(today.getDate() + (6 - todayDow))

  // Start on Monday of the week N days ago — always use full filter window
  const days = filter === '1m' ? 29 : 89
  const rawStart = new Date(today)
  rawStart.setDate(today.getDate() - days)
  const startDow = (rawStart.getDay() + 6) % 7
  const start = new Date(rawStart)
  start.setDate(rawStart.getDate() - startDow)

  const cells: Cell[] = []
  const cur = new Date(start)
  const endStr = toDateString(end)

  while (toDateString(cur) <= endStr) {
    const dateStr = toDateString(cur)
    cells.push({
      dateStr,
      due: isDueOn(habit, dateStr),
      completed: isCompletedOn(logs, habit.id, dateStr),
      isFuture: dateStr > todayStr,
      beforeCreation: dateStr < habit.createdAt,
      label: cur.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2),
    })
    cur.setDate(cur.getDate() + 1)
  }

  return cells
}

// Group flat day array into weeks (columns of 7)
function toWeeks(cells: Cell[]): Cell[][] {
  const weeks: Cell[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

function dotColor(cell: Cell): string {
  if (cell.beforeCreation) return 'rgba(255,255,255,0.10)' // pre-creation: very subtle structure
  if (cell.isFuture) return 'rgba(255,255,255,0.15)'       // future: visible placeholder
  if (cell.completed) return 'rgba(255,255,255,0.90)'      // done: bright
  if (cell.due) return 'rgba(255,255,255,0.28)'            // not done: dim
  return 'rgba(255,255,255,0.10)'                          // not a due day
}

type Props = { habit: Habit; filter: StatFilter }

export default function HabitStatCard({ habit, filter }: Props) {
  const { logs } = useHabitStore()
  const streak = getStreak(habit, logs)
  const color = COLOR_HEX[habit.color] ?? COLOR_HEX.violet
  const cells = buildCells(habit, logs, filter)
  const weeks = toWeeks(cells)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: color }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-white/20">
          {habit.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{habit.name}</p>
          <p className="text-xs text-white/60">{frequencyLabel(habit.frequency)}</p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-2xl font-bold text-white leading-none">{streak}</span>
          <span className="text-[10px] text-white/60">day streak</span>
        </div>
      </div>

      {filter === '7d' ? (
        /* 7-day: single horizontal row with day labels */
        <div className="px-4 pb-4 flex gap-1.5">
          {cells.map(cell => (
            <div key={cell.dateStr} className="flex flex-col items-center gap-1 flex-1">
              <div
                className="w-full rounded-md"
                style={{ aspectRatio: '1', backgroundColor: dotColor(cell) }}
              />
              <span className="text-[10px] text-white/50">{cell.label}</span>
            </div>
          ))}
        </div>
      ) : filter === '1m' ? (
        /* 1 month: mini calendar — fixed height to match other views */
        <div className="px-3 pb-4" style={{ height: '84px' }}>
          <div className="flex flex-col gap-[3px] h-full">
            {/* Day-of-week header */}
            <div className="flex gap-[3px]">
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <span key={i} className="flex-1 text-center text-[9px] text-white/50">{d}</span>
              ))}
            </div>
            {/* Week rows — fill remaining height */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex gap-[3px] flex-1">
                {week.map(cell => (
                  <div
                    key={cell.dateStr}
                    className="flex-1 rounded-sm"
                    style={{ backgroundColor: dotColor(cell) }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 3 months: cols = weeks (oldest left), rows = days Mon→Sun */
        <div className="px-3 pb-4 flex gap-[3px]" style={{ height: '84px' }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px] flex-1">
              {week.map(cell => (
                <div
                  key={cell.dateStr}
                  className="flex-1 rounded-sm"
                  style={{ backgroundColor: dotColor(cell) }}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
