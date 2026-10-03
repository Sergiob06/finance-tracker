import clsx from 'clsx'
import { ICON_NAMES, getIcon } from '../lib/icons'

export default function IconPicker({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Icono</label>
      <div className="mt-1 grid grid-cols-8 gap-2">
        {ICON_NAMES.map((name) => {
          const Icon = getIcon(name)
          const selected = value === name

          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              aria-label={name}
              className={clsx(
                'flex size-9 items-center justify-center rounded-lg border transition',
                selected
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800',
              )}
            >
              <Icon className="size-4" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
