import clsx from 'clsx'

export default function Switch({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex h-5 w-9 items-center rounded-full transition disabled:opacity-50',
        checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700',
      )}
    >
      <span
        className={clsx(
          'inline-block size-3.5 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
