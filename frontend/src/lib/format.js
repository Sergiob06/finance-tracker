const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
})

const compactCurrencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatCurrency(amount) {
  return currencyFormatter.format(amount ?? 0)
}

export function formatCurrencyCompact(amount) {
  return compactCurrencyFormatter.format(amount ?? 0)
}

export function formatPercent(value) {
  if (value === null || value === undefined) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value}%`
}

const MONTH_LABELS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]

export function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-')
  return `${MONTH_LABELS[Number(month) - 1]} ${year.slice(2)}`
}
