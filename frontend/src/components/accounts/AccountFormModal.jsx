import { useState } from 'react'
import Modal from '../Modal'
import FormField from '../FormField'
import SelectField from '../SelectField'
import ColorPicker from '../ColorPicker'
import IconPicker from '../IconPicker'
import { useCreateAccount, useUpdateAccount } from '../../hooks/useAccounts'

const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Cuenta bancaria' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
]

const DEFAULT_FORM = { name: '', type: 'bank', balance: '0', color: '#6366F1', icon: 'landmark' }

// The parent only mounts this component while the modal should be open (see
// AccountsPage), so a lazy initializer is enough to seed the form — no
// effect needed to "reset" it, since mounting fresh already does that.
export default function AccountFormModal({ onClose, account }) {
  const isEditing = Boolean(account)
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const [form, setForm] = useState(() =>
    account
      ? { name: account.name, type: account.type, balance: String(account.balance), color: account.color, icon: account.icon }
      : DEFAULT_FORM,
  )

  const mutation = isEditing ? updateAccount : createAccount
  const errors = mutation.error?.response?.data?.errors ?? {}

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const payload = isEditing
      ? { name: form.name, type: form.type, color: form.color, icon: form.icon }
      : form

    mutation.mutate(isEditing ? { id: account.id, data: payload } : payload, { onSuccess: onClose })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? 'Editar cuenta' : 'Nueva cuenta'}
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
            form="account-form"
            disabled={mutation.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {mutation.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id="account-form" onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nombre" name="name" value={form.name} onChange={handleChange} error={errors.name} />

        <SelectField label="Tipo" name="type" value={form.type} onChange={handleChange} error={errors.type}>
          {ACCOUNT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </SelectField>

        {!isEditing && (
          <FormField
            label="Saldo inicial"
            name="balance"
            type="number"
            step="0.01"
            value={form.balance}
            onChange={handleChange}
            error={errors.balance}
          />
        )}

        <ColorPicker value={form.color} onChange={(color) => setForm((prev) => ({ ...prev, color }))} />
        <IconPicker value={form.icon} onChange={(icon) => setForm((prev) => ({ ...prev, icon }))} />
      </form>
    </Modal>
  )
}
