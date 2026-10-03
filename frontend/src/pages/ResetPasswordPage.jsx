import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useResetPassword } from '../hooks/useAuth'
import FormField from '../components/FormField'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resetPassword = useResetPassword()

  const [form, setForm] = useState({
    token: searchParams.get('token') ?? '',
    email: searchParams.get('email') ?? '',
    password: '',
    password_confirmation: '',
  })

  const errors = resetPassword.error?.response?.data?.errors ?? {}

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    resetPassword.mutate(form, {
      onSuccess: () => navigate('/login'),
    })
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Restablece tu contraseña</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Elige una nueva contraseña para tu cuenta.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField label="Correo electrónico" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" />
        <FormField label="Nueva contraseña" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} autoComplete="new-password" />
        <FormField
          label="Confirmar nueva contraseña"
          name="password_confirmation"
          type="password"
          value={form.password_confirmation}
          onChange={handleChange}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={resetPassword.isPending}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {resetPassword.isPending ? 'Guardando…' : 'Restablecer contraseña'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <Link to="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  )
}
