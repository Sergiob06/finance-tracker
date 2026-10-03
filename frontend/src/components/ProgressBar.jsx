import clsx from 'clsx'

export default function ProgressBar({ percentage, exceeded = false }) {
  const clamped = Math.min(Math.max(percentage, 0), 100)
  const color = exceeded ? 'bg-red-500' : percentage >= 80 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
      <div
        className={clsx('h-2 rounded-full transition-all', color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
