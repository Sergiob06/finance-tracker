import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 text-sm sm:flex-row dark:border-gray-800">
      <span className="text-gray-500 dark:text-gray-400">
        Página {meta.current_page} de {meta.last_page} · {meta.total} resultados
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="size-4" /> Anterior
        </button>
        <button
          type="button"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Siguiente <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
