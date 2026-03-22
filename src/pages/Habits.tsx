import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, ChevronRight } from 'lucide-react'
import { useHabitStore, frequencyLabel } from '../store/useHabitStore'
import HabitSheet from '../components/HabitSheet'
import type { Habit } from '../store/types'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
}

const COLOR_DOT: Record<string, string> = {
  violet: 'bg-violet-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  red: 'bg-red-500',
}

export default function Habits() {
  const { habits } = useHabitStore()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Habit | undefined>()

  function openAdd() {
    setEditing(undefined)
    setSheetOpen(true)
  }

  function openEdit(habit: Habit) {
    setEditing(habit)
    setSheetOpen(true)
  }

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="p-4 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Habits</h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 text-white text-sm font-medium active:scale-[0.97] transition-transform"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <span className="text-4xl">✨</span>
            <p className="font-medium text-gray-900 dark:text-gray-100">No habits yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tap Add to create your first habit</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {habits.map(habit => (
              <button
                key={habit.id}
                onClick={() => openEdit(habit)}
                className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 active:scale-[0.98] transition-transform text-left w-full"
              >
                <div className={`w-3 h-3 rounded-full shrink-0 ${COLOR_DOT[habit.color] ?? 'bg-gray-400'}`} />
                <span className="text-xl leading-none">{habit.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{habit.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{frequencyLabel(habit.frequency)}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <HabitSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} habit={editing} />
    </>
  )
}
