import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import BottomNav from './components/BottomNav'
import Today from './pages/Today'
import Habits from './pages/Habits'
import Stats from './pages/Stats'

function AppRoutes() {
  const location = useLocation()
  return (
    <div
      className="flex flex-col min-h-svh bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: '4rem' }}
      >
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Today />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
