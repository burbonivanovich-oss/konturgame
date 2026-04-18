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

function Spark({ data, color = 'currentColor', fill = false }: { data: number[]; color?: string; fill?: boolean }) {
  const w = 100, h = 32
  const max = Math.max(...data), min = Math.min(...data)
  const rng = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / rng) * (h - 4) - 2
    return [x, y]
  })
  const path = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  return (
    <svg style={{ width: '100%', height: '32px', display: 'block' }} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {fill && <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill={color} opacity="0.15" />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

const SERVICE_MAP = [
  { id: 'market', name: 'Маркет' },
  { id: 'bank', name: 'Банк' },
  { id: 'extern', name: 'Экстерн' },
  { id: 'ofd', name: 'ОФД' },
  { id: 'fokus', name: 'Фокус' },
  { id: 'diadoc', name: 'Диадок' },
  { id: 'elba', name: 'Эльба' },
]

const NAV_ITEMS = [
  { n: 'Дневной цикл', g: '◎' },
  { n: 'Склад', g: '▦' },
  { n: 'Маркетинг', g: '◆' },
  { n: 'Экосистема', g: '□' },
  { n: 'Финансы', g: '₽' },
  { n: 'Репутация', g: '★' },
  { n: 'Достижения', g: '◈' },
]

function DesktopMainScreen() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showUpgradesModal, setShowUpgradesModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showAchievementsModal, setShowAchievementsModal] = useState(false)
  const [activeNav, setActiveNav] = useState('Дневной цикл')
  const [dayBlockedMsg, setDayBlockedMsg] = useState<string | null>(null)
  const [savingsToast, setSavingsToast] = useState<number | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const state = useGameStore()
  const {
    currentDay, balance, reputation, loyalty, services,
    pendingEvent, pendingEventsQueue, isGameOver, isVictory,
    lastDayResult, savedBalance,
    addBalance, addReputation, markEventAsResolved, activateService, addSavedBalance,
    advanceDay,
  } = state

  useEffect(() => {
    if (pendingEvent) setShowEventModal(true)
  }, [pendingEvent])

  const handleEventOption = (optionId: string) => {
    if (!pendingEvent) return
    const option = pendingEvent.options.find((o) => o.id === optionId)
    if (!option) return
    const c = option.consequences
    if (c.balanceDelta !== undefined) addBalance(c.balanceDelta)
    if (c.reputationDelta !== undefined) addReputation(c.reputationDelta)
    if (c.serviceId) activateService(c.serviceId)
    if (option.isContourOption && c.balanceDelta !== undefined) {
      const nonKontour = pendingEvent.options.filter((o) => !o.isContourOption)
      if (nonKontour.length > 0) {
        const cheapest = nonKontour.reduce((best, o) => {
          const d = o.consequences.balanceDelta ?? 0
          return d > (best.consequences.balanceDelta ?? 0) ? o : best
        })
        const savings = c.balanceDelta - (cheapest.consequences.balanceDelta ?? 0)
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

  const handleNextDay = () => {
    if (pendingEvent) {
      setDayBlockedMsg('Сначала разрешите событие')
      setTimeout(() => setDayBlockedMsg(null), 2500)
      return
    }
    const result = advanceDay()
    if (result.blocked) {
      setDayBlockedMsg(result.reason ?? 'День заблокирован')
      setTimeout(() => setDayBlockedMsg(null), 2500)
    }
  }

  const handleNavClick = (name: string) => {
    setActiveNav(name)
    if (name === 'Достижения') setShowAchievementsModal(true)
  }

  const incomeSparkData = Array.from({ length: 10 }, (_, i) => Math.sin(i * 0.8) * 20 + 30)
  const activeServiceIds = Object.values(services).filter(s => s.isActive).map(s => s.id)
  const activeCount = activeServiceIds.length
  const dailyIncome = lastDayResult?.revenue ?? 0
  const monthlyExpenses = Object.values(services).filter(s => s.isActive).reduce((sum, s) => sum + (s.monthlyPrice ?? 0), 0)
  const goalAmount = 1_000_000
  const toGoalPercent = Math.min((balance / goalAmount) * 100, 100)
  const isDayBlocked = !!pendingEvent

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
      {/* LEFT RAIL — white, per design spec */}
      <aside style={{
        width: 240, background: '#fff', color: 'var(--k-ink)',
        padding: '24px 20px', display: 'flex', flexDirection: 'column',
        flexShrink: 0,
        borderRight: '1px solid rgba(14,17,22,0.08)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--k-orange)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Бизнес</div>
            <div style={{ fontSize: 10, opacity: 0.45, fontWeight: 600 }}>с Контуром</div>
          </div>
        </div>

        {/* Day info box */}
        <div style={{ padding: 12, borderRadius: 12, background: 'var(--k-surface)', marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', opacity: 0.45 }}>КОФЕЙНЯ «ЗЕРНО»</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>День {currentDay}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 11, fontWeight: 600, opacity: 0.55 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--k-green)' }} />
            Весна · солнечно · +8%
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(item => {
            const isActive = activeNav === item.n
            const badge = item.n === 'Дневной цикл' ? '1' : item.n === 'Экосистема' ? `${activeCount}/7` : undefined
            return (
              <div
                key={item.n}
                onClick={() => handleNavClick(item.n)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: isActive ? 'var(--k-orange)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--k-ink)',
                  fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  userSelect: 'none',
                }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: isActive ? 'rgba(255,255,255,0.22)' : 'var(--k-surface)',
                  color: isActive ? '#fff' : 'var(--k-ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800,
                }}>{item.g}</span>
                <span style={{ flex: 1 }}>{item.n}</span>
                {badge && (
                  <span style={{
                    fontSize: 10, fontWeight: 800,
                    padding: '2px 6px', borderRadius: 999,
                    background: isActive ? 'rgba(255,255,255,0.22)' : 'var(--k-surface-2)',
                    color: isActive ? '#fff' : 'var(--k-ink)',
                  }}>{badge}</span>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1 }} />

        {/* Saved balance badge — green-soft per spec */}
        <div style={{ padding: 14, borderRadius: 16, background: 'var(--k-green-soft)', color: 'var(--k-ink)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.55, letterSpacing: '0.08em' }}>СПАСЕНО С КОНТУРОМ</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }} className="k-num">
            {(savedBalance ?? 0).toLocaleString('ru-RU')} ₽
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.55, marginTop: 4 }}>
            за {currentDay} {currentDay === 1 ? 'день' : 'дней'}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: '20px 24px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* KPI row — Orange + Green + White + White (max 2 accents + neutrals) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1fr', gap: 10, height: 146 }}>

          {/* Income — Orange */}
          <div style={{
            background: 'var(--k-orange)', color: '#fff',
            borderRadius: 20, padding: 20,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.75 }}>ДОХОД ЗА ДЕНЬ</div>
              <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 2 }} className="k-num">
                {(dailyIncome || 0).toLocaleString('ru-RU')} ₽
              </div>
            </div>
            <Spark data={incomeSparkData} color="#fff" fill />
          </div>

          {/* Net balance — Green */}
          <div style={{
            background: 'var(--k-green)', color: '#fff',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.75 }}>ЧИСТАЯ</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                +{balance.toLocaleString('ru-RU')} ₽
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.75, marginTop: 4 }}>после налогов и закупок</div>
            </div>
          </div>

          {/* Expenses — White (neutral) */}
          <div style={{
            background: '#fff', color: 'var(--k-ink)',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.4 }}>РАСХОДЫ/МЕС</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
              {monthlyExpenses.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          {/* Goal — White (neutral) with green progress */}
          <div style={{
            background: '#fff', color: 'var(--k-ink)',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.4 }}>К ЦЕЛИ</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                {Math.round(toGoalPercent)}%
              </div>
              <div style={{ marginTop: 6, height: 5, background: 'rgba(14,17,22,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${toGoalPercent}%`, height: '100%', background: 'var(--k-green)', borderRadius: 999 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Main row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12, flex: 1, minHeight: 0 }}>

          {/* LEFT column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Event block — inline white card with orange accent border, per spec */}
            {pendingEvent && (
              <div style={{
                background: '#fff', color: 'var(--k-ink)',
                borderRadius: 20, padding: 20,
                display: 'flex', flexDirection: 'column', gap: 14,
                border: '1.5px solid var(--k-orange)',
                borderTop: '3px solid var(--k-orange)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      background: 'var(--k-orange)', color: '#fff',
                      fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
                      padding: '4px 10px', borderRadius: 999,
                    }}>СОБЫТИЕ · ТРЕБУЕТ РЕШЕНИЯ</span>
                    <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.45 }}>Блокирует Следующий день</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.45 }}>
                    1 / {1 + (pendingEventsQueue?.length ?? 0)}
                  </span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
                  {pendingEvent.title}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {pendingEvent.options.map((opt: any) => (
                    <div
                      key={opt.id}
                      onClick={() => handleEventOption(opt.id)}
                      style={{
                        background: opt.isContourOption ? 'var(--k-green-soft)' : 'var(--k-surface)',
                        color: 'var(--k-ink)',
                        border: opt.isContourOption ? '1.5px solid var(--k-green)' : '1.5px solid rgba(14,17,22,0.08)',
                        borderRadius: 14, padding: 14,
                        cursor: 'pointer',
                        transition: 'transform 0.12s ease',
                      }}>
                      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>{opt.name}</div>
                      <div style={{
                        fontSize: 18, fontWeight: 800,
                        color: opt.isContourOption ? 'var(--k-green)' : 'var(--k-ink)',
                      }} className="k-num">
                        {opt.consequences?.balanceDelta != null
                          ? `${opt.consequences.balanceDelta > 0 ? '+' : ''}${opt.consequences.balanceDelta.toLocaleString('ru-RU')}`
                          : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Indicators — max 2 soft backgrounds: green-soft + surface-2 (neutral) */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: 14,
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
            }}>
              {[
                { l: 'Репутация', v: String(reputation), bg: 'var(--k-green-soft)' },
                { l: 'Лояльность', v: `${loyalty}%`, bg: 'var(--k-surface-2)' },
                { l: 'День', v: String(currentDay), bg: 'var(--k-surface-2)' },
              ].map(i => (
                <div key={i.l} style={{ padding: 10, borderRadius: 12, background: i.bg }}>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.55 }}>{i.l}</div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{i.v}</div>
                </div>
              ))}
            </div>

            {/* Action buttons — Secondary style (ink bg) per spec */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <button
                onClick={() => setShowPurchaseModal(true)}
                style={{
                  padding: '10px 14px', border: 'none',
                  background: 'var(--k-ink)', color: '#fff',
                  borderRadius: 999, fontFamily: 'inherit',
                  fontWeight: 800, fontSize: 12, letterSpacing: '-0.01em',
                  cursor: 'pointer', transition: 'transform 0.12s ease',
                }}>
                📦 Закупка
              </button>
              <button
                onClick={() => setShowCampaignModal(true)}
                style={{
                  padding: '10px 14px', border: 'none',
                  background: 'var(--k-ink)', color: '#fff',
                  borderRadius: 999, fontFamily: 'inherit',
                  fontWeight: 800, fontSize: 12, letterSpacing: '-0.01em',
                  cursor: 'pointer', transition: 'transform 0.12s ease',
                }}>
                📢 Реклама
              </button>
              <button
                onClick={() => setShowUpgradesModal(true)}
                style={{
                  padding: '10px 14px', border: 'none',
                  background: 'var(--k-ink)', color: '#fff',
                  borderRadius: 999, fontFamily: 'inherit',
                  fontWeight: 800, fontSize: 12, letterSpacing: '-0.01em',
                  cursor: 'pointer', transition: 'transform 0.12s ease',
                }}>
                🔧 Улучшения
              </button>
            </div>

            {/* Help / Settings shortcuts */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowHelpModal(true)}
                style={{
                  padding: '8px 14px', border: '1.5px solid rgba(14,17,22,0.1)',
                  background: 'transparent', color: 'var(--k-ink)',
                  borderRadius: 999, fontFamily: 'inherit',
                  fontWeight: 700, fontSize: 12, letterSpacing: '-0.01em',
                  cursor: 'pointer', transition: 'transform 0.12s ease',
                }}>
                ? Справка
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                style={{
                  padding: '8px 14px', border: '1.5px solid rgba(14,17,22,0.1)',
                  background: 'transparent', color: 'var(--k-ink)',
                  borderRadius: 999, fontFamily: 'inherit',
                  fontWeight: 700, fontSize: 12, letterSpacing: '-0.01em',
                  cursor: 'pointer', transition: 'transform 0.12s ease',
                }}>
                ⚙ Настройки
              </button>
            </div>
          </div>

          {/* RIGHT column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>

            {/* Services — uniform style: active=surface-2+green dot, inactive=surface+opacity */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: 14,
              flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.5 }}>
                  ЭКОСИСТЕМА · {activeCount}/7
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {SERVICE_MAP.map(svc => {
                  const isActive = activeServiceIds.includes(svc.id)
                  return (
                    <div key={svc.id} style={{
                      background: isActive ? 'var(--k-surface-2)' : 'var(--k-surface)',
                      color: 'var(--k-ink)',
                      opacity: isActive ? 1 : 0.45,
                      borderRadius: 10, padding: '8px 10px',
                      fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      minHeight: 32,
                    }}>
                      <span>{svc.name}</span>
                      {isActive && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--k-green)', flexShrink: 0 }} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Next Day button */}
            <div>
              {dayBlockedMsg && (
                <div style={{
                  marginBottom: 8, padding: '8px 14px',
                  background: 'var(--k-orange-soft)', color: 'var(--k-orange)',
                  borderRadius: 12, fontSize: 12, fontWeight: 700, textAlign: 'center',
                }}>
                  {dayBlockedMsg}
                </div>
              )}
              <button
                onClick={handleNextDay}
                disabled={isDayBlocked}
                style={{
                  width: '100%', border: 'none',
                  cursor: isDayBlocked ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  background: isDayBlocked ? 'var(--k-surface-2)' : 'var(--k-orange)',
                  color: isDayBlocked ? 'rgba(14,17,22,0.35)' : 'var(--k-ink)',
                  padding: '20px 24px', borderRadius: 999,
                  fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  opacity: isDayBlocked ? 0.6 : 1,
                  transition: 'transform 0.12s ease, opacity 0.2s',
                }}>
                {isDayBlocked ? '⏸ Разрешите событие' : 'Следующий день →'}
              </button>
            </div>
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
      <AchievementsModal isOpen={showAchievementsModal} onClose={() => setShowAchievementsModal(false)} />
      <VictoryModal isOpen={isVictory} type="victory" />
      <VictoryModal isOpen={isGameOver && !isVictory} type="defeat" />

      {/* Savings toast */}
      {savingsToast !== null && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 50, background: 'var(--k-green)', color: '#fff',
          padding: '16px 24px', borderRadius: 16, fontSize: 14, fontWeight: 700,
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
