import { useState } from 'react'
import Modal from '../Modal'
import FormField from '../FormField'
import SelectField from '../SelectField'
import { useCreateTransaction, useUpdateTransaction } from '../../hooks/useTransactions'

function defaultForm(accounts) {
  return {
    type: 'expense',
    account_id: accounts[0] ? String(accounts[0].id) : '',
    category_id: '',
    transfer_to_account_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    receipt: null,
  }
}

// The parent only mounts this component while the modal should be open (see
// TransactionsPage), so a lazy initializer is enough to seed the form — no
// effect needed to "reset" it, since mounting fresh already does that.
export default function TransactionFormModal({ onClose, transaction, accounts, categories }) {
  const isEditing = Boolean(transaction)
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const [form, setForm] = useState(() =>
    transaction
      ? {
          type: transaction.type,
          account_id: String(transaction.account.id),
          category_id: transaction.category ? String(transaction.category.id) : '',
          transfer_to_account_id: transaction.transfer_to_account ? String(transaction.transfer_to_account.id) : '',
          amount: String(transaction.amount),
          description: transaction.description ?? '',
          date: transaction.date,
          receipt: null,
        }
      : defaultForm(accounts),
  )

  const mutation = isEditing ? updateTransaction : createTransaction
  const errors = mutation.error?.response?.data?.errors ?? {}
  const filteredCategories = categories.filter((category) => category.type === form.type)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleTypeChange(event) {
    const type = event.target.value
    setForm((prev) => ({ ...prev, type, category_id: '', transfer_to_account_id: '' }))
  }

  function handleFileChange(event) {
    setForm((prev) => ({ ...prev, receipt: event.target.files[0] ?? null }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const payload = {
      type: form.type,
      account_id: form.account_id,
      amount: form.amount,
      description: form.description,
      date: form.date,
      ...(form.type === 'transfer'
        ? { transfer_to_account_id: form.transfer_to_account_id }
        : { category_id: form.category_id, receipt: form.receipt }),
    }

    mutation.mutate(isEditing ? { id: transaction.id, data: payload } : payload, { onSuccess: onClose })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? 'Editar transacción' : 'Nueva transacción'}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="transaction-form"
            disabled={mutation.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {mutation.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
        <SelectField label="Tipo" name="type" value={form.type} onChange={handleTypeChange} error={errors.type}>
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
          <option value="transfer">Transferencia</option>
        </SelectField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label={form.type === 'transfer' ? 'Cuenta origen' : 'Cuenta'}
            name="account_id"
            value={form.account_id}
            onChange={handleChange}
            error={errors.account_id}
          >
            <option value="">Selecciona…</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </SelectField>

          {form.type === 'transfer' ? (
            <SelectField
              label="Cuenta destino"
              name="transfer_to_account_id"
              value={form.transfer_to_account_id}
              onChange={handleChange}
              error={errors.transfer_to_account_id}
            >
              <option value="">Selecciona…</option>
              {accounts
                .filter((account) => String(account.id) !== form.account_id)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
            </SelectField>
          ) : (
            <SelectField label="Categoría" name="category_id" value={form.category_id} onChange={handleChange} error={errors.category_id}>
              <option value="">Selecciona…</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectField>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Importe"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={handleChange}
            error={errors.amount}
          />
          <FormField label="Fecha" name="date" type="date" value={form.date} onChange={handleChange} error={errors.date} />
        </div>

        <FormField label="Descripción" name="description" value={form.description} onChange={handleChange} error={errors.description} />

        {form.type !== 'transfer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recibo (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-600 dark:text-gray-300"
            />
            {isEditing && transaction.receipt_url && !form.receipt && (
              <a
                href={transaction.receipt_url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-xs text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Ver recibo actual
              </a>
            )}
            {errors.receipt && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.receipt[0]}</p>}
          </div>
        )}
      </form>
    </Modal>
  )
}
