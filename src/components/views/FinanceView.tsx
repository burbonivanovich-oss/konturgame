import { useGameStore } from '../../stores/gameStore'
import type { Loan } from '../../types/game'
import { ECONOMY_CONSTANTS, MONTHLY_EXPENSES, UPGRADES_CONFIG } from '../../constants/business'
import { K } from '../design-system/tokens'

function calcTotalOwed(loan: Loan): number {
  const weeks = loan.dueWeek - loan.borrowedWeek
  return Math.round(loan.amount * (1 + loan.weeklyInterest * weeks))
}

const LOAN_LABELS: Record<Loan['type'], string> = {
  micro: 'Микрозайм',
  standard: 'Стандартный',
  'long-term': 'Долгосрочный',
}

const LOAN_OPTIONS: Array<{ type: Loan['type']; amount: number; label: string; weeks: number; rate: string }> = [
  { type: 'micro', amount: 50000, label: '50 000 ₽ · 2 нед · 15%', weeks: 2, rate: '15%' },
  { type: 'standard', amount: 100000, label: '100 000 ₽ · 4 нед · 10%', weeks: 4, rate: '10%' },
  { type: 'long-term', amount: 200000, label: '200 000 ₽ · 12 нед · 8%', weeks: 12, rate: '8%' },
]

function ForecastBar({ label, value }: { label: string; value: number }) {
  const color = value >= 0 ? K.good : K.bad
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0' }}>
      <span style={{ fontSize: 12, color: K.muted, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 800, color }} className="k-num">
        {value >= 0 ? '' : '−'}{Math.abs(value).toLocaleString('ru-RU')} ₽
      </span>
    </div>
  )
}

