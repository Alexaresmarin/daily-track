import { motion } from 'framer-motion'
import { useHabitStore, isDueToday, isCompletedOn, toDateString } from '../store/useHabitStore'
import HabitRow from '../components/HabitRow'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
}

export default function Today() {
  const { habits, logs, toggleCompletion } = useHabitStore()
  const today = toDateString()
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const dueHabits = habits.filter(isDueToday)
  const completedCount = dueHabits.filter((h) => isCompletedOn(logs, h.id, today)).length
  const progress = dueHabits.length > 0 ? (completedCount / dueHabits.length) * 100 : 0

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-4 flex flex-col gap-6"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <h1 className="text-2xl font-bold">{dateLabel}</h1>
          {dueHabits.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400 pb-0.5">
              {completedCount} / {dueHabits.length}
            </span>
          )}
        </div>

        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-violet-600 dark:bg-violet-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          />
        </div>
      </div>

      {dueHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          {habits.length === 0 ? (
            <>
              <span className="text-4xl">🌱</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">No habits yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add some habits to get started</p>
            </>
          ) : (
            <>
              <span className="text-4xl">☀️</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">Nothing due today</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enjoy your rest day</p>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {dueHabits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              completed={isCompletedOn(logs, habit.id, today)}
              onToggle={() => toggleCompletion(habit.id, today)}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
