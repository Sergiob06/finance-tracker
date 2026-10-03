import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import CategoryFormModal from '../components/categories/CategoryFormModal'
import { useCategories, useDeleteCategory } from '../hooks/useCategories'
import { getIcon } from '../lib/icons'

function CategoryColumn({ title, type, categories, onEdit, onDelete, onCreate }) {
  return (
    <Card
      title={title}
      action={
        <button
          type="button"
          onClick={() => onCreate(type)}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
        >
          <Plus className="size-3.5" /> Añadir
        </button>
      }
    >
      {categories.length === 0 ? (
        <EmptyState message="Sin categorías todavía." />
      ) : (
        <ul className="space-y-1">
          {categories.map((category) => {
            const Icon = getIcon(category.icon)

            return (
              <li
                key={category.id}
                className="group flex items-center justify-between rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${category.color}1A`, color: category.color }}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
                </div>

                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(category)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export default function CategoriesPage() {
  const { data: categories, isPending } = useCategories()
  const deleteCategory = useDeleteCategory()
  const [modalState, setModalState] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const expenseCategories = categories?.filter((category) => category.type === 'expense') ?? []
  const incomeCategories = categories?.filter((category) => category.type === 'income') ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Categorías</h1>

      {isPending && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      )}

      {categories && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CategoryColumn
            title="Gastos"
            type="expense"
            categories={expenseCategories}
            onEdit={(category) => setModalState({ category, defaultType: 'expense' })}
            onDelete={setDeleting}
            onCreate={(type) => setModalState({ category: null, defaultType: type })}
          />
          <CategoryColumn
            title="Ingresos"
            type="income"
            categories={incomeCategories}
            onEdit={(category) => setModalState({ category, defaultType: 'income' })}
            onDelete={setDeleting}
            onCreate={(type) => setModalState({ category: null, defaultType: type })}
          />
        </div>
      )}

      {modalState && (
        <CategoryFormModal
          onClose={() => setModalState(null)}
          category={modalState.category}
          defaultType={modalState.defaultType}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteCategory.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        message={`Se eliminará la categoría "${deleting?.name}". Las transacciones asociadas quedarán sin categoría.`}
        isLoading={deleteCategory.isPending}
      />
    </div>
  )
}
