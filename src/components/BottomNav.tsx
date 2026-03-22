import { NavLink } from 'react-router-dom'
import { CalendarDays, ListChecks, BarChart2 } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Today', Icon: CalendarDays },
  { to: '/habits', label: 'Habits', Icon: ListChecks },
  { to: '/stats', label: 'Stats', Icon: BarChart2 },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex h-16">
        {tabs.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end
              className={({ isActive }) =>
                `flex flex-col items-center justify-center h-full gap-1 text-xs font-medium transition-colors ${isActive
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-gray-400 dark:text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.75} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
