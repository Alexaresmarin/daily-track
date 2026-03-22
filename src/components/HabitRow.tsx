import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'
import type { Habit } from '../store/types'

type Props = {
  habit: Habit
  completed: boolean
  onToggle: () => void
}

export default function HabitRow({ habit, completed, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-3 w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 active:scale-[0.98] transition-transform text-left"
    >
      <span className="text-2xl leading-none">{habit.emoji}</span>
      <span
        className={`flex-1 font-medium transition-colors ${
          completed ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100'
        }`}
      >
        {habit.name}
      </span>
      <motion.div
        key={String(completed)}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      >
        {completed ? (
          <CheckCircle2 size={24} className="text-violet-600 dark:text-violet-400" />
        ) : (
          <Circle size={24} className="text-gray-300 dark:text-gray-600" />
        )}
      </motion.div>
    </button>
  )
}
