import clsx from 'clsx'

const PRESET_COLORS = [
  '#6366F1',
  '#3B82F6',
  '#22C55E',
  '#EF4444',
  '#F59E0B',
  '#EC4899',
  '#8B5CF6',
  '#14B8A6',
  '#F97316',
  '#64748B',
]

export default function ColorPicker({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            aria-label={color}
            className={clsx(
              'size-7 rounded-full transition',
              value?.toLowerCase() === color.toLowerCase() &&
                'ring-2 ring-gray-900 ring-offset-2 dark:ring-white dark:ring-offset-gray-900',
            )}
            style={{ backgroundColor: color }}
          />
        ))}
        <input
          type="color"
          value={value ?? '#6366F1'}
          onChange={(event) => onChange(event.target.value)}
          className="size-7 cursor-pointer rounded-full border border-gray-300 dark:border-gray-700"
          aria-label="Color personalizado"
        />
      </div>
    </div>
  )
}
