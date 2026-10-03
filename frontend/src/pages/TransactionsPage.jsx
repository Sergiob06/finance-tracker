import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import SelectField from '../components/SelectField'
import FormField from '../components/FormField'
import TransactionFormModal from '../components/transactions/TransactionFormModal'
import { useTransactions, useDeleteTransaction } from '../hooks/useTransactions'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { exportTransactions } from '../api/transactions'
import { getIcon } from '../lib/icons'
import { formatCurrency } from '../lib/format'

const TRANSFER_COLOR = '#3B82F6'

const AMOUNT_COLOR = {
  income: 'text-emerald-600 dark:text-emerald-400',
  expense: 'text-red-600 dark:text-red-400',
  transfer: 'text-blue-600 dark:text-blue-400',
}

const AMOUNT_SIGN = { income: '+', expense: '-', transfer: '' }

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()
  const deleteTransaction = useDeleteTransaction()
  const [modalTransaction, setModalTransaction] = useState(undefined)
  const [deleting, setDeleting] = useState(null)
  const [exportingFormat, setExportingFormat] = useState(null)

  const filters = useMemo(
    () => ({
      date_from: searchParams.get('date_from') ?? '',
      date_to: searchParams.get('date_to') ?? '',
      account_id: searchParams.get('account_id') ?? '',
      category_id: searchParams.get('category_id') ?? '',
      type: searchParams.get('type') ?? '',
      search: searchParams.get('search') ?? '',
      page: searchParams.get('page') ?? '1',
    }),
    [searchParams],
  )

  const queryParams = useMemo(() => {
    const params = {}
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value
    })
    return params
  }, [filters])

  const { data, isPending } = useTransactions(queryParams)
  const transactions = data?.data ?? []

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams)

    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }

    if (key !== 'page') {
      next.delete('page')
    }

    setSearchParams(next)
  }

  async function handleExport(format) {
    setExportingFormat(format)
    try {
      await exportTransactions(queryParams, format)
    } finally {
      setExportingFormat(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Transacciones</h1>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleExport('csv')}
            disabled={exportingFormat === 'csv'}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Download className="size-4" /> CSV
          </button>
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            disabled={exportingFormat === 'pdf'}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <FileText className="size-4" /> PDF
          </button>
          <button
            type="button"
            onClick={() => setModalTransaction(null)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            <Plus className="size-4" /> Nueva transacción
          </button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <FormField
            label="Desde"
            name="date_from"
            type="date"
            value={filters.date_from}
            onChange={(event) => updateFilter('date_from', event.target.value)}
          />
          <FormField
            label="Hasta"
            name="date_to"
            type="date"
            value={filters.date_to}
            onChange={(event) => updateFilter('date_to', event.target.value)}
          />
          <SelectField
            label="Cuenta"
            name="account_id"
            value={filters.account_id}
            onChange={(event) => updateFilter('account_id', event.target.value)}
          >
            <option value="">Todas</option>
            {accounts?.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Categoría"
            name="category_id"
            value={filters.category_id}
            onChange={(event) => updateFilter('category_id', event.target.value)}
          >
            <option value="">Todas</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Tipo"
            name="type"
            value={filters.type}
            onChange={(event) => updateFilter('type', event.target.value)}
          >
            <option value="">Todos</option>
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
            <option value="transfer">Transferencia</option>
          </SelectField>
          <FormField
            label="Buscar"
            name="search"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Descripción…"
          />
        </div>
      </Card>

      <Card>
        {isPending && (
          <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        )}

        {!isPending && transactions.length === 0 && (
          <EmptyState message="No hay transacciones que coincidan con estos filtros." />
        )}

        {!isPending && transactions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <th className="pb-3 font-medium">Fecha</th>
                  <th className="pb-3 font-medium">Descripción</th>
                  <th className="pb-3 font-medium">Categoría</th>
                  <th className="pb-3 font-medium">Cuenta</th>
                  <th className="pb-3 text-right font-medium">Importe</th>
                  <th className="pb-3 pl-4 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {transactions.map((transaction) => {
                  const CategoryIcon = transaction.category
                    ? getIcon(transaction.category.icon)
                    : null

                  return (
                    <tr key={transaction.id}>
                      <td className="py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {new Date(transaction.date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 text-gray-700 dark:text-gray-300">
                        {transaction.description || '—'}
                      </td>
                      <td className="py-3">
                        {transaction.category ? (
                          <Badge color={transaction.category.color} icon={CategoryIcon}>
                            {transaction.category.name}
                          </Badge>
                        ) : (
                          <Badge color={TRANSFER_COLOR}>Transferencia</Badge>
                        )}
                      </td>
                      <td className="py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {transaction.type === 'transfer'
                          ? `${transaction.account.name} → ${transaction.transfer_to_account.name}`
                          : transaction.account.name}
                      </td>
                      <td
                        className={`py-3 text-right font-medium whitespace-nowrap ${AMOUNT_COLOR[transaction.type]}`}
                      >
                        {AMOUNT_SIGN[transaction.type]}
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setModalTransaction(transaction)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(transaction)}
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

        <div className="mt-4">
          <Pagination
            meta={data?.meta}
            onPageChange={(page) => updateFilter('page', String(page))}
          />
        </div>
      </Card>

      {modalTransaction !== undefined && (
        <TransactionFormModal
          onClose={() => setModalTransaction(undefined)}
          transaction={modalTransaction}
          accounts={accounts ?? []}
          categories={categories ?? []}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleteTransaction.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
        message="Se eliminará esta transacción y se actualizará el saldo de la cuenta correspondiente."
        isLoading={deleteTransaction.isPending}
      />
    </div>
  )
}
