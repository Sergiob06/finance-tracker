import { useState } from 'react'
import { CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ProgressBar from '../components/ProgressBar'
import SavingsGoalFormModal from '../components/savingsGoals/SavingsGoalFormModal'
import ContributeModal from '../components/savingsGoals/ContributeModal'
import { useDeleteSavingsGoal, useSavingsGoals } from '../hooks/useSavingsGoals'
import { getIcon } from '../lib/icons'
import { formatCurrency } from '../lib/format'

export default function SavingsGoalsPage() {
  const { data: goals, isPending } = useSavingsGoals()
  const deleteSavingsGoal = useDeleteSavingsGoal()
  const [modalGoal, setModalGoal] = useState(undefined)
  const [contributingGoal, setContributingGoal] = useState(null)
  const [deleting, setDeleting] = useState(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Metas de ahorro</h1>
        <button
          type="button"
          onClick={() => setModalGoal(null)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          <Plus className="size-4" /> Nueva meta
        </button>
      </div>

      {isPending && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      )}

      {goals?.length === 0 && (
        <Card>
          <EmptyState message="Todavía no tienes metas de ahorro. Crea la primera para empezar a ahorrar con un objetivo." />
        </Card>
      )}

      {goals?.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const Icon = getIcon(goal.icon)

            return (
              <Card key={goal.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${goal.color}1A`, color: goal.color }}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{goal.name}</p>
                      {goal.target_date && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Objetivo: {new Date(goal.target_date).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setModalGoal(goal)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(goal)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <ProgressBar percentage={goal.percentage} />
                  <div className="mt-1.5 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {formatCurrency(goal.current_amount)} de {formatCurrency(goal.target_amount)}
                    </span>
                    <span>{goal.percentage}%</span>
                  </div>
                </div>

                {goal.completed ? (
                  <div className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" /> Meta completada
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setContributingGoal(goal)}
                    className="mt-4 w-full rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                  >
                    Aportar
                  </button>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {modalGoal !== undefined && (
        <SavingsGoalFormModal onClose={() => setModalGoal(undefined)} savingsGoal={modalGoal} />
      )}

      {contributingGoal && (
        <ContributeModal onClose={() => setContributingGoal(null)} savingsGoal={contributingGoal} />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleteSavingsGoal.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
        message={`Se eliminará la meta "${deleting?.name}" y su progreso de ahorro.`}
        isLoading={deleteSavingsGoal.isPending}
      />
    </div>
  )
}
