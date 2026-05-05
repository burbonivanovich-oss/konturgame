// Number formatting helpers. Always round before formatting — without
// this, derived values (subscriptions prorated per day, average checks
// after multipliers) leak fractional digits like "90 425,753 ₽".

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('ru-RU')
}

export function formatRub(n: number): string {
  return `${formatNumber(n)} ₽`
}

// Adds explicit "+" for positive amounts. Negative numbers keep their
// natural minus from toLocaleString.
export function formatRubSigned(n: number): string {
  const rounded = Math.round(n)
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded.toLocaleString('ru-RU')} ₽`
}
