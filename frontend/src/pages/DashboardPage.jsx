import { Landmark, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useDashboard } from '../hooks/useDashboard'
import SummaryCard from '../components/dashboard/SummaryCard'
import ExpensesByCategoryChart from '../components/dashboard/ExpensesByCategoryChart'
import TopCategoriesList from '../components/dashboard/TopCategoriesList'
import MonthlyEvolutionChart from '../components/dashboard/MonthlyEvolutionChart'
import { formatCurrency } from '../lib/format'

function trendFor(percent, { invert = false } = {}) {
  if (percent === null || percent === undefined) return null

  return {
    value: percent,
    direction: percent >= 0 ? 'up' : 'down',
    isGood: invert ? percent <= 0 : percent >= 0,
  }
}

function SkeletonCard() {
  return <div className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const { data, isPending, isError, refetch } = useDashboard()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Hola, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Este es el resumen de tus finanzas.</p>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          No se ha podido cargar el panel.{' '}
          <button type="button" onClick={() => refetch()} className="font-medium underline">
            Reintentar
          </button>
        </div>
      )}

      {isPending && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={Landmark}
              label="Balance total"
              value={formatCurrency(data.balance_total)}
              tone="indigo"
            />
            <SummaryCard
              icon={TrendingUp}
              label="Ingresos del mes"
              value={formatCurrency(data.current_month.income)}
              tone="emerald"
              trend={trendFor(data.comparison.income_change_percent)}
            />
            <SummaryCard
              icon={TrendingDown}
              label="Gastos del mes"
              value={formatCurrency(data.current_month.expense)}
              tone="red"
              trend={trendFor(data.comparison.expense_change_percent, { invert: true })}
            />
            <SummaryCard
              icon={PiggyBank}
              label="Balance del mes"
              value={formatCurrency(data.current_month.net)}
              tone="amber"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ExpensesByCategoryChart data={data.expenses_by_category} />
            </div>
            <div className="lg:col-span-2">
              <TopCategoriesList data={data.top_expense_categories} />
            </div>
          </div>

          <MonthlyEvolutionChart data={data.monthly_evolution} />
        </>
      )}
    </div>
  )
}
