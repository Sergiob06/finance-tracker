import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function EmailVerifiedPage() {
  const [searchParams] = useSearchParams()
  const verified = searchParams.get('status') === 'success'

  return (
    <div className="text-center">
      {verified ? (
        <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
      ) : (
        <XCircle className="mx-auto size-10 text-red-500" />
      )}

      <h1 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
        {verified ? 'Correo verificado' : 'Enlace no válido'}
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {verified
          ? 'Tu dirección de correo se ha verificado correctamente.'
          : 'Este enlace de verificación ya no es válido. Solicita uno nuevo desde tu cuenta.'}
      </p>

      <Link
        to="/"
        className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        Ir al panel
      </Link>
    </div>
  )
}
