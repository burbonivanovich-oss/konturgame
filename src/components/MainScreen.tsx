import { useState, useRef } from 'react'
import ResponsiveLayout from './ResponsiveLayout'
import MobileMainScreen from './MobileMainScreen'
import { OnboardingPanel } from './OnboardingPanel'
import PurchaseModal from './modals/PurchaseModal'
import CampaignModal from './modals/CampaignModal'
import UpgradesModal from './modals/UpgradesModal'
import HelpModal from './modals/HelpModal'
import SettingsModal from './modals/SettingsModal'
import VictoryModal from './modals/VictoryModal'
import AchievementsModal from './modals/AchievementsModal'
import CashRegisterModal from './modals/CashRegisterModal'
import AssortmentModal from './modals/AssortmentModal'
import PromoCodeModal from './modals/PromoCodeModal'
import PromoWalletModal from './modals/PromoWalletModal'
import BundleModal from './modals/BundleModal'
import MicroEventModal from './modals/MicroEventModal'
import HireEmployeeModal from './modals/HireEmployeeModal'
import SupplierModal from './modals/SupplierModal'
import { DesktopRecap } from './design-system/DesktopRecap'
import { DesktopKontur } from './design-system/DesktopKontur'
import { WarehouseView } from './views/WarehouseView'
import { MarketingView } from './views/MarketingView'
import { FinanceView } from './views/FinanceView'
import { ReputationView } from './views/ReputationView'
import OperationsView from './views/OperationsView'
import StatisticsView from './views/StatisticsView'
import { CampaignROIView } from './views/CampaignROIView'
import { MilestoneView } from './views/MilestoneView'
import { useGameStore } from '../stores/gameStore'

type ActiveView = 'dashboard' | 'recap' | 'ecosystem' | 'warehouse' | 'marketing' | 'finance' | 'reputation' | 'operations' | 'statistics' | 'campaigns' | 'milestones'

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

const NAV_ITEMS: Array<{ n: string; g: string; view: ActiveView | null }> = [
  { n: 'Дневной цикл', g: '◎', view: 'dashboard' },
  { n: 'Управление', g: '⚙', view: 'operations' },
  { n: 'Маркетинг', g: '◆', view: 'marketing' },
  { n: 'Экосистема', g: '□', view: 'ecosystem' },
  { n: 'Финансы', g: '₽', view: 'finance' },
  { n: 'Статистика', g: '📊', view: 'statistics' },
  { n: 'ROI Кампаний', g: '📈', view: 'campaigns' },
  { n: 'Вехи', g: '🏆', view: 'milestones' },
  { n: 'Достижения', g: '◈', view: null },
]

function LeftRail({
  currentDay, savedBalance, activeNav, activeCount,
  pendingEventCount, onNavClick, onHelp, onSettings,
  onPromoWallet, promoCodesCount,
}: {
  currentDay: number
  savedBalance: number
  activeNav: string
  activeCount: number
  pendingEventCount: number
  onNavClick: (name: string) => void
  onHelp: () => void
  onSettings: () => void
  onPromoWallet: () => void
  promoCodesCount: number
}) {
  return (
    <aside style={{
      width: 240, background: '#fff', color: 'var(--k-ink)',
      padding: '24px 20px', display: 'flex', flexDirection: 'column',
      flexShrink: 0, borderRight: '1px solid rgba(14,17,22,0.08)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--k-orange)', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Бизнес</div>
          <div style={{ fontSize: 10, opacity: 0.45, fontWeight: 600 }}>с Контуром</div>
        </div>
      </div>

      {/* Day info */}
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
          const badge =
            item.n === 'Дневной цикл' && pendingEventCount > 0 ? String(pendingEventCount) :
            item.n === 'Экосистема' ? `${activeCount}/7` : undefined
          return (
            <div
              key={item.n}
              onClick={() => onNavClick(item.n)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                background: isActive ? 'var(--k-orange)' : 'transparent',
                color: isActive ? '#fff' : 'var(--k-ink)',
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'background 0.15s',
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

      {/* Saved balance badge */}
      <div style={{ padding: 14, borderRadius: 16, background: 'var(--k-green-soft)', color: 'var(--k-ink)' }}>
        <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.55, letterSpacing: '0.08em' }}>СПАСЕНО С КОНТУРОМ</div>
        <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }} className="k-num">
          {(savedBalance ?? 0).toLocaleString('ru-RU')} ₽
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.55, marginTop: 4 }}>
          за {currentDay} {currentDay === 1 ? 'день' : 'дней'}
        </div>
      </div>

      {/* Promo Wallet */}
      <LeftRailPromoWallet onPromoWalletClick={onPromoWallet} promoCodesCount={promoCodesCount} />

      {/* Help & Settings */}
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <button
          onClick={onHelp}
          style={{
            flex: 1, border: '1px solid rgba(14,17,22,0.1)', cursor: 'pointer',
            background: 'transparent', color: 'var(--k-ink)',
            padding: '8px 0', borderRadius: 10,
            fontFamily: 'inherit', fontSize: 11, fontWeight: 700,
          }}>
          ? Справка
        </button>
        <button
          onClick={onSettings}
          style={{
            flex: 1, border: '1px solid rgba(14,17,22,0.1)', cursor: 'pointer',
            background: 'transparent', color: 'var(--k-ink)',
            padding: '8px 0', borderRadius: 10,
            fontFamily: 'inherit', fontSize: 11, fontWeight: 700,
          }}>
          ⚙ Настройки
        </button>
      </div>
    </aside>
  )
}