export function FinanceView() {
  const {
    balance, savedBalance, lastDayResult, services, currentWeek,
    loans, takeLoan, repayLoan,
    businessType, employees, purchasedUpgrades,
  } = useGameStore()

  const activeLoans = (loans ?? []).filter(l => !l.isRepaid)
  const bankActive = services?.bank?.isActive ?? false

  const goalAmount = ECONOMY_CONSTANTS.GOAL_AMOUNT
  const toGoalPct = Math.min((balance / goalAmount) * 100, 100)
  const activeServices = Object.values(services).filter(s => s.isActive)
  const yearlySubscription = activeServices.reduce((s, svc) => s + (svc.annualPrice ?? 0), 0)

  // Monthly fixed costs breakdown
  const baseMonthly = MONTHLY_EXPENSES[businessType]
  let monthlyRent = baseMonthly.rent
  let monthlySalaryBase = baseMonthly.baseSalary
  for (const upgradeId of (purchasedUpgrades ?? [])) {
    const upgrade = (UPGRADES_CONFIG[businessType] ?? []).find(u => u.id === upgradeId)
    if (upgrade) {
      monthlyRent += upgrade.monthlyRentIncrease ?? 0
      monthlySalaryBase += upgrade.monthlySalaryIncrease ?? 0
    }
  }
  const employeeMonthlySalary = (employees ?? []).reduce((sum, e) => sum + (e.salary ?? 0), 0)
  const monthlySubscriptions = Math.round(yearlySubscription / 12)
  const totalMonthlyFixed = monthlyRent + monthlySalaryBase + employeeMonthlySalary + monthlySubscriptions

  // Forecast: project 4 and 8 weeks based on last week's revenue minus monthly obligations
  const weeklyRevenue = lastDayResult?.revenue ?? 0
  const weeklySubscriptionCost = Math.round(yearlySubscription / 52)
  const weeklyVariableCosts = Math.max(0,
    (lastDayResult?.expenses ?? 0) - (lastDayResult?.monthlyExpense ?? 0) - weeklySubscriptionCost
  )
  // Expected weekly net = revenue minus weekly portion of fixed costs (monthly/4) minus variable costs
  const weeklyFixedPortion = Math.round(totalMonthlyFixed / 4)
  const expectedWeeklyProfit = weeklyRevenue - weeklyFixedPortion - weeklyVariableCosts
  const forecast4Weeks = balance + expectedWeeklyProfit * 4
  const forecast8Weeks = balance + expectedWeeklyProfit * 8

  const incomeItems = lastDayResult ? [
    { label: 'Выручка от продаж', value: lastDayResult.revenue, positive: true },
  ] : []

  const expenseItems = lastDayResult ? [
    ...(lastDayResult.purchaseCost > 0 ? [{ label: 'Закупки / ассортимент', value: lastDayResult.purchaseCost }] : []),
    ...(lastDayResult.tax > 0 ? [{ label: 'Налог УСН 6%', value: lastDayResult.tax }] : []),
    ...(lastDayResult.monthlyExpense > 0 ? [{ label: 'Аренда и зарплата (плановый платёж)', value: lastDayResult.monthlyExpense }] : []),
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
      fontFamily: 'Manrope, sans-serif', color: K.ink, letterSpacing: '-0.01em',
    }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: K.muted }}>АНАЛИТИКА</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em' }}>Финансы</div>
      </div>

      {/* Top KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 10 }}>
        {/* Balance hero */}
        <div style={{
          background: balance > 0 ? K.ink : K.bad,
          color: K.white, borderRadius: 20, padding: 18,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.75 }}>ТЕКУЩИЙ БАЛАНС</div>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', color: K.mint }} className="k-num">
            {balance.toLocaleString('ru-RU')} ₽
          </div>
          {/* Goal mini progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, opacity: 0.6, marginBottom: 4, fontWeight: 600 }}>
              <span>К цели 1 000 000 ₽</span>
              <span>{Math.round(toGoalPct)}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${toGoalPct}%`, height: '100%', background: K.mint, borderRadius: 999 }} />
            </div>
          </div>
        </div>

        {/* Last week revenue */}
        <div style={{ background: K.white, borderRadius: 20, padding: 18, border: `1px solid ${K.line}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: K.muted }}>ВЫРУЧКА ЗА НЕДЕЛЮ</div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: K.orange }} className="k-num">
              {(lastDayResult?.revenue ?? 0).toLocaleString('ru-RU')} ₽
            </div>
            <div style={{ fontSize: 10, color: K.muted, marginTop: 4, fontWeight: 600 }}>
              ~{Math.round((lastDayResult?.revenue ?? 0) / 7).toLocaleString('ru-RU')} ₽/день
            </div>
          </div>
        </div>

        {/* Last week net */}
        <div style={{ background: K.white, borderRadius: 20, padding: 18, border: `1px solid ${K.line}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: K.muted }}>ПРИБЫЛЬ ЗА НЕДЕЛЮ</div>
          <div>
            <div style={{
              fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em',
              color: (lastDayResult?.netProfit ?? 0) >= 0 ? K.good : K.bad,
            }} className="k-num">
              {(lastDayResult?.netProfit ?? 0) >= 0 ? '+' : ''}
              {(lastDayResult?.netProfit ?? 0).toLocaleString('ru-RU')} ₽
            </div>
            <div style={{ fontSize: 10, color: K.muted, marginTop: 4, fontWeight: 600 }}>
              {(lastDayResult?.revenue ?? 0) > 0
                ? `${Math.round(((lastDayResult?.netProfit ?? 0) / lastDayResult!.revenue) * 100)}% маржа`
                : 'нет данных'}
            </div>
          </div>
        </div>
      </div>

      {/* Main content row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12, flex: 1, minHeight: 0 }}>

        {/* Weekly P&L receipt */}
        <div style={{ background: K.white, borderRadius: 14, padding: 18, border: `1px solid ${K.line}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>
            ПРОШЛАЯ НЕДЕЛЯ{lastDayResult ? ` · Неделя ${lastDayResult.dayNumber}` : ''}
          </div>

          {!lastDayResult ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: K.muted }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Нажмите «Следующий день»</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Данные появятся после первой недели</div>
              </div>
            </div>
          ) : (
            <>
              {/* Income */}
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase', marginTop: 4 }}>ДОХОДЫ</div>
              {incomeItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 10px', borderRadius: 10, background: K.mintSoft,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: K.good }} className="k-num">
                    +{item.value.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              ))}

              {/* Expenses */}
              {expenseItems.length > 0 && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase', marginTop: 4 }}>РАСХОДЫ</div>
                  {expenseItems.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '6px 10px', borderRadius: 10,
                      borderBottom: i < expenseItems.length - 1 ? `1px dashed ${K.lineSoft}` : 'none',
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: K.muted }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: K.bad }} className="k-num">
                        −{item.value.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  ))}
                </>
              )}

              {/* Pain losses */}
              {painItems.length > 0 && (
                <>
                  <div style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: K.bad, marginTop: 8,
                  }}>
                    ⚠️ ПОТЕРИ БЕЗ СЕРВИСОВ КОНТУРА
                  </div>
                  {painItems.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '6px 10px', borderRadius: 10,
                      background: `${K.bad}0f`,
                      borderLeft: `3px solid ${K.bad}66`,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: K.muted, flex: 1 }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: K.bad, flexShrink: 0 }} className="k-num">
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
                borderTop: `2px solid ${K.ink}`,
                marginTop: 4,
              }}>
                <span style={{ fontSize: 14, fontWeight: 800 }}>Чистая прибыль за неделю</span>
                <span style={{
                  fontSize: 20, fontWeight: 800,
                  color: lastDayResult.netProfit >= 0 ? K.good : K.bad,
                }} className="k-num">
                  {lastDayResult.netProfit >= 0 ? '+' : ''}{lastDayResult.netProfit.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>

          {/* Balance forecast */}
          <div style={{ background: K.white, borderRadius: 14, padding: 18, border: `1px solid ${K.line}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase', marginBottom: 8 }}>
              ПРОГНОЗ БАЛАНСА
            </div>
            {!lastDayResult ? (
              <div style={{ fontSize: 12, color: K.muted }}>Прогноз появится после первой недели</div>
            ) : (
              <>
                <ForecastBar label="Через 4 недели (~1 мес.)" value={forecast4Weeks} />
                <div style={{ borderTop: `1px dashed ${K.lineSoft}` }} />
                <ForecastBar label="Через 8 недель (~2 мес.)" value={forecast8Weeks} />
                <div style={{ fontSize: 10, color: K.muted, marginTop: 8, lineHeight: 1.5 }}>
                  На основе выручки прошлой недели и плановых обязательств
                </div>
              </>
            )}
          </div>

          {/* Monthly obligations breakdown */}
          <div style={{ background: K.white, borderRadius: 14, padding: 18, border: `1px solid ${K.line}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase', marginBottom: 10 }}>
              ОБЯЗАТЕЛЬСТВА / МЕСЯЦ
            </div>
            {[
              { label: 'Аренда', value: monthlyRent },
              { label: 'Зарплата (база + улучшения)', value: monthlySalaryBase },
              ...(employeeMonthlySalary > 0 ? [{ label: 'Зарплата сотрудников', value: employeeMonthlySalary }] : []),
              ...(monthlySubscriptions > 0 ? [{ label: 'Подписки Контур', value: monthlySubscriptions }] : []),
            ].map((item, i, arr) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 12, fontWeight: 600, padding: '5px 0',
                borderBottom: i < arr.length - 1 ? `1px dashed ${K.lineSoft}` : 'none',
              }}>
                <span style={{ color: K.muted }}>{item.label}</span>
                <span className="k-num">{item.value.toLocaleString('ru-RU')} ₽</span>
              </div>
            ))}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 13, fontWeight: 800, paddingTop: 8, marginTop: 4,
              borderTop: `1.5px solid ${K.ink}`,
            }}>
              <span>Итого в месяц</span>
              <span className="k-num" style={{ color: K.bad }}>−{totalMonthlyFixed.toLocaleString('ru-RU')} ₽</span>
            </div>
            {weeklyRevenue > 0 && (
              <div style={{ fontSize: 10, color: K.muted, marginTop: 6, fontWeight: 600 }}>
                Покрытие: {Math.round((weeklyRevenue * 4 / totalMonthlyFixed) * 100)}% выручкой
              </div>
            )}
          </div>

          {/* Subscriptions */}
          <div style={{ background: K.white, borderRadius: 14, padding: 18, border: `1px solid ${K.line}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase', marginBottom: 10 }}>ПОДПИСКИ КОНТУРА</div>
            {activeServices.length === 0 ? (
              <div style={{ fontSize: 12, color: K.muted }}>Нет активных подписок</div>
            ) : (
              activeServices.map(svc => (
                <div key={svc.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, fontWeight: 600, padding: '4px 0',
                  borderBottom: `1px dashed ${K.lineSoft}`,
                }}>
                  <span style={{ color: K.muted }}>{svc.name}</span>
                  <span className="k-num">{svc.annualPrice.toLocaleString('ru-RU')} ₽/год</span>
                </div>
              ))
            )}
            {yearlySubscription > 0 && (
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 13, fontWeight: 800, paddingTop: 8, marginTop: 4,
                borderTop: `1.5px solid ${K.ink}`,
              }}>
                <span>Итого/год</span>
                <span className="k-num">{yearlySubscription.toLocaleString('ru-RU')} ₽</span>
              </div>
            )}
          </div>

          {/* Kontour savings */}
          <div style={{ background: K.mintSoft, borderRadius: 14, padding: 18, border: `1px solid ${K.line}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>СПАСЕНО С КОНТУРОМ</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: K.good }} className="k-num">
              {(savedBalance ?? 0).toLocaleString('ru-RU')} ₽
            </div>
            {yearlySubscription > 0 && savedBalance > 0 && (
              <div style={{ fontSize: 11, fontWeight: 700, color: K.muted, marginTop: 4 }}>
                ROI ×{(savedBalance / yearlySubscription).toFixed(1)} от стоимости подписки
              </div>
            )}
          </div>

          {/* Loans */}
          <div style={{ background: K.white, borderRadius: 14, padding: 18, border: `1px solid ${K.line}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>
              ЗАЙМЫ · КОНТУР.БАНК
            </div>

            {activeLoans.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeLoans.map(loan => {
                  const totalOwed = calcTotalOwed(loan)
                  const weeksLeft = Math.max(0, loan.dueWeek - currentWeek)
                  const overdue = weeksLeft === 0
                  return (
                    <div key={loan.id} style={{
                      borderRadius: 12, padding: 12,
                      background: overdue ? `${K.bad}0f` : K.bone,
                      border: `1px solid ${overdue ? `${K.bad}4d` : K.line}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>{LOAN_LABELS[loan.type]}</div>
                          <div style={{ fontSize: 10, color: K.muted, marginTop: 1 }}>
                            {overdue ? '⚠️ Просрочен' : `Осталось ${weeksLeft} нед.`}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: overdue ? K.bad : K.ink }} className="k-num">
                            {totalOwed.toLocaleString('ru-RU')} ₽
                          </div>
                          <div style={{ fontSize: 10, color: K.muted }}>к возврату</div>
                        </div>
                      </div>
                      <button
                        onClick={() => repayLoan(loan.id, totalOwed)}
                        disabled={balance < totalOwed}
                        style={{
                          width: '100%', padding: '7px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                          background: balance >= totalOwed ? K.violet : K.lineSoft,
                          color: balance >= totalOwed ? K.white : K.muted,
                          border: 'none', cursor: balance >= totalOwed ? 'pointer' : 'not-allowed',
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => { if (balance >= totalOwed) e.currentTarget.style.opacity = '0.8' }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                      >
                        Погасить {totalOwed.toLocaleString('ru-RU')} ₽
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {bankActive ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {activeLoans.length === 0 ? (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 700, color: K.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>ВЗЯТЬ ЗАЙМ</div>
                    {LOAN_OPTIONS.map(opt => (
                      <button
                        key={opt.type}
                        onClick={() => takeLoan(opt.amount, opt.type)}
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                          background: K.bone, color: K.violet,
                          border: `1px solid ${K.violet}`, cursor: 'pointer',
                          textAlign: 'left', transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.75' }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </>
                ) : (
                  <div style={{ fontSize: 11, color: K.muted, lineHeight: 1.5 }}>
                    Погасите текущий займ, чтобы взять новый
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: K.muted, lineHeight: 1.5 }}>
                🏦 Подключите Контур.Банк, чтобы получить доступ к займам на выгодных условиях
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
