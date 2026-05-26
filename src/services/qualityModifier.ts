// Раньше тут был отдельный qualityLevel-скаляр и его модификаторы для
// клиентов / цены. Удалено: эффекты дублировали репутацию. Оставлены
// только: brand effect (rep+loyalty синергия) и сезонность.
//
// Лояльность тоже выпилена. getBrandEffect стал reputation-only.

/**
 * Get season modifier based on week of year
 * Uses the seasonality config for the business
 */
export function getSeasonalityModifier(currentWeek: number, seasonality: Record<string, number>): number {
  const monthOfYear = (((currentWeek - 1) % 52) / 4.33) // ~4.33 weeks per month, convert week to month
  const month = Math.floor(monthOfYear) + 1 // 1-12
  const monthKey = month.toString()

  return seasonality[monthKey] ?? 0
}

/**
 * Get brand effect modifier (reputation-only).
 *
 * Истоки: раньше требовалась связка rep>80 AND loyalty>80, редко
 * срабатывала, давала +40% клиентов / +30% выручки / +10% цены.
 * Лояльность выпилена. Прошло 4 итерации калибровки — финальные значения
 * (Спринт 6, после Economy/Game Designer аудитов):
 *   • rep > 90: +10% клиентов, +10% выручки, +4% к цене
 *   • rep > 75: +4% клиентов, +4% выручки, +2% к цене
 *
 * Промежуточный +5%/+5%/+2% оказался неощутимым — игрок упирался в
 * rep=100 на W6, но не чувствовал «бренда». Текущее +10/+10/+4 даёт
 * заметный slope rep=70 → rep=95, не разгоняя экономику до pre-refactor
 * +40%/+30%/+10% уровня (там сложно было достичь обоих гейтов rep+loy).
 */
export function getBrandEffect(reputation: number, _loyalty?: number): {
  clientMod: number
  revenueMod: number
  priceMod: number
  isBrand: boolean
} {
  if (reputation > 90) {
    return { clientMod: 0.10, revenueMod: 0.10, priceMod: 0.04, isBrand: true }
  }
  if (reputation > 75) {
    return { clientMod: 0.04, revenueMod: 0.04, priceMod: 0.02, isBrand: false }
  }
  return { clientMod: 0, revenueMod: 0, priceMod: 0, isBrand: false }
}
