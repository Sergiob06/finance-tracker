import Card from '../Card'
import EmptyState from '../EmptyState'
import { formatCurrency } from '../../lib/format'

export default function TopCategoriesList({ data }) {
  if (data.length === 0) {
    return (
      <Card title="Top categorías de gasto" className="h-full">
        <EmptyState message="Todavía no hay gastos registrados este mes." />
      </Card>
    )
  }

  const max = Math.max(...data.map((item) => item.total))

  return (
    <Card title="Top categorías de gasto" className="h-full">
      <ul className="space-y-4">
        {data.map((item) => (
          <li key={item.category_id}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
              <span className="text-gray-500 dark:text-gray-400">{formatCurrency(item.total)}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${(item.total / max) * 100}%`, backgroundColor: item.color ?? '#6366f1' }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
