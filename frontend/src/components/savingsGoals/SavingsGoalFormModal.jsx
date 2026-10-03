import { useState } from 'react'
import Modal from '../Modal'
import FormField from '../FormField'
import ColorPicker from '../ColorPicker'
import IconPicker from '../IconPicker'
import { useCreateSavingsGoal, useUpdateSavingsGoal } from '../../hooks/useSavingsGoals'

const DEFAULT_FORM = { name: '', target_amount: '', target_date: '', color: '#6366F1', icon: 'piggy-bank' }

// The parent only mounts this component while the modal should be open (see
// SavingsGoalsPage), so a lazy initializer is enough to seed the form — no
// effect needed to "reset" it, since mounting fresh already does that.
export default function SavingsGoalFormModal({ onClose, savingsGoal }) {
  const isEditing = Boolean(savingsGoal)
  const createSavingsGoal = useCreateSavingsGoal()
  const updateSavingsGoal = useUpdateSavingsGoal()
  const [form, setForm] = useState(() =>
    savingsGoal
      ? {
          name: savingsGoal.name,
          target_amount: String(savingsGoal.target_amount),
          target_date: savingsGoal.target_date ?? '',
          color: savingsGoal.color,
          icon: savingsGoal.icon,
        }
      : DEFAULT_FORM,
  )

  const mutation = isEditing ? updateSavingsGoal : createSavingsGoal
  const errors = mutation.error?.response?.data?.errors ?? {}

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    mutation.mutate(isEditing ? { id: savingsGoal.id, data: form } : form, { onSuccess: onClose })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? 'Editar meta de ahorro' : 'Nueva meta de ahorro'}
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
            form="savings-goal-form"
            disabled={mutation.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {mutation.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id="savings-goal-form" onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nombre" name="name" value={form.name} onChange={handleChange} error={errors.name} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Cantidad objetivo"
            name="target_amount"
            type="number"
            step="0.01"
            min="0.01"
            value={form.target_amount}
            onChange={handleChange}
            error={errors.target_amount}
          />
          <FormField
            label="Fecha objetivo (opcional)"
            name="target_date"
            type="date"
            value={form.target_date}
            onChange={handleChange}
            error={errors.target_date}
          />
        </div>

        <ColorPicker value={form.color} onChange={(color) => setForm((prev) => ({ ...prev, color }))} />
        <IconPicker value={form.icon} onChange={(icon) => setForm((prev) => ({ ...prev, icon }))} />
      </form>
    </Modal>
  )
}
