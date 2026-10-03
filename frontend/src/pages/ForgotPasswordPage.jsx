import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForgotPassword } from '../hooks/useAuth'
import FormField from '../components/FormField'

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword()
  const [email, setEmail] = useState('')

  const errors = forgotPassword.error?.response?.data?.errors ?? {}

  function handleSubmit(event) {
    event.preventDefault()
    forgotPassword.mutate({ email })
  }

  if (forgotPassword.isSuccess) {
    return (
      <div className="text-center">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Revisa tu correo</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Si existe una cuenta con ese correo, te hemos enviado un enlace para restablecer tu
          contraseña.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
        Recupera tu contraseña
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Te enviaremos un enlace para restablecerla.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
        />

        <button
          type="submit"
          disabled={forgotPassword.isPending}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {forgotPassword.isPending ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <Link
          to="/login"
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  )
}
