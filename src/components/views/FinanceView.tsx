import { useGameStore } from '../../stores/gameStore'

export function FinanceView() {
  const { balance, savedBalance, lastDayResult, services, currentWeek } = useGameStore()

  const goalAmount = 1_000_000
  const toGoalPct = Math.min((balance / goalAmount) * 100, 100)
  const activeServices = Object.values(services).filter(s => s.isActive)
  const yearlySubscription = activeServices.reduce((s, svc) => s + (svc.annualPrice ?? 0), 0)

  const incomeItems = lastDayResult ? [
    { label: 'Выручка от продаж', value: lastDayResult.revenue, positive: true },
  ] : []

  const expenseItems = lastDayResult ? [
    ...(lastDayResult.purchaseCost > 0 ? [{ label: 'Закупки / ассортимент', value: lastDayResult.purchaseCost }] : []),
    { label: 'Налог УСН 6%', value: lastDayResult.tax },
    ...(lastDayResult.monthlyExpense > 0 ? [{ label: 'Аренда и зарплата', value: lastDayResult.monthlyExpense }] : []),
    ...(lastDayResult.subscriptionCost > 0 ? [{ label: 'Подписки Контур', value: lastDayResult.subscriptionCost }] : []),
    ...(lastDayResult.expiredLoss > 0 ? [{ label: 'Списание просрочки', value: lastDayResult.expiredLoss }] : []),
    ...(lastDayResult.registerOverflowPenalty > 0 ? [{ label: 'Штраф за очередь (касса)', value: lastDayResult.registerOverflowPenalty }] : []),
  ] : []

  const painItems = lastDayResult ? [
    ...(lastDayResult.painLossBankMissed > 0 ? [{ label: 'Без Банка: 40% клиентов платят наличными', value: lastDayResult.painLossBankMissed }] : []),
    ...(lastDayResult.painLossMarketInventory > 0 ? [{ label: 'Без Маркета: ошибки ручного учёта', value: lastDayResult.painLossMarketInventory }] : []),
    ...(lastDayResult.painLossOfdFine > 0 ? [{ label: 'Без ОФД: штраф налоговой', value: lastDayResult.painLossOfdFine }] : []),
    ...(lastDayResult.painLossDiadocDelay > 0 ? [{ label: 'Без Диадока: задержка поставки', value: lastDayResult.painLossDiadocDelay }] : []),
    ...(lastDayResult.painLossFokusBadSupplier > 0 ? [{ label: 'Без Фокуса: ненадёжный поставщик', value: lastDayResult.painLossFokusBadSupplier }] : []),
    ...(lastDayResult.painLossElbaFine > 0 ? [{ label: 'Без Эльбы: штраф за ошибку в декларации', value: lastDayResult.painLossElbaFine }] : []),
    ...(lastDayResult.painLossExternBlock > 0 ? [{ label: 'Без Экстерна: блокировка счёта', value: lastDayResult.painLossExternBlock }] : []),
  ] : []

  return (
    <div style={{
      flex: 1, padding: '20px 24px', overflow: 'auto',
      display: 'flex', flexDirection: 'column', gap: 12,
      fontFamily: 'Manrope, sans-serif', color: 'var(--k-ink)', letterSpacing: '-0.01em',
    }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.45 }}>АНАЛИТИКА</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em' }}>Финансы</div>
      </div>

      {/* Top KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 10, height: 130 }}>
        {/* Balance hero */}
        <div style={{
          background: balance > 0 ? 'var(--k-green)' : 'var(--k-bad)',
          color: '#fff', borderRadius: 20, padding: 18,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.75 }}>ТЕКУЩИЙ БАЛАНС</div>
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em' }} className="k-num">
              {balance.toLocaleString('ru-RU')} ₽
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.75, marginTop: 4 }}>
              День {currentWeek}
            </div>
          </div>
        </div>

        {/* Last day revenue */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.4 }}>ВЫРУЧКА ВЧЕРА</div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--k-orange)' }} className="k-num">
            {(lastDayResult?.revenue ?? 0).toLocaleString('ru-RU')} ₽
          </div>
        </div>

        {/* Last day net */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.4 }}>ПРИБЫЛЬ ВЧЕРА</div>
          <div style={{
            fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em',
            color: (lastDayResult?.netProfit ?? 0) >= 0 ? 'var(--k-green)' : 'var(--k-bad)',
          }} className="k-num">
            {(lastDayResult?.netProfit ?? 0) >= 0 ? '+' : ''}
            {(lastDayResult?.netProfit ?? 0).toLocaleString('ru-RU')} ₽
          </div>
        </div>
      </div>

      {/* Main row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12, flex: 1, minHeight: 0 }}>

        {/* Receipt */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.45 }}>
            ПОСЛЕДНИЙ ДЕНЬ · {lastDayResult ? `День ${lastDayResult.dayNumber}` : 'нет данных'}
          </div>

          {!lastDayResult ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Нажмите «Следующий день»</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Данные появятся после первого дня</div>
              </div>
            </div>
          ) : (
            <>
              {/* Income */}
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.4, marginTop: 4 }}>ДОХОДЫ</div>
              {incomeItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 10px', borderRadius: 10, background: 'var(--k-green-soft)',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--k-green)' }} className="k-num">
                    +{item.value.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              ))}

              {/* Expenses */}
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.4, marginTop: 4 }}>РАСХОДЫ</div>
              {expenseItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 10px', borderRadius: 10,
                  borderBottom: i < expenseItems.length - 1 ? '1px dashed var(--k-ink-10)' : 'none',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.8 }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--k-bad)' }} className="k-num">
                    −{item.value.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              ))}

              {/* Pain losses from missing services */}
              {painItems.length > 0 && (
                <>
                  <div style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                    color: '#c0392b', marginTop: 8, opacity: 0.8,
                  }}>
                    ⚠️ ПОТЕРИ БЕЗ СЕРВИСОВ КОНТУРА
                  </div>
                  {painItems.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '6px 10px', borderRadius: 10,
                      background: 'rgba(192,57,43,0.06)',
                      borderLeft: '3px solid rgba(192,57,43,0.4)',
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, flex: 1 }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#c0392b', flexShrink: 0 }} className="k-num">
                        −{item.value.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  ))}
                </>
              )}

              {/* Net */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 10px 0',
                borderTop: '2px solid var(--k-ink)',
                marginTop: 4,
              }}>
                <span style={{ fontSize: 14, fontWeight: 800 }}>Чистая прибыль</span>
                <span style={{
                  fontSize: 20, fontWeight: 800,
                  color: lastDayResult.netProfit >= 0 ? 'var(--k-green)' : 'var(--k-bad)',
                }} className="k-num">
                  {lastDayResult.netProfit >= 0 ? '+' : ''}{lastDayResult.netProfit.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Goal progress */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.4 }}>К ЦЕЛИ 1 000 000 ₽</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }} className="k-num">
              {Math.round(toGoalPct)}%
            </div>
            <div style={{ height: 8, background: 'var(--k-ink-10)', borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
              <div style={{ width: `${toGoalPct}%`, height: '100%', background: 'var(--k-green)', borderRadius: 999 }} />
            </div>
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 6, fontWeight: 600 }}>
              Осталось: {Math.max(0, goalAmount - balance).toLocaleString('ru-RU')} ₽
            </div>
          </div>

          {/* Годовые расходы на подписки */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.4, marginBottom: 10 }}>ГОДОВАЯ СТОИМОСТЬ ПОДПИСОК</div>
            {activeServices.length === 0 ? (
              <div style={{ fontSize: 12, opacity: 0.4 }}>Нет активных подписок</div>
            ) : (
              activeServices.map(svc => (
                <div key={svc.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, fontWeight: 600, padding: '4px 0',
                  borderBottom: '1px dashed var(--k-ink-10)',
                }}>
                  <span style={{ opacity: 0.7 }}>{svc.name}</span>
                  <span className="k-num">{svc.annualPrice.toLocaleString('ru-RU')} ₽/год</span>
                </div>
              ))
            )}
            {yearlySubscription > 0 && (
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 13, fontWeight: 800, paddingTop: 8, marginTop: 4,
                borderTop: '1.5px solid var(--k-ink)',
              }}>
                <span>Подписки итого</span>
                <span className="k-num">{yearlySubscription.toLocaleString('ru-RU')} ₽/год</span>
              </div>
            )}
          </div>

          {/* Kontour savings */}
          <div style={{ background: 'var(--k-green-soft)', borderRadius: 20, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.55 }}>СПАСЕНО С КОНТУРОМ</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: 'var(--k-green)' }} className="k-num">
              {(savedBalance ?? 0).toLocaleString('ru-RU')} ₽
            </div>
            {yearlySubscription > 0 && savedBalance > 0 && (
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.65, marginTop: 4 }}>
                ROI ×{(savedBalance / yearlySubscription).toFixed(1)} от стоимости подписки
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