interface LeftRailPromoWalletProps {
  onPromoWalletClick: () => void
  promoCodesCount: number
}

function LeftRailPromoWallet({ onPromoWalletClick, promoCodesCount }: LeftRailPromoWalletProps) {
  return (
    <button
      onClick={onPromoWalletClick}
      style={{
        width: '100%', padding: '10px 12px', marginBottom: 10,
        background: 'var(--k-orange-soft)', color: 'var(--k-orange)',
        border: '1px solid var(--k-orange)',
        borderRadius: 10, fontSize: 13, fontWeight: 700,
        cursor: 'pointer', transition: 'opacity 0.2s',
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    >
      🎟️ Промокоды
      {promoCodesCount > 0 && (
        <span style={{
          position: 'absolute', right: 8,
          width: 20, height: 20, borderRadius: '50%',
          background: 'var(--k-orange)', color: '#fff',
          fontSize: 10, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Math.min(promoCodesCount, 9)}
        </span>
      )}
    </button>
  )
}

function DashboardView({
  onNextDay, dayBlockedMsg,
  showPurchaseModal, setShowPurchaseModal,
  showCampaignModal, setShowCampaignModal,
  showUpgradesModal, setShowUpgradesModal,
  showCashRegisterModal, setShowCashRegisterModal,
  handleEventOption,
}: {
  onNextDay: () => void
  dayBlockedMsg: string | null
  showPurchaseModal: boolean
  setShowPurchaseModal: (v: boolean) => void
  showCampaignModal: boolean
  setShowCampaignModal: (v: boolean) => void
  showUpgradesModal: boolean
  setShowUpgradesModal: (v: boolean) => void
  showCashRegisterModal: boolean
  setShowCashRegisterModal: (v: boolean) => void
  handleEventOption: (id: string) => void
}) {
  const {
    currentWeek, balance, reputation, loyalty, services,
    pendingEvent, pendingEventsQueue, lastDayResult, savedBalance,
  } = useGameStore()

  const incomeSparkData = Array.from({ length: 10 }, (_, i) => Math.sin(i * 0.8) * 20 + 30)
  const activeServiceIds = Object.values(services).filter(s => s.isActive).map(s => s.id)
  const activeCount = activeServiceIds.length
  const dailyIncome = lastDayResult?.revenue ?? 0
  const monthlyExpenses = Object.values(services).filter(s => s.isActive).reduce((sum, s) => sum + ((s.annualPrice ?? 0) / 12), 0)
  const goalAmount = 1_000_000
  const toGoalPercent = Math.min((balance / goalAmount) * 100, 100)
  const isDayBlocked = !!pendingEvent

  return (
    <main style={{ flex: 1, padding: '20px 24px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1fr', gap: 10, height: 146 }}>
        <div style={{
          background: 'var(--k-orange)', color: '#fff',
          borderRadius: 20, padding: 20,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.75 }}>ДОХОД ЗА ДЕНЬ</div>
            <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 2 }} className="k-num">
              {dailyIncome.toLocaleString('ru-RU')} ₽
            </div>
          </div>
          <Spark data={incomeSparkData} color="#fff" fill />
        </div>

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

          {/* Pending event — inline white card with orange accent */}
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
              {pendingEvent.description && (
                <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.65, lineHeight: 1.45 }}>
                  {pendingEvent.description}
                </div>
              )}
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
                      cursor: 'pointer', transition: 'opacity 0.15s',
                    }}>
                    <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>{opt.text}</div>
                    <div style={{
                      fontSize: 18, fontWeight: 800,
                      color: opt.isContourOption ? 'var(--k-green)' : 'var(--k-ink)',
                    }} className="k-num">
                      {opt.consequences?.balanceDelta != null
                        ? `${opt.consequences.balanceDelta > 0 ? '+' : ''}${opt.consequences.balanceDelta.toLocaleString('ru-RU')} ₽`
                        : '—'}
                    </div>
                    {opt.isContourOption && (
                      <div style={{
                        marginTop: 6, fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
                        color: 'var(--k-green)',
                      }}>КОНТУР ✓</div>
                    )}
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
              { l: 'Репутация', v: String(reputation), bg: 'var(--k-green-soft)' },
              { l: 'Лояльность', v: `${loyalty}%`, bg: 'var(--k-surface-2)' },
              { l: 'Неделя', v: String(currentWeek), bg: 'var(--k-surface-2)' },
            ].map(i => (
              <div key={i.l} style={{ padding: 10, borderRadius: 12, background: i.bg }}>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.55 }}>{i.l}</div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{i.v}</div>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>

          {/* Services */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: 14,
            flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.5 }}>
              ЭКОСИСТЕМА · {activeCount}/7
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {SERVICE_MAP.map(svc => {
                const isActive = activeServiceIds.some(id => id === svc.id)
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
                    {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--k-green)', flexShrink: 0 }} />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Onboarding Panel */}
          <OnboardingPanel />

          {/* Next Day */}
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
              onClick={onNextDay}
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

      {/* Purchase modal rendered inside DashboardView for scoping */}
      <PurchaseModal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} />
      <CampaignModal isOpen={showCampaignModal} onClose={() => setShowCampaignModal(false)} />
      <UpgradesModal isOpen={showUpgradesModal} onClose={() => setShowUpgradesModal(false)} />
    </main>
  )
}

