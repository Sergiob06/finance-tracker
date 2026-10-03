import { NavLink, Outlet } from 'react-router-dom'
import { ArrowLeftRight, Landmark, LayoutDashboard, LogOut, PiggyBank, Repeat, Tags, Target, Wallet } from 'lucide-react'
import clsx from 'clsx'
import { useAuthStore } from '../store/authStore'
import { useCurrentUser, useLogout } from '../hooks/useAuth'
import ThemeToggle from '../components/ThemeToggle'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { to: '/accounts', label: 'Cuentas', icon: Landmark },
  { to: '/categories', label: 'Categorías', icon: Tags },
  { to: '/budgets', label: 'Presupuestos', icon: Target },
  { to: '/savings-goals', label: 'Metas de ahorro', icon: PiggyBank },
  { to: '/recurring-transactions', label: 'Recurrentes', icon: Repeat },
]

function NavItems({ className, itemClassName }) {
  return (
    <nav className={className}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            clsx(
              itemClassName,
              isActive
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
            )
          }
        >
          <item.icon className="size-4.5 shrink-0" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function AppLayout() {
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()
  useCurrentUser()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Wallet className="size-4" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">Finance Tracker</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="hidden text-sm text-gray-600 sm:inline dark:text-gray-400">
              {user?.name}
            </span>
            <button
              type="button"
              onClick={() => logout.mutate()}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <LogOut className="size-4" />
              Salir
            </button>
          </div>
        </div>

        <NavItems
          className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden"
          itemClassName="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap"
        />
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
        <aside className="hidden w-52 shrink-0 md:block">
          <NavItems
            className="flex flex-col gap-1"
            itemClassName="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium"
          />
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
