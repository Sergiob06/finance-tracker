import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/useAuth'
import FormField from '../components/FormField'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()
  const [form, setForm] = useState({ email: '', password: '' })

  const errors = login.error?.response?.data?.errors ?? {}

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    login.mutate(form, { onSuccess: () => navigate('/') })
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Inicia sesión</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Accede a tu panel de finanzas personales.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />
        <FormField
          label="Contraseña"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-end text-sm">
          <Link
            to="/forgot-password"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {login.isPending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        ¿No tienes cuenta?{' '}
        <Link
          to="/register"
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Regístrate
        </Link>
      </p>
    </div>
  )
}
