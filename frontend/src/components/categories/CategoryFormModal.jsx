import { useState } from 'react'
import Modal from '../Modal'
import FormField from '../FormField'
import SelectField from '../SelectField'
import ColorPicker from '../ColorPicker'
import IconPicker from '../IconPicker'
import { useCreateCategory, useUpdateCategory } from '../../hooks/useCategories'

function defaultForm(type = 'expense') {
  return { name: '', type, color: '#6366F1', icon: 'tag' }
}

// The parent only mounts this component while the modal should be open (see
// CategoriesPage), so a lazy initializer is enough to seed the form — no
// effect needed to "reset" it, since mounting fresh already does that.
export default function CategoryFormModal({ onClose, category, defaultType = 'expense' }) {
  const isEditing = Boolean(category)
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const [form, setForm] = useState(() =>
    category
      ? { name: category.name, type: category.type, color: category.color, icon: category.icon }
      : defaultForm(defaultType),
  )

  const mutation = isEditing ? updateCategory : createCategory
  const errors = mutation.error?.response?.data?.errors ?? {}

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    mutation.mutate(isEditing ? { id: category.id, data: form } : form, { onSuccess: onClose })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? 'Editar categoría' : 'Nueva categoría'}
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
            form="category-form"
            disabled={mutation.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {mutation.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nombre" name="name" value={form.name} onChange={handleChange} error={errors.name} />

        <SelectField label="Tipo" name="type" value={form.type} onChange={handleChange} error={errors.type}>
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </SelectField>

        <ColorPicker value={form.color} onChange={(color) => setForm((prev) => ({ ...prev, color }))} />
        <IconPicker value={form.icon} onChange={(icon) => setForm((prev) => ({ ...prev, icon }))} />
      </form>
    </Modal>
  )
}
