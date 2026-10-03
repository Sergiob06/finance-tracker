export default function EmptyState({ message }) {
  return (
    <div className="flex h-56 flex-col items-center justify-center text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  )
}
