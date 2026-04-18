import { useState, useEffect, useRef } from 'react'
import ResponsiveLayout from './ResponsiveLayout'
import MobileMainScreen from './MobileMainScreen'
import PurchaseModal from './modals/PurchaseModal'
import EventModal from './modals/EventModal'
import CampaignModal from './modals/CampaignModal'
import UpgradesModal from './modals/UpgradesModal'
import HelpModal from './modals/HelpModal'
import SettingsModal from './modals/SettingsModal'
import VictoryModal from './modals/VictoryModal'
import AchievementsModal from './modals/AchievementsModal'
import { useGameStore } from '../stores/gameStore'

// Простая sparkline функция
function Spark({ data, color = 'currentColor', fill = false }) {
  const w = 100, h = 32;
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / rng) * (h - 4) - 2;
    return [x, y];
  });
  const path = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return (
    <svg style={{ width: '100%', height: '32px', display: 'block' }} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {fill && (
        <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill={color} opacity="0.15"/>
      )}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

function DesktopMainScreen() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showUpgradesModal, setShowUpgradesModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showAchievementsModal, setShowAchievementsModal] = useState(false)

  const state = useGameStore()
  const {
    currentDay, balance, reputation, loyalty, services,
    pendingEvent, pendingEventsQueue, isGameOver, isVictory,
    achievements, lastDayResult,
    addBalance, addReputation, markEventAsResolved, activateService, addSavedBalance
  } = state

  const [savingsToast, setSavingsToast] = useState<number | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (pendingEvent) {
      setShowEventModal(true)
    }
  }, [pendingEvent])

  const handleEventOption = (optionId: string) => {
    if (!pendingEvent) return
    const option = pendingEvent.options.find((o) => o.id === optionId)
    if (!option) return

    const c = option.consequences
    if (c.balanceDelta !== undefined) addBalance(c.balanceDelta)
    if (c.reputationDelta !== undefined) addReputation(c.reputationDelta)
    if (c.serviceId) activateService(c.serviceId)

    // Считаем спасённые рубли
    if (option.isContourOption && c.balanceDelta !== undefined) {
      const nonKontourOptions = pendingEvent.options.filter((o) => !o.isContourOption)
      if (nonKontourOptions.length > 0) {
        const cheapestNonKontour = nonKontourOptions.reduce((best, o) => {
          const d = o.consequences.balanceDelta ?? 0
          return d > (best.consequences.balanceDelta ?? 0) ? o : best
        })
        const savings = c.balanceDelta - (cheapestNonKontour.consequences.balanceDelta ?? 0)
        if (savings > 0) {
          addSavedBalance(savings)
          if (toastTimer.current) clearTimeout(toastTimer.current)
          setSavingsToast(savings)
          toastTimer.current = setTimeout(() => setSavingsToast(null), 3500)
        }
      }
    }

    markEventAsResolved(pendingEvent.id)
    setShowEventModal(false)
  }

  const incomeSparkData = Array.from({ length: 10 }, () => Math.random() * 50)
  const activeServiceIds = Object.values(services).filter(s => s.isActive).map(s => s.id)

  const dailyIncome = lastDayResult?.totalIncome ?? 0
  const monthlyExpenses = Object.values(services).filter(s => s.isActive).reduce((sum, s) => sum + s.monthlyPrice, 0)
  const goalAmount = 1000000
  const goalProgress = balance
  const toGoalPercent = goalAmount > 0 ? Math.min((goalProgress / goalAmount) * 100, 100) : 0

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: 'var(--k-surface)',
      fontFamily: 'Manrope, sans-serif',
      color: 'var(--k-ink)',
      display: 'flex',
      overflow: 'hidden',
      letterSpacing: '-0.01em',
    }}>
      {/* LEFT RAIL */}
      <aside style={{
        width: 240, background: 'var(--k-ink)', color: '#fff',
        padding: '24px 20px', display: 'flex', flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--k-orange)',
          }}/>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Бизнес</div>
            <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 600 }}>с Контуром</div>
          </div>
        </div>

        <div style={{
          padding: 12, borderRadius: 12,
          background: 'rgba(255,255,255,0.06)',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 700, letterSpacing: '0.1em' }}>
            КОФЕЙНЯ
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>День {currentDay}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 6,
            fontSize: 11, fontWeight: 600, opacity: 0.7,
          }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--k-blue-soft)' }}/>
            Весна · хорошо
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { n: 'Дневной цикл',  g: '◎', on: true,  badge: '1' },
            { n: 'Склад',         g: '▦', on: false },
            { n: 'Маркетинг',     g: '◆', on: false },
            { n: 'Экосистема',    g: '□', on: false, badge: `${activeServiceIds.length}/7` },
            { n: 'Финансы',       g: '₽', on: false },
            { n: 'Репутация',     g: '★', on: false },
            { n: 'Достижения',    g: '◈', on: false },
          ].map(i => (
            <div key={i.n} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: i.on ? 'var(--k-orange)' : 'transparent',
              color: i.on ? 'var(--k-ink)' : '#fff',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6,
                background: i.on ? 'var(--k-ink)' : 'rgba(255,255,255,0.08)',
                color: i.on ? 'var(--k-orange)' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
              }}>{i.g}</span>
              <span style={{ flex: 1 }}>{i.n}</span>
              {i.badge && (
                <span style={{
                  fontSize: 10, fontWeight: 800,
                  padding: '2px 6px', borderRadius: 999,
                  background: i.on ? 'var(--k-ink)' : 'rgba(255,255,255,0.12)',
                  color: i.on ? 'var(--k-orange)' : '#fff',
                }}>{i.badge}</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}/>

        <div style={{
          padding: 14, borderRadius: 16,
          background: 'var(--k-green)', color: 'var(--k-ink)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7, letterSpacing: '0.1em' }}>
            БАЛАНС
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }} className="k-num">
            {balance.toLocaleString('ru-RU')} ₽
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, marginTop: 4 }}>
            День {currentDay}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{
        flex: 1, padding: '20px 24px', overflow: 'auto',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* KPI */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr 1fr 1fr',
          gap: 10, height: 146,
        }}>
          {/* Income */}
          <div style={{
            background: 'var(--k-orange)', color: 'var(--k-ink)',
            borderRadius: 20, padding: 20,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.65 }}>
                ДОХОД
              </div>
              <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 2 }} className="k-num">
                {(dailyIncome || 0).toLocaleString('ru-RU')} ₽
              </div>
            </div>
            <Spark data={incomeSparkData} color="#0E1116" fill />
          </div>

          {/* Balance */}
          <div style={{
            background: 'var(--k-green)', color: 'var(--k-ink)',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.65 }}>
              БАЛАНС
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                +{balance.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div style={{
            background: 'var(--k-blue)', color: '#fff',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.7 }}>
              РАСХОДЫ/МЕС
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                {monthlyExpenses.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>

          {/* Goal */}
          <div style={{
            background: 'var(--k-purple)', color: '#fff',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.7 }}>
              К ЦЕЛИ
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                {goalAmount.toLocaleString('ru-RU')} ₽
              </div>
              <div style={{
                marginTop: 6, height: 5, background: 'rgba(255,255,255,0.22)',
                borderRadius: 999, overflow: 'hidden',
              }}>
                <div style={{ width: `${toGoalPercent}%`, height: '100%', background: '#fff' }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Main row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12, flex: 1, minHeight: 0 }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Event */}
            {pendingEvent && (
              <div style={{
                background: 'var(--k-ink)', color: '#fff',
                borderRadius: 24, padding: 20,
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {pendingEvent.title}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {pendingEvent.options.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => handleEventOption(opt.id)}
                      style={{
                        background: opt.isContourOption ? 'var(--k-green)' : 'rgba(255,255,255,0.06)',
                        color: opt.isContourOption ? 'var(--k-ink)' : '#fff',
                        border: opt.isContourOption ? 'none' : '1.5px solid rgba(255,255,255,0.1)',
                        borderRadius: 16, padding: 14,
                        cursor: 'pointer',
                      }}>
                      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
                        {opt.name}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800 }} className="k-num">
                        {opt.consequences?.balanceDelta ? `${opt.consequences.balanceDelta > 0 ? '+' : ''}${opt.consequences.balanceDelta}` : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Indicators */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: 14,
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
            }}>
              {[
                { l: 'Репутация', v: `+${reputation}`, bg: 'var(--k-green-soft)' },
                { l: 'Лояльность', v: `${loyalty}%`, bg: '#FFEFB8' },
                { l: 'День', v: currentDay, bg: 'var(--k-blue-soft)' },
              ].map(i => (
                <div key={i.l} style={{
                  padding: 10, borderRadius: 12, background: i.bg,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.65 }}>{i.l}</div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{i.v}</div>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <button
                onClick={() => setShowPurchaseModal(true)}
                style={{
                  padding: '10px 14px', border: 'none',
                  background: 'var(--k-blue)', color: '#fff',
                  borderRadius: 999, fontFamily: 'inherit',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>
                📦 Закупка
              </button>
              <button
                onClick={() => setShowCampaignModal(true)}
                style={{
                  padding: '10px 14px', border: 'none',
                  background: 'var(--k-purple)', color: '#fff',
                  borderRadius: 999, fontFamily: 'inherit',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>
                📢 Реклама
              </button>
              <button
                onClick={() => setShowUpgradesModal(true)}
                style={{
                  padding: '10px 14px', border: 'none',
                  background: 'var(--k-orange)', color: 'var(--k-ink)',
                  borderRadius: 999, fontFamily: 'inherit',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>
                🔧 Улучшения
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
            {/* Services */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: 14,
              flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0,
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.5 }}>
                СЕРВИСЫ
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {['Маркет', 'Банк', 'Экстерн', 'ОФД', 'Фокус', 'Диадок', 'Эльба'].map((s) => (
                  <div key={s} style={{
                    background: activeServiceIds.includes(s as any) ? 'var(--k-orange)' : 'var(--k-surface)',
                    color: activeServiceIds.includes(s as any) ? 'var(--k-ink)' : 'var(--k-ink)',
                    borderRadius: 10, padding: '8px 10px',
                    fontSize: 10, fontWeight: 700,
                    textAlign: 'center',
                  }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Next day button */}
            <button style={{
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: 'var(--k-orange)', color: 'var(--k-ink)',
              padding: '20px 24px', borderRadius: 999,
              fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              Следующий день →
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      <PurchaseModal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} />
      <EventModal
        isOpen={showEventModal}
        event={pendingEvent}
        onOptionSelect={handleEventOption}
        queueLength={pendingEventsQueue?.length ?? 0}
      />
      <CampaignModal isOpen={showCampaignModal} onClose={() => setShowCampaignModal(false)} />
      <UpgradesModal isOpen={showUpgradesModal} onClose={() => setShowUpgradesModal(false)} />
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />
      <VictoryModal isOpen={isVictory} type="victory" />
      <VictoryModal isOpen={isGameOver && !isVictory} type="defeat" />

      {/* Toast */}
      {savingsToast !== null && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 50, background: 'var(--k-green)', color: 'var(--k-ink)',
          padding: '16px 24px', borderRadius: 16,
          fontSize: 14, fontWeight: 700,
        }}>
          ✅ Спасено {savingsToast.toLocaleString('ru-RU')} ₽!
        </div>
      )}
    </div>
  )
}

export default function MainScreen() {
  return (
    <ResponsiveLayout
      desktopView={<DesktopMainScreen />}
      mobileView={<MobileMainScreen />}
    />
  )
}

  const [savingsToast, setSavingsToast] = useState<number | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (pendingEvent) {
      setShowEventModal(true)
    }
  }, [pendingEvent])

  const handleEventOption = (optionId: string) => {
    if (!pendingEvent) return
    const option = pendingEvent.options.find((o) => o.id === optionId)
    if (!option) return

    const c = option.consequences
    if (c.balanceDelta !== undefined) addBalance(c.balanceDelta)
    if (c.reputationDelta !== undefined) addReputation(c.reputationDelta)
    if (c.serviceId) activateService(c.serviceId)

    // Считаем спасённые рубли
    if (option.isContourOption && c.balanceDelta !== undefined) {
      const nonKontourOptions = pendingEvent.options.filter((o) => !o.isContourOption)
      if (nonKontourOptions.length > 0) {
        const cheapestNonKontour = nonKontourOptions.reduce((best, o) => {
          const d = o.consequences.balanceDelta ?? 0
          return d > (best.consequences.balanceDelta ?? 0) ? o : best
        })
        const savings = c.balanceDelta - (cheapestNonKontour.consequences.balanceDelta ?? 0)
        if (savings > 0) {
          addSavedBalance(savings)
          if (toastTimer.current) clearTimeout(toastTimer.current)
          setSavingsToast(savings)
          toastTimer.current = setTimeout(() => setSavingsToast(null), 3500)
        }
      }
    }

    markEventAsResolved(pendingEvent.id)
    setShowEventModal(false)
  }

  const incomeSparkData = Array.from({ length: 10 }, () => Math.random() * 50)
  const toGoalPercent = goalAmount > 0 ? Math.min((goalProgress / goalAmount) * 100, 100) : 0

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: 'var(--k-surface)',
      fontFamily: 'Manrope, sans-serif',
      color: 'var(--k-ink)',
      display: 'flex',
      overflow: 'hidden',
      letterSpacing: '-0.01em',
    }}>
      {/* LEFT RAIL — navigation */}
      <aside style={{
        width: 240, background: 'var(--k-ink)', color: '#fff',
        padding: '24px 20px', display: 'flex', flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--k-orange)',
          }}/>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Бизнес</div>
            <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 600 }}>с Контуром</div>
          </div>
        </div>

        <div style={{
          padding: 12, borderRadius: 12,
          background: 'rgba(255,255,255,0.06)',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 700, letterSpacing: '0.1em' }}>
            КОФЕЙНЯ
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>День {day}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 6,
            fontSize: 11, fontWeight: 600, opacity: 0.7,
          }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--k-blue-soft)' }}/>
            Весна · хорошо
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { n: 'Дневной цикл',  g: '◎', on: true,  badge: '1' },
            { n: 'Склад',         g: '▦', on: false },
            { n: 'Маркетинг',     g: '◆', on: false },
            { n: 'Экосистема',    g: '□', on: false, badge: `${activeServices.length}/7` },
            { n: 'Финансы',       g: '₽', on: false },
            { n: 'Репутация',     g: '★', on: false },
            { n: 'Достижения',    g: '◈', on: false },
          ].map(i => (
            <div key={i.n} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: i.on ? 'var(--k-orange)' : 'transparent',
              color: i.on ? 'var(--k-ink)' : '#fff',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6,
                background: i.on ? 'var(--k-ink)' : 'rgba(255,255,255,0.08)',
                color: i.on ? 'var(--k-orange)' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
              }}>{i.g}</span>
              <span style={{ flex: 1 }}>{i.n}</span>
              {i.badge && (
                <span style={{
                  fontSize: 10, fontWeight: 800,
                  padding: '2px 6px', borderRadius: 999,
                  background: i.on ? 'var(--k-ink)' : 'rgba(255,255,255,0.12)',
                  color: i.on ? 'var(--k-orange)' : '#fff',
                }}>{i.badge}</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}/>

        <div style={{
          padding: 14, borderRadius: 16,
          background: 'var(--k-green)', color: 'var(--k-ink)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7, letterSpacing: '0.1em' }}>
            СПАСЕНО
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }} className="k-num">
            {balance.toLocaleString('ru-RU')} ₽
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, marginTop: 4 }}>
            День {day}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{
        flex: 1, padding: '20px 24px', overflow: 'auto',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Top KPI bento strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr 1fr 1fr',
          gap: 10, height: 146,
        }}>
          {/* Income */}
          <div style={{
            background: 'var(--k-orange)', color: 'var(--k-ink)',
            borderRadius: 20, padding: 20,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.65 }}>
                ДОХОД
              </div>
              <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 2 }} className="k-num">
                {dailyIncome.toLocaleString('ru-RU')} ₽
              </div>
            </div>
            <Spark data={incomeSparkData} color="#0E1116" fill />
          </div>

          {/* Net */}
          <div style={{
            background: 'var(--k-green)', color: 'var(--k-ink)',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.65 }}>
              БАЛАНС
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                +{balance.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>

          {/* Monthly */}
          <div style={{
            background: 'var(--k-blue)', color: '#fff',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.7 }}>
              РАСХОДЫ/МЕС
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                {monthlyExpenses.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>

          {/* To goal */}
          <div style={{
            background: 'var(--k-purple)', color: '#fff',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.7 }}>
              К ЦЕЛИ
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                {goalAmount.toLocaleString('ru-RU')} ₽
              </div>
              <div style={{
                marginTop: 6, height: 5, background: 'rgba(255,255,255,0.22)',
                borderRadius: 999, overflow: 'hidden',
              }}>
                <div style={{ width: `${toGoalPercent}%`, height: '100%', background: '#fff' }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Main row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12, flex: 1, minHeight: 0 }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Event block */}
            {pendingEvent && (
              <div style={{
                background: 'var(--k-ink)', color: '#fff',
                borderRadius: 24, padding: 20,
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {pendingEvent.title}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {pendingEvent.options.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => handleEventOption(opt.id)}
                      style={{
                        background: opt.isContourOption ? 'var(--k-green)' : 'rgba(255,255,255,0.06)',
                        color: opt.isContourOption ? 'var(--k-ink)' : '#fff',
                        border: opt.isContourOption ? 'none' : '1.5px solid rgba(255,255,255,0.1)',
                        borderRadius: 16, padding: 14,
                        cursor: 'pointer',
                      }}>
                      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
                        {opt.title}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800 }} className="k-num">
                        {opt.consequences.balanceDelta ? `${opt.consequences.balanceDelta > 0 ? '+' : ''}${opt.consequences.balanceDelta}` : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Indicators */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: 14,
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
            }}>
              {[
                { l: 'Репутация', v: `+${reputation}`, bg: 'var(--k-green-soft)' },
                { l: 'Лояльность', v: `${loyalty}%`, bg: '#FFEFB8' },
                { l: 'Склад', v: `${stockDaysLeft} дн`, bg: 'var(--k-blue-soft)' },
              ].map(i => (
                <div key={i.l} style={{
                  padding: 10, borderRadius: 12, background: i.bg,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.65 }}>{i.l}</div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{i.v}</div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <button
                onClick={() => setShowPurchaseModal(true)}
                style={{
                  padding: '10px 14px', border: 'none',
                  background: 'var(--k-blue)', color: '#fff',
                  borderRadius: 999, fontFamily: 'inherit',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>
                📦 Закупка
              </button>
              <button
                onClick={() => setShowCampaignModal(true)}
                style={{
                  padding: '10px 14px', border: 'none',
                  background: 'var(--k-purple)', color: '#fff',
                  borderRadius: 999, fontFamily: 'inherit',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>
                📢 Реклама
              </button>
              <button
                onClick={() => setShowUpgradesModal(true)}
                style={{
                  padding: '10px 14px', border: 'none',
                  background: 'var(--k-orange)', color: 'var(--k-ink)',
                  borderRadius: 999, fontFamily: 'inherit',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>
                🔧 Улучшения
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
            {/* Services */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: 14,
              flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0,
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.5 }}>
                СЕРВИСЫ
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {['Маркет', 'Банк', 'Экстерн', 'ОФД', 'Фокус', 'Диадок', 'Эльба'].map((s) => (
                  <div key={s} style={{
                    background: activeServices.includes(s) ? 'var(--k-orange)' : 'var(--k-surface)',
                    color: activeServices.includes(s) ? 'var(--k-ink)' : 'var(--k-ink)',
                    borderRadius: 10, padding: '8px 10px',
                    fontSize: 10, fontWeight: 700,
                    textAlign: 'center',
                  }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Next day button */}
            <button style={{
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: 'var(--k-orange)', color: 'var(--k-ink)',
              padding: '20px 24px', borderRadius: 999,
              fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              Следующий день →
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      <PurchaseModal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} />
      <EventModal
        isOpen={showEventModal}
        event={pendingEvent}
        onOptionSelect={handleEventOption}
        queueLength={pendingEventsQueue?.length ?? 0}
      />
      <CampaignModal isOpen={showCampaignModal} onClose={() => setShowCampaignModal(false)} />
      <UpgradesModal isOpen={showUpgradesModal} onClose={() => setShowUpgradesModal(false)} />
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />
      <VictoryModal isOpen={isVictory} type="victory" />
      <VictoryModal isOpen={isGameOver && !isVictory} type="defeat" />

      {/* Savings Toast */}
      {savingsToast !== null && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 50, background: 'var(--k-green)', color: 'var(--k-ink)',
          padding: '16px 24px', borderRadius: 16,
          fontSize: 14, fontWeight: 700,
        }}>
          ✅ Контур сэкономил {savingsToast.toLocaleString('ru-RU')} ₽!
        </div>
      )}
    </div>
  )
}

export default function MainScreen() {
  return (
    <ResponsiveLayout
      desktopView={<DesktopMainScreen />}
      mobileView={<MobileMainScreen />}
    />
  )
}
