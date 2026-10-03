import { Outlet } from 'react-router-dom'
import { Wallet } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-gray-50 px-4 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Wallet className="size-5" />
          </div>
          <span className="text-xl font-semibold text-gray-900 dark:text-white">
            Finance Tracker
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
