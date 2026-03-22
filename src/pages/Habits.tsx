import { useState } from 'react'
import { motion, Reorder, useDragControls } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useHabitStore } from '../store/useHabitStore'
import HabitSheet from '../components/HabitSheet'
import SwipeableHabitRow from '../components/SwipeableHabitRow'
import type { Habit } from '../store/types'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
}

function ReorderRow({ habit, onEdit }: { habit: Habit; onEdit: () => void }) {
  const controls = useDragControls()
  return (
    <Reorder.Item value={habit} dragListener={false} dragControls={controls}>
      <SwipeableHabitRow habit={habit} onEdit={onEdit} dragControls={controls} />
    </Reorder.Item>
  )
}

export default function Habits() {
  const { habits, reorderHabits } = useHabitStore()
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
          <Reorder.Group
            axis="y"
            values={habits}
            onReorder={reorderHabits}
            className="flex flex-col gap-2"
          >
            {habits.map(habit => (
              <ReorderRow key={habit.id} habit={habit} onEdit={() => openEdit(habit)} />
            ))}
          </Reorder.Group>
        )}
      </motion.div>

      <HabitSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} habit={editing} />
    </>
  )
}
