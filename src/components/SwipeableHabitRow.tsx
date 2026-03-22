import { useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import type { DragControls } from 'framer-motion'
import { Trash2, ChevronRight, GripVertical } from 'lucide-react'
import { useHabitStore, frequencyLabel } from '../store/useHabitStore'
import type { Habit } from '../store/types'

const COLOR_DOT: Record<string, string> = {
  violet: 'bg-violet-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  red: 'bg-red-500',
}

const THRESHOLD = -60

type Props = {
  habit: Habit
  onEdit: () => void
  dragControls?: DragControls
}

export default function SwipeableHabitRow({ habit, onEdit, dragControls }: Props) {
  const { deleteHabit } = useHabitStore()
  const [confirming, setConfirming] = useState(false)
  const x = useMotionValue(0)
  const trashOpacity = useTransform(x, [-72, -20], [1, 0])
  const trashScale = useTransform(x, [-72, -20], [1, 0.5])

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x < THRESHOLD) {
      animate(x, -72, { type: 'spring', stiffness: 400, damping: 30 })
      setConfirming(true)
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
    }
  }

  function handleCancel() {
    setConfirming(false)
    animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
  }

  function handleConfirm() {
    deleteHabit(habit.id)
  }

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden">
        {/* Red background revealed on swipe */}
        <div className="absolute inset-0 flex items-center justify-end bg-red-500 px-5">
          <motion.div style={{ opacity: trashOpacity, scale: trashScale }}>
            <Trash2 size={20} className="text-white" />
          </motion.div>
        </div>

        {/* Draggable row */}
        <motion.div
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -80, right: 0 }}
          dragElastic={0.05}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          onClick={confirming ? undefined : onEdit}
          onKeyDown={confirming ? undefined : (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onEdit()
            }
          }}
          role="button"
          tabIndex={0}
          className="relative flex items-center gap-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 text-left w-full cursor-pointer"
        >
          {dragControls && (
            <div
              onPointerDown={(e) => { e.preventDefault(); dragControls.start(e) }}
              className="text-gray-300 dark:text-gray-600 cursor-grab active:cursor-grabbing touch-none shrink-0"
            >
              <GripVertical size={18} />
            </div>
          )}
          <div className={`w-3 h-3 rounded-full shrink-0 ${COLOR_DOT[habit.color] ?? 'bg-gray-400'}`} />
          <span className="text-xl leading-none">{habit.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{habit.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{frequencyLabel(habit.frequency)}</p>
          </div>
          <ChevronRight size={16} className="text-gray-400 shrink-0" />
        </motion.div>
      </div>

      {/* Confirmation dialog */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancel} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="relative w-full max-w-xs bg-white dark:bg-gray-900 rounded-2xl p-6 flex flex-col gap-4 shadow-xl"
          >
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100">Delete "{habit.name}"?</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This will remove the habit and all its history. This can't be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
