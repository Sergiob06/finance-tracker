import { useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ProgressBar from '../components/ProgressBar'
import BudgetFormModal from '../components/budgets/BudgetFormModal'
import { useBudgets, useDeleteBudget } from '../hooks/useBudgets'
import { useCategories } from '../hooks/useCategories'
import { getIcon } from '../lib/icons'
import { formatCurrency } from '../lib/format'
import { currentMonthString, formatMonthYear, shiftMonth } from '../lib/dates'

export default function BudgetsPage() {
  const [month, setMonth] = useState(currentMonthString)
  const { data: budgets, isPending } = useBudgets(month)
  const { data: categories } = useCategories()
  const deleteBudget = useDeleteBudget()
  const [modalBudget, setModalBudget] = useState(undefined)
  const [deleting, setDeleting] = useState(null)

  const expenseCategories = categories?.filter((category) => category.type === 'expense') ?? []
  const budgetedCategoryIds = new Set((budgets ?? []).map((budget) => budget.category.id))
  const availableCategories = expenseCategories.filter(
    (category) => !budgetedCategoryIds.has(category.id),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Presupuestos</h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setMonth((current) => shiftMonth(current, -1))}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-32 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatMonthYear(month)}
            </span>
            <button
              type="button"
              onClick={() => setMonth((current) => shiftMonth(current, 1))}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setModalBudget(null)}
            disabled={availableCategories.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            <Plus className="size-4" /> Nuevo presupuesto
          </button>
        </div>
      </div>

      {isPending && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      )}

      {budgets?.length === 0 && (
        <Card>
          <EmptyState message="No has creado presupuestos para este mes." />
        </Card>
      )}

      {budgets?.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const Icon = getIcon(budget.category.icon)

            return (
              <Card key={budget.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-10 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${budget.category.color}1A`,
                        color: budget.category.color,
                      }}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {budget.category.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(budget.spent)} de {formatCurrency(budget.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setModalBudget(budget)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(budget)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <ProgressBar percentage={budget.percentage} exceeded={budget.exceeded} />
                  <div className="mt-1.5 flex justify-between text-xs">
                    <span
                      className={
                        budget.exceeded
                          ? 'font-medium text-red-600 dark:text-red-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }
                    >
                      {budget.percentage}%
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {budget.exceeded
                        ? `Superado en ${formatCurrency(budget.spent - budget.amount)}`
                        : `Quedan ${formatCurrency(budget.remaining)}`}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {modalBudget !== undefined && (
        <BudgetFormModal
          onClose={() => setModalBudget(undefined)}
          budget={modalBudget}
          month={month}
          categories={modalBudget ? expenseCategories : availableCategories}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteBudget.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        message={`Se eliminará el presupuesto de "${deleting?.category?.name}" para este mes.`}
        isLoading={deleteBudget.isPending}
      />
    </div>
  )
}