function DesktopMainScreen({ onRestart }: { onRestart?: () => void }) {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [activeNav, setActiveNav] = useState('Дневной цикл')
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showUpgradesModal, setShowUpgradesModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showAchievementsModal, setShowAchievementsModal] = useState(false)
  const [showCashRegisterModal, setShowCashRegisterModal] = useState(false)
  const [showPromoWalletModal, setShowPromoWalletModal] = useState(false)
  const [showHireEmployeeModal, setShowHireEmployeeModal] = useState(false)
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [dayBlockedMsg, setDayBlockedMsg] = useState<string | null>(null)
  const [savingsToast, setSavingsToast] = useState<number | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    currentWeek, services, pendingEvent, pendingEventsQueue,
    isGameOver, isVictory, savedBalance, promoCodesRevealed,
    addBalance, addReputation, addLoyalty, markEventAsResolved, activateService,
    addSavedBalance, setTemporaryModifiers, advanceDay,
  } = useGameStore()

  const activeServiceIds = Object.values(services).filter(s => s.isActive).map(s => s.id)
  const activeCount = activeServiceIds.length
  const pendingEventCount = (pendingEvent ? 1 : 0) + (pendingEventsQueue?.length ?? 0)

  const handleEventOption = (optionId: string) => {
    if (!pendingEvent) return
    const option = pendingEvent.options.find((o) => o.id === optionId)
    if (!option) return
    const c = option.consequences
    if (c.balanceDelta !== undefined) addBalance(c.balanceDelta)
    if (c.reputationDelta !== undefined) addReputation(c.reputationDelta)
    if (c.loyaltyDelta !== undefined) addLoyalty(c.loyaltyDelta)
    if (c.clientModifier !== undefined || c.checkModifier !== undefined) {
      const cur = useGameStore.getState()
      setTemporaryModifiers(
        (cur.temporaryClientMod ?? 0) + (c.clientModifier ?? 0),
        (cur.temporaryCheckMod ?? 0) + (c.checkModifier ?? 0),
        Math.max(cur.temporaryModDaysLeft ?? 0, c.clientModifierDays ?? c.checkModifierDays ?? 1),
      )
    }
    if (c.serviceId) activateService(c.serviceId)
    if (option.isContourOption && c.balanceDelta !== undefined) {
      const nonKontour = pendingEvent.options.filter((o) => !o.isContourOption)
      if (nonKontour.length > 0) {
        const cheapest = nonKontour.reduce((best, o) =>
          (o.consequences.balanceDelta ?? 0) > (best.consequences.balanceDelta ?? 0) ? o : best
        )
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
    } else {
      setActiveView('recap')
      setActiveNav('Дневной цикл')
    }
  }

  const handleNavClick = (name: string) => {
    setActiveNav(name)
    if (name === 'Достижения') {
      setShowAchievementsModal(true)
      return
    }
    const item = NAV_ITEMS.find(i => i.n === name)
    if (item?.view) setActiveView(item.view)
  }

  const handleRecapContinue = () => {
    setActiveView('dashboard')
    setActiveNav('Дневной цикл')
  }

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
      <LeftRail
        currentDay={currentWeek}
        savedBalance={savedBalance ?? 0}
        activeNav={activeNav}
        activeCount={activeCount}
        pendingEventCount={pendingEventCount}
        onNavClick={handleNavClick}
        onHelp={() => setShowHelpModal(true)}
        onSettings={() => setShowSettingsModal(true)}
        onPromoWallet={() => setShowPromoWalletModal(true)}
        promoCodesCount={promoCodesRevealed?.length ?? 0}
      />

      {activeView === 'dashboard' && (
        <DashboardView
          onNextDay={handleNextDay}
          dayBlockedMsg={dayBlockedMsg}
          showPurchaseModal={showPurchaseModal}
          setShowPurchaseModal={setShowPurchaseModal}
          showCampaignModal={showCampaignModal}
          setShowCampaignModal={setShowCampaignModal}
          showUpgradesModal={showUpgradesModal}
          setShowUpgradesModal={setShowUpgradesModal}
          showCashRegisterModal={showCashRegisterModal}
          setShowCashRegisterModal={setShowCashRegisterModal}
          handleEventOption={handleEventOption}
        />
      )}

      {activeView === 'recap' && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <DesktopRecap embedded onContinue={handleRecapContinue} />
        </div>
      )}

      {activeView === 'ecosystem' && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <DesktopKontur embedded />
        </div>
      )}

      {activeView === 'warehouse' && <WarehouseView />}
      {activeView === 'marketing' && <MarketingView />}
      {activeView === 'finance' && <FinanceView />}
      {activeView === 'reputation' && <ReputationView />}
      {activeView === 'operations' && (
        <OperationsView
          onShowHireModal={() => setShowHireEmployeeModal(true)}
          onShowSupplierModal={() => setShowSupplierModal(true)}
          onShowUpgradesModal={() => setShowUpgradesModal(true)}
        />
      )}
      {activeView === 'statistics' && <StatisticsView />}
      {activeView === 'campaigns' && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', flex: 1 }}>
            <CampaignROIView />
          </div>
        </div>
      )}
      {activeView === 'milestones' && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', flex: 1 }}>
            <MilestoneView />
          </div>
        </div>
      )}

      {/* Global modals */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} onRestart={onRestart} />
      <AchievementsModal isOpen={showAchievementsModal} onClose={() => setShowAchievementsModal(false)} />
      <CashRegisterModal isOpen={showCashRegisterModal} onClose={() => setShowCashRegisterModal(false)} />
      <HireEmployeeModal isOpen={showHireEmployeeModal} onClose={() => setShowHireEmployeeModal(false)} />
      <SupplierModal isOpen={showSupplierModal} onClose={() => setShowSupplierModal(false)} />
      <AssortmentModal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} />
      <PromoCodeModal />
      <PromoWalletModal isOpen={showPromoWalletModal} onClose={() => setShowPromoWalletModal(false)} />
      <BundleModal />
      <MicroEventModal />
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

interface MainScreenProps {
  onRestart?: () => void
}

export default function MainScreen({ onRestart }: MainScreenProps) {
  return (
    <ResponsiveLayout
      desktopView={<DesktopMainScreen onRestart={onRestart} />}
      mobileView={<MobileMainScreen onRestart={onRestart} />}
    />
  )
}
