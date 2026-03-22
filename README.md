# daily-track

A minimal, mobile-first habit tracker built as an iOS-installable PWA. No accounts, no backend — just your habits and your progress.

## What it does

- **Track daily habits** with a simple tap-to-complete interface
- **Flexible frequency** — daily, specific days of the week, or X times per week
- **See your progress** — weekly dots and a monthly heatmap per habit
- **Light & dark mode** — follows your system preference
- **Works offline** — all data lives in your browser's localStorage
- **Installable** — add to your iOS home screen like a native app

## Tech stack

| Layer | Library |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| State + Persistence | Zustand + persist middleware |
| Routing | React Router v7 |
| PWA | vite-plugin-pwa |
| Icons | Lucide React |
| Animations | Framer Motion |

## App structure

```
/          Today view — habits due today, tap to complete
/habits    Manage habits — add, edit, delete
/stats     Streaks and history — weekly dots + monthly heatmap
```

## Data model

```ts
type HabitFrequency =
  | { type: 'daily' }
  | { type: 'days_of_week'; days: number[] }   // 0 = Sun … 6 = Sat
  | { type: 'times_per_week'; times: number }

type Habit = {
  id: string
  name: string
  emoji: string
  color: string
  frequency: HabitFrequency
  createdAt: string   // ISO date string
}

type CompletionLog = {
  habitId: string
  date: string        // 'YYYY-MM-DD'
}
```

## Branch strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, always working |
| `dev` | Integration — all feature PRs merge here |
| `feat/*` | One branch per issue, PR into `dev` |

## Getting started

```bash
npm install
npm run dev
```
