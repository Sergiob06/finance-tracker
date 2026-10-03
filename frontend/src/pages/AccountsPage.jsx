import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import AccountFormModal from '../components/accounts/AccountFormModal'
import { useAccounts, useDeleteAccount } from '../hooks/useAccounts'
import { getIcon } from '../lib/icons'
import { formatCurrency } from '../lib/format'

const TYPE_LABELS = { bank: 'Cuenta bancaria', cash: 'Efectivo', card: 'Tarjeta' }

export default function AccountsPage() {
  const { data: accounts, isPending } = useAccounts()
  const deleteAccount = useDeleteAccount()
  const [modalAccount, setModalAccount] = useState(undefined)
  const [deleting, setDeleting] = useState(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Cuentas</h1>
        <button
          type="button"
          onClick={() => setModalAccount(null)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          <Plus className="size-4" /> Nueva cuenta
        </button>
      </div>

      {isPending && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      )}

      {accounts?.length === 0 && (
        <Card>
          <EmptyState message="Todavía no tienes cuentas. Crea la primera para empezar a registrar movimientos." />
        </Card>
      )}

      {accounts?.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const Icon = getIcon(account.icon)

            return (
              <Card key={account.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${account.color}1A`, color: account.color }}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{TYPE_LABELS[account.type]}</p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setModalAccount(account)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(account)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <p
                  className={`mt-4 text-xl font-semibold ${
                    account.balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {formatCurrency(account.balance)}
                </p>
              </Card>
            )
          })}
        </div>
      )}

      {modalAccount !== undefined && (
        <AccountFormModal onClose={() => setModalAccount(undefined)} account={modalAccount} />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteAccount.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        message={`Se eliminará la cuenta "${deleting?.name}" y todas sus transacciones asociadas. Esta acción no se puede deshacer.`}
        isLoading={deleteAccount.isPending}
      />
    </div>
  )
}
