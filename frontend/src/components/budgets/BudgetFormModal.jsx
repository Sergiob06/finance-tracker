import { useState } from 'react'
import Modal from '../Modal'
import FormField from '../FormField'
import SelectField from '../SelectField'
import { useCreateBudget, useUpdateBudget } from '../../hooks/useBudgets'

// The parent only mounts this component while the modal should be open (see
// BudgetsPage), so a lazy initializer is enough to seed the form — no effect
// needed to "reset" it, since mounting fresh already does that.
export default function BudgetFormModal({ onClose, budget, month, categories }) {
  const isEditing = Boolean(budget)
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const [form, setForm] = useState(() =>
    budget
      ? { category_id: String(budget.category.id), amount: String(budget.amount) }
      : { category_id: '', amount: '' },
  )

  const mutation = isEditing ? updateBudget : createBudget
  const errors = mutation.error?.response?.data?.errors ?? {}

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const payload = { ...form, month }
    mutation.mutate(isEditing ? { id: budget.id, data: payload } : payload, { onSuccess: onClose })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? 'Editar presupuesto' : 'Nuevo presupuesto'}
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
            form="budget-form"
            disabled={mutation.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {mutation.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id="budget-form" onSubmit={handleSubmit} className="space-y-4">
        <SelectField
          label="Categoría"
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          error={errors.category_id}
          disabled={isEditing}
        >
          <option value="">Selecciona…</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </SelectField>

        <FormField
          label="Importe mensual"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={form.amount}
          onChange={handleChange}
          error={errors.amount}
        />
      </form>
    </Modal>
  )
}
