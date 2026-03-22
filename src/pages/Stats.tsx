import { useState } from 'react'
import { motion } from 'framer-motion'
import { useHabitStore } from '../store/useHabitStore'
import HabitStatCard from '../components/HabitStatCard'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
}

export type StatFilter = '7d' | '1m' | '3m'

const FILTERS: { value: StatFilter; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '1m', label: '1 month' },
  { value: '3m', label: '3 months' },
]

export default function Stats() {
  const { habits } = useHabitStore()
  const [filter, setFilter] = useState<StatFilter>('1m')

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-4 flex flex-col gap-4"
    >
      <h1 className="text-2xl font-bold">Stats</h1>

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <span className="text-4xl">📊</span>
          <p className="font-medium text-gray-900 dark:text-gray-100">No data yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add habits and start tracking to see your stats</p>
        </div>
      ) : (
        <>
          {/* Filter pills */}
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {habits.map(habit => (
              <HabitStatCard key={habit.id} habit={habit} filter={filter} />
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}
