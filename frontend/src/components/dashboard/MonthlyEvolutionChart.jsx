import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../Card'
import { formatCurrency, formatCurrencyCompact, formatMonthLabel } from '../../lib/format'
import { useChartColors } from '../../hooks/useChartColors'

export default function MonthlyEvolutionChart({ data }) {
  const colors = useChartColors()

  return (
    <Card title="Evolución mensual (últimos 6 meses)">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonthLabel}
            tick={{ fontSize: 12, fill: colors.axis }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCurrencyCompact}
            tick={{ fontSize: 12, fill: colors.axis }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            labelFormatter={formatMonthLabel}
            contentStyle={{
              borderRadius: 8,
              border: `1px solid ${colors.tooltipBorder}`,
              backgroundColor: colors.tooltipBg,
              color: colors.tooltipText,
              fontSize: 13,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 13, color: colors.axis }} />
          <Line type="monotone" dataKey="income" name="Ingresos" stroke="#10B981" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="expense" name="Gastos" stroke="#EF4444" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
