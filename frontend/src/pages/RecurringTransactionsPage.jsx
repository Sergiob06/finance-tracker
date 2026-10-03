import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import Switch from '../components/Switch'
import Badge from '../components/Badge'
import RecurringTransactionFormModal from '../components/recurring/RecurringTransactionFormModal'
import {
  useDeleteRecurringTransaction,
  useRecurringTransactions,
  useUpdateRecurringTransaction,
} from '../hooks/useRecurringTransactions'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { getIcon } from '../lib/icons'
import { formatCurrency } from '../lib/format'

const FREQUENCY_LABELS = { daily: 'Diaria', weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual' }

export default function RecurringTransactionsPage() {
  const { data: recurringTransactions, isPending } = useRecurringTransactions()
  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()
  const deleteRecurring = useDeleteRecurringTransaction()
  const updateRecurring = useUpdateRecurringTransaction()
  const [modalItem, setModalItem] = useState(undefined)
  const [deleting, setDeleting] = useState(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Transacciones recurrentes</h1>
        <button
          type="button"
          onClick={() => setModalItem(null)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          <Plus className="size-4" /> Nueva recurrente
        </button>
      </div>

      <Card>
        {isPending && <div className="h-48 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />}

        {!isPending && recurringTransactions?.length === 0 && (
          <EmptyState message="No tienes transacciones recurrentes configuradas." />
        )}

        {!isPending && recurringTransactions?.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <th className="pb-3 font-medium">Descripción</th>
                  <th className="pb-3 font-medium">Cuenta</th>
                  <th className="pb-3 font-medium">Categoría</th>
                  <th className="pb-3 font-medium">Frecuencia</th>
                  <th className="pb-3 font-medium">Próxima ejecución</th>
                  <th className="pb-3 text-right font-medium">Importe</th>
                  <th className="pb-3 text-center font-medium">Activa</th>
                  <th className="pb-3 pl-4 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {recurringTransactions.map((item) => {
                  const CategoryIcon = item.category ? getIcon(item.category.icon) : null

                  return (
                    <tr key={item.id}>
                      <td className="py-3 text-gray-700 dark:text-gray-300">{item.description || '—'}</td>
                      <td className="py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">{item.account.name}</td>
                      <td className="py-3">
                        {item.category ? (
                          <Badge color={item.category.color} icon={CategoryIcon}>
                            {item.category.name}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {FREQUENCY_LABELS[item.frequency]}
                      </td>
                      <td className="py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {new Date(item.next_run_date).toLocaleDateString('es-ES')}
                      </td>
                      <td
                        className={`py-3 text-right font-medium whitespace-nowrap ${
                          item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {item.type === 'income' ? '+' : '-'}
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-3 text-center">
                        <Switch
                          checked={item.active}
                          disabled={updateRecurring.isPending}
                          onChange={(active) => updateRecurring.mutate({ id: item.id, data: { active } })}
                        />
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setModalItem(item)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(item)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modalItem !== undefined && (
        <RecurringTransactionFormModal
          onClose={() => setModalItem(undefined)}
          recurringTransaction={modalItem}
          accounts={accounts ?? []}
          categories={categories ?? []}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteRecurring.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        message="Se eliminará esta transacción recurrente. Las transacciones ya generadas no se verán afectadas."
        isLoading={deleteRecurring.isPending}
      />
    </div>
  )
}
