import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import Card from '../Card'
import EmptyState from '../EmptyState'
import { formatCurrency } from '../../lib/format'
import { useChartColors } from '../../hooks/useChartColors'

export default function ExpensesByCategoryChart({ data }) {
  const colors = useChartColors()

  if (data.length === 0) {
    return (
      <Card title="Gastos por categoría" className="h-full">
        <EmptyState message="Todavía no hay gastos registrados este mes." />
      </Card>
    )
  }

  const total = data.reduce((sum, item) => sum + item.total, 0)

  return (
    <Card title="Gastos por categoría" className="h-full">
      <div className="relative">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="name" innerRadius={68} outerRadius={104} paddingAngle={2} stroke="none">
              {data.map((entry) => (
                <Cell key={entry.category_id} fill={entry.color ?? '#6366f1'} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [formatCurrency(value), name]}
              contentStyle={{
                borderRadius: 8,
                border: `1px solid ${colors.tooltipBorder}`,
                backgroundColor: colors.tooltipBg,
                color: colors.tooltipText,
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(total)}</span>
        </div>
      </div>
    </Card>
  )
}
