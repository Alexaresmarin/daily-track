import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus } from 'lucide-react'
import { useHabitStore } from '../store/useHabitStore'
import type { Habit, HabitFrequency } from '../store/types'

const COLORS: { value: string; bgClass: string }[] = [
  { value: 'violet', bgClass: 'bg-violet-500' },
  { value: 'blue', bgClass: 'bg-blue-500' },
  { value: 'green', bgClass: 'bg-green-500' },
  { value: 'orange', bgClass: 'bg-orange-500' },
  { value: 'pink', bgClass: 'bg-pink-500' },
  { value: 'red', bgClass: 'bg-red-500' },
]

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

type FormState = {
  name: string
  emoji: string
  color: string
  frequency: HabitFrequency
}

type SheetContentProps = {
  habit?: Habit
  onClose: () => void
}

// Separate component so state initialises fresh from props on every open
function SheetContent({ habit, onClose }: SheetContentProps) {
  const { addHabit, updateHabit, deleteHabit } = useHabitStore()
  const [form, setForm] = useState<FormState>(
    habit
      ? { name: habit.name, emoji: habit.emoji, color: habit.color, frequency: habit.frequency }
      : { name: '', emoji: '', color: 'violet', frequency: { type: 'daily' } }
  )
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  function validate(): boolean {
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.emoji.trim()) next.emoji = 'Emoji is required'
    if (form.frequency.type === 'days_of_week' && form.frequency.days.length === 0)
      next.frequency = 'Select at least one day'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSave() {
    if (!validate()) return
    if (habit) {
      updateHabit(habit.id, { name: form.name.trim(), emoji: form.emoji.trim(), color: form.color, frequency: form.frequency })
    } else {
      addHabit({ name: form.name.trim(), emoji: form.emoji.trim(), color: form.color, frequency: form.frequency })
    }
    onClose()
  }

  function handleDelete() {
    if (!habit) return
    deleteHabit(habit.id)
    onClose()
  }

  function setFrequencyType(type: HabitFrequency['type']) {
    if (type === 'daily') setForm(f => ({ ...f, frequency: { type: 'daily' } }))
    if (type === 'days_of_week') setForm(f => ({ ...f, frequency: { type: 'days_of_week', days: [] } }))
    if (type === 'times_per_week') setForm(f => ({ ...f, frequency: { type: 'times_per_week', times: 3 } }))
  }

  function toggleDay(day: number) {
    if (form.frequency.type !== 'days_of_week') return
    const days = form.frequency.days.includes(day)
      ? form.frequency.days.filter(d => d !== day)
      : [...form.frequency.days, day]
    setForm(f => ({ ...f, frequency: { type: 'days_of_week', days } }))
  }

  function setTimes(delta: number) {
    if (form.frequency.type !== 'times_per_week') return
    const times = Math.min(7, Math.max(1, form.frequency.times + delta))
    setForm(f => ({ ...f, frequency: { type: 'times_per_week', times } }))
  }

  return (
    <>
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
      </div>

      <div className="overflow-y-auto max-h-[85svh]">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-lg font-semibold">{habit ? 'Edit habit' : 'New habit'}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pb-6 flex flex-col gap-5">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Morning run"
              className="w-full px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-violet-500"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Emoji */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emoji</label>
            <input
              type="text"
              value={form.emoji}
              onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
              placeholder="🏃"
              className="w-24 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-violet-500 text-xl"
            />
            {errors.emoji && <p className="text-xs text-red-500">{errors.emoji}</p>}
          </div>

          {/* Color */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setForm(f => ({ ...f, color: c.value }))}
                  className={`w-8 h-8 rounded-full ${c.bgClass} transition-transform ${
                    form.color === c.value ? 'scale-125 ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
            <div className="flex gap-2">
              {(['daily', 'days_of_week', 'times_per_week'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFrequencyType(type)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    form.frequency.type === type
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {type === 'daily' ? 'Daily' : type === 'days_of_week' ? 'Days' : 'Weekly'}
                </button>
              ))}
            </div>

            {form.frequency.type === 'days_of_week' && (
              <div className="flex gap-1.5">
                {DAYS.map((label, i) => {
                  const active = form.frequency.type === 'days_of_week' && form.frequency.days.includes(i)
                  return (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                        active
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            )}

            {form.frequency.type === 'times_per_week' && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setTimes(-1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <Minus size={16} />
                </button>
                <span className="text-lg font-semibold w-8 text-center">
                  {form.frequency.type === 'times_per_week' ? form.frequency.times : 0}
                </span>
                <button
                  onClick={() => setTimes(1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <Plus size={16} />
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">times per week</span>
              </div>
            )}

            {errors.frequency && <p className="text-xs text-red-500">{errors.frequency}</p>}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-2xl bg-violet-600 text-white font-semibold active:scale-[0.98] transition-transform"
          >
            {habit ? 'Save changes' : 'Add habit'}
          </button>

          {/* Delete */}
          {habit && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full py-3 rounded-2xl text-red-500 font-medium text-sm"
            >
              Delete habit
            </button>
          )}

          {habit && confirmDelete && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">This will also delete all completion history.</p>
              <button
                onClick={handleDelete}
                className="w-full py-3 rounded-2xl bg-red-500 text-white font-semibold active:scale-[0.98] transition-transform"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

type Props = {
  isOpen: boolean
  onClose: () => void
  habit?: Habit
}

export default function HabitSheet({ isOpen, onClose, habit }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <SheetContent habit={habit} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
