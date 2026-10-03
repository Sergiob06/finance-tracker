import clsx from 'clsx'
import { ArrowDown, ArrowUp } from 'lucide-react'
import Card from '../Card'
import { formatPercent } from '../../lib/format'

const TONE_CLASSES = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
}

export default function SummaryCard({ icon: Icon, label, value, tone = 'indigo', trend }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>

          {trend && (
            <p
              className={clsx(
                'mt-1 flex items-center gap-1 text-xs font-medium',
                trend.isGood
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {trend.direction === 'up' ? (
                <ArrowUp className="size-3" />
              ) : (
                <ArrowDown className="size-3" />
              )}
              {formatPercent(trend.value)} vs. mes anterior
            </p>
          )}
        </div>

        <div
          className={clsx(
            'flex size-10 shrink-0 items-center justify-center rounded-xl',
            TONE_CLASSES[tone],
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  )
}
