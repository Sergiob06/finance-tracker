const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export function currentMonthString() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

export function shiftMonth(monthStr, delta) {
  const [year, month] = monthStr.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

export function formatMonthYear(monthStr) {
  const [year, month] = monthStr.split('-').map(Number)
  const name = MONTH_NAMES[month - 1]
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`
}
