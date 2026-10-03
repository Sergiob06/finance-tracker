import { useState } from 'react'
import Modal from '../Modal'
import FormField from '../FormField'
import SelectField from '../SelectField'
import {
  useCreateRecurringTransaction,
  useUpdateRecurringTransaction,
} from '../../hooks/useRecurringTransactions'

const FREQUENCIES = [
  { value: 'daily', label: 'Diaria' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'yearly', label: 'Anual' },
]

function defaultForm(accounts) {
  return {
    type: 'expense',
    account_id: accounts[0] ? String(accounts[0].id) : '',
    category_id: '',
    amount: '',
    description: '',
    frequency: 'monthly',
    next_run_date: new Date().toISOString().slice(0, 10),
  }
}

// The parent only mounts this component while the modal should be open (see
// RecurringTransactionsPage), so a lazy initializer is enough to seed the
// form — no effect needed to "reset" it, since mounting fresh already does that.
export default function RecurringTransactionFormModal({
  onClose,
  recurringTransaction,
  accounts,
  categories,
}) {
  const isEditing = Boolean(recurringTransaction)
  const createRecurring = useCreateRecurringTransaction()
  const updateRecurring = useUpdateRecurringTransaction()
  const [form, setForm] = useState(() =>
    recurringTransaction
      ? {
          type: recurringTransaction.type,
          account_id: String(recurringTransaction.account.id),
          category_id: recurringTransaction.category
            ? String(recurringTransaction.category.id)
            : '',
          amount: String(recurringTransaction.amount),
          description: recurringTransaction.description ?? '',
          frequency: recurringTransaction.frequency,
          next_run_date: recurringTransaction.next_run_date,
        }
      : defaultForm(accounts),
  )

  const mutation = isEditing ? updateRecurring : createRecurring
  const errors = mutation.error?.response?.data?.errors ?? {}
  const filteredCategories = categories.filter((category) => category.type === form.type)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleTypeChange(event) {
    setForm((prev) => ({ ...prev, type: event.target.value, category_id: '' }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    mutation.mutate(isEditing ? { id: recurringTransaction.id, data: form } : form, {
      onSuccess: onClose,
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? 'Editar transacción recurrente' : 'Nueva transacción recurrente'}
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
            form="recurring-form"
            disabled={mutation.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {mutation.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id="recurring-form" onSubmit={handleSubmit} className="space-y-4">
        <SelectField
          label="Tipo"
          name="type"
          value={form.type}
          onChange={handleTypeChange}
          error={errors.type}
        >
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </SelectField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="Cuenta"
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

          <SelectField
            label="Categoría"
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            error={errors.category_id}
          >
            <option value="">Selecciona…</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectField>
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
          <SelectField
            label="Frecuencia"
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
            error={errors.frequency}
          >
            {FREQUENCIES.map((frequency) => (
              <option key={frequency.value} value={frequency.value}>
                {frequency.label}
              </option>
            ))}
          </SelectField>
        </div>

        <FormField
          label="Próxima ejecución"
          name="next_run_date"
          type="date"
          value={form.next_run_date}
          onChange={handleChange}
          error={errors.next_run_date}
        />

        <FormField
          label="Descripción"
          name="description"
          value={form.description}
          onChange={handleChange}
          error={errors.description}
        />
      </form>
    </Modal>
  )
}
