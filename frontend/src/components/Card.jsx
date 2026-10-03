import clsx from 'clsx'

export default function Card({ title, action, className, children }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
