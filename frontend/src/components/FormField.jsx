export default function FormField({ label, name, type = 'text', value, onChange, error, autoComplete, placeholder, ...rest }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline focus:outline-2 focus:outline-indigo-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error[0]}</p>}
    </div>
  )
}
