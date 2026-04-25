import { useState } from 'react'
import { K } from './design-system/tokens'
import Indicators from './Indicators'
import NextDayButton from './NextDayButton'
import ServicePanel from './ServicePanel'
import { OnboardingPanel } from './OnboardingPanel'
import EventModal from './modals/EventModal'
import HelpModal from './modals/HelpModal'
import SettingsModal from './modals/SettingsModal'
import AchievementsModal from './modals/AchievementsModal'
import VictoryModal from './modals/VictoryModal'
import CashRegisterModal from './modals/CashRegisterModal'
import AssortmentModal from './modals/AssortmentModal'
import PromoCodeModal from './modals/PromoCodeModal'
import PromoWalletModal from './modals/PromoWalletModal'
import BundleModal from './modals/BundleModal'
import OwnerInvestmentsModal from './modals/OwnerInvestmentsModal'
import NPCRosterModal from './modals/NPCRosterModal'
import HireEmployeeModal from './modals/HireEmployeeModal'
import { FinanceView } from './views/FinanceView'
import { WarehouseView } from './views/WarehouseView'
import OperationsView from './views/OperationsView'
import { DevelopmentView } from './views/DevelopmentView'
import StatisticsView from './views/StatisticsView'
import { DecisionLogView } from './views/DecisionLogView'
import { WEEKLY_TACTICS, getWeeklyTacticDef } from '../constants/weeklyTactics'
import { WeekSummaryOverlay } from './WeekSummaryOverlay'
import { WeekResultsOverlay } from './WeekResultsOverlay'
import { useGameStore } from '../stores/gameStore'

interface MobileMainScreenProps {
  onRestart?: () => void
}

export default function MobileMainScreen({ onRestart }: MobileMainScreenProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)

  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showAchievementsModal, setShowAchievementsModal] = useState(false)
  const [showCashRegisterModal, setShowCashRegisterModal] = useState(false)
  const [showPromoWalletModal, setShowPromoWalletModal] = useState(false)
  const [showOwnerInvestmentsModal, setShowOwnerInvestmentsModal] = useState(false)
  const [showNpcRosterModal, setShowNpcRosterModal] = useState(false)
  const [showHireEmployeeModal, setShowHireEmployeeModal] = useState(false)
  const [activeTab, setActiveTab] = useState('day')

  const {
    pendingEvent, pendingEventsQueue, isGameOver, isVictory, businessType, achievements, promoCodesRevealed,
    weekPhase, completeResultsPhase, completeSummaryPhase, lastDayResult, balance,
    weeklyTactic, setWeeklyTactic, personalGoal, currentWeek, npcs,
  } = useGameStore()
  const [savingsToast, setSavingsToast] = useState<number | null>(null)

  const handleEventOption = (optionId: string) => {
    const state = useGameStore.getState()
    const { pendingEvent, markEventAsResolved, setTemporaryModifiers, activateService, addSavedBalance } = state

    if (!pendingEvent) return
    const option = pendingEvent.options.find((o) => o.id === optionId)
    if (!option) return

    const c = option.consequences
    const { addBalance, addReputation, addLoyalty } = useGameStore.getState()

    if (c.balanceDelta !== undefined) addBalance(c.balanceDelta)
    if (c.reputationDelta !== undefined) addReputation(c.reputationDelta)
    if (c.loyaltyDelta !== undefined) addLoyalty(c.loyaltyDelta)

    if (c.clientModifier !== undefined || c.checkModifier !== undefined) {
      const currentState = useGameStore.getState()
      setTemporaryModifiers(
        (currentState.temporaryClientMod ?? 0) + (c.clientModifier ?? 0),
        (currentState.temporaryCheckMod ?? 0) + (c.checkModifier ?? 0),
        Math.max(
          currentState.temporaryModDaysLeft ?? 0,
          c.clientModifierDays ?? c.checkModifierDays ?? 1,
        ),
      )
    }

    if (c.serviceId) {
      activateService(c.serviceId)
    }

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
          setSavingsToast(savings)
          setTimeout(() => setSavingsToast(null), 3500)
        }
      }
    }

    markEventAsResolved(pendingEvent.id)
    setShowEventModal(false)
  }

  return (
    <div style={{
      padding: 12, display: 'flex', flexDirection: 'column', gap: 12,
      height: '100%', background: K.bone,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingBottom: 12, borderBottom: `1px solid ${K.line}`,
      }}>
        <div style={{ fontSize: 14, fontWeight: 800 }}>Бизнес с Контуром</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setShowPromoWalletModal(true)}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: K.orangeSoft, border: 'none', cursor: 'pointer',
              fontSize: 14, position: 'relative',
            }}
            title="Промокоды"
          >
            🎟️
            {(promoCodesRevealed?.length ?? 0) > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: K.orange, color: K.white,
                fontSize: 9, fontWeight: 800, padding: '2px 4px',
                borderRadius: 4,
              }}>
                {Math.min(promoCodesRevealed?.length ?? 0, 9)}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowAchievementsModal(true)}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: K.line, border: 'none', cursor: 'pointer',
              fontSize: 14, position: 'relative',
            }}
          >
            🏆
            {achievements.length > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: K.orange, color: K.white,
                fontSize: 10, fontWeight: 800, padding: '2px 4px',
                borderRadius: 4,
              }}>
                {achievements.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowHelpModal(true)}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: K.line, border: 'none', cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ?
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: K.line, border: 'none', cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Tab navigation — horizontally scrollable, view tabs gated by week */}
      <div style={{
        display: 'flex', gap: 4,
        overflowX: 'auto', overflowY: 'hidden',
        borderBottom: `1px solid ${K.line}`,
        marginBottom: 8,
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}>
        {[
          { id: 'day',         label: '◎ День',         unlocksAtWeek: 0  },
          { id: 'stats',       label: '⭐ Индикаторы',  unlocksAtWeek: 0  },
          { id: 'services',    label: '🔌 Сервисы',     unlocksAtWeek: 0  },
          { id: 'finance',     label: '💼 Финансы',     unlocksAtWeek: 0  },
          { id: 'operations',  label: '⚙️ Управление',  unlocksAtWeek: 0  },
          { id: 'warehouse',   label: '📦 Склад',       unlocksAtWeek: 2  },
          { id: 'development', label: '🚀 Развитие',    unlocksAtWeek: 2  },
          { id: 'statistics',  label: '📊 Статистика',  unlocksAtWeek: 7  },
          { id: 'journal',     label: '📓 Журнал',      unlocksAtWeek: 10 },
        ]
          .filter(tab => currentWeek >= tab.unlocksAtWeek)
          .map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                border: 'none', background: activeTab === tab.id ? K.ink : 'transparent',
                color: activeTab === tab.id ? K.white : K.ink,
                cursor: 'pointer', transition: 'all 0.2s',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {tab.label}
            </button>
          ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activeTab === 'day' && (
          <>
            {/* Hero balance — gradient card matching desktop */}
            <div style={{
              background: `linear-gradient(135deg, ${K.orange} 0%, #FFB020 100%)`,
              borderRadius: 14, padding: '14px 16px',
              boxShadow: '0 4px 14px rgba(255,106,44,0.25)',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Баланс
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: K.white, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1.05 }} className="k-num">
                {balance.toLocaleString('ru-RU')} ₽
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
                Неделя {currentWeek}
                {lastDayResult && (
                  <> · <span style={{ fontWeight: 700 }}>
                    {lastDayResult.netProfit >= 0 ? '+' : ''}{lastDayResult.netProfit.toLocaleString('ru-RU')} ₽/день
                  </span></>
                )}
              </div>
            </div>

            {/* Weekly tactic — chooser if not picked yet, chip after */}
            {!weeklyTactic ? (
              <div style={{
                background: K.white, border: `2px solid ${K.orange}`,
                borderRadius: 12, padding: 12,
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: K.orange, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Тактика на неделю
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {WEEKLY_TACTICS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setWeeklyTactic(t.id)}
                      style={{
                        textAlign: 'left', padding: '10px 12px',
                        background: K.bone, border: `1px solid ${K.lineSoft}`,
                        borderRadius: 10, cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: K.ink }}>{t.title}</div>
                        <div style={{ fontSize: 10, color: K.muted, lineHeight: 1.3 }}>{t.blurb}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (() => {
              const def = getWeeklyTacticDef(weeklyTactic)
              return def ? (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255,107,0,0.06) 0%, rgba(255,176,32,0.06) 100%)',
                  border: `1px solid ${K.orange}`,
                  borderRadius: 12, padding: '8px 12px',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 18 }}>{def.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: K.orange, textTransform: 'uppercase' }}>
                      Тактика
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: K.ink }}>{def.title}</div>
                  </div>
                  <button
                    onClick={() => setWeeklyTactic(null)}
                    style={{
                      background: K.white, border: `1px solid ${K.lineSoft}`,
                      borderRadius: 8, padding: '5px 9px',
                      fontSize: 10, fontWeight: 700, color: K.muted,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Сменить
                  </button>
                </div>
              ) : null
            })()}

            {/* Personal goal — compact progress bar */}
            {personalGoal && !personalGoal.achieved && !personalGoal.missed && (() => {
              const pct = Math.min(100, Math.max(0, Math.round((balance / personalGoal.targetAmount) * 100)))
              const weeksLeft = personalGoal.deadlineWeek - currentWeek
              const onTrack = (currentWeek / personalGoal.deadlineWeek) * 100 <= pct + 10
              const barColor = weeksLeft <= 4 ? K.bad : (onTrack ? K.mint : K.orange)
              return (
                <div style={{
                  background: K.white, border: `1px solid ${K.lineSoft}`,
                  borderRadius: 10, padding: '10px 12px',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: K.ink }}>🎯 {personalGoal.shortLabel}</span>
                    <span style={{ fontSize: 10, color: K.muted, fontVariantNumeric: 'tabular-nums' }}>
                      {weeksLeft > 0 ? `${weeksLeft} нед. до срока` : 'дедлайн'}
                    </span>
                  </div>
                  <div style={{ height: 6, background: K.lineSoft, borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: barColor, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: 10, color: K.muted, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                    {balance.toLocaleString('ru-RU')} / {personalGoal.targetAmount.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              )
            })()}

            {/* Daily profit (separate from balance hero now) */}
            <div style={{
              background: (lastDayResult?.netProfit ?? 0) >= 0 ? K.mintSoft : 'rgba(180,47,35,0.08)',
              border: `1px solid ${(lastDayResult?.netProfit ?? 0) >= 0 ? K.mint : K.bad}`,
              borderRadius: 10, padding: '10px 12px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: K.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Прибыль за день
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: (lastDayResult?.netProfit ?? 0) >= 0 ? K.ink : K.bad }} className="k-num">
                {lastDayResult
                  ? `${lastDayResult.netProfit >= 0 ? '+' : ''}${lastDayResult.netProfit.toLocaleString('ru-RU')} ₽`
                  : '—'}
              </div>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
            }}>
              <button
                onClick={() => setShowPurchaseModal(true)}
                style={{
                  padding: 12, borderRadius: 10, border: 'none',
                  background: K.ink, color: K.white,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                📦 Закупка
              </button>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
            }}>
              <button
                onClick={() => setShowCashRegisterModal(true)}
                style={{
                  padding: 12, borderRadius: 10, border: 'none',
                  background: K.orange, color: K.white,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                🖥️ Касса
              </button>
              <button
                onClick={() => setShowOwnerInvestmentsModal(true)}
                style={{
                  padding: 12, borderRadius: 10, border: 'none',
                  background: K.mint, color: K.white,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                ⚡ Энергия
              </button>
              <button
                onClick={() => setShowNpcRosterModal(true)}
                style={{
                  padding: 12, borderRadius: 10, border: 'none',
                  background: K.violet, color: K.white,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                <span>👥 Окружение</span>
                {(() => {
                  const revealed = (npcs ?? []).filter(n => n.isRevealed).length
                  return revealed > 0 ? (
                    <span style={{
                      fontSize: 10, padding: '1px 6px', borderRadius: 999,
                      background: 'rgba(255,255,255,0.25)', fontWeight: 700,
                    }}>{revealed}</span>
                  ) : null
                })()}
              </button>
            </div>

            <div>
              <NextDayButton />
            </div>
          </>
        )}

        {activeTab === 'stats' && (
          <>
            <Indicators />
          </>
        )}

        {activeTab === 'services' && (
          <>
            <OnboardingPanel onNavigate={() => setActiveTab('services')} />
            <ServicePanel />
          </>
        )}

        {activeTab === 'finance' && <FinanceView />}
        {activeTab === 'operations' && (
          <OperationsView onShowHireModal={() => setShowHireEmployeeModal(true)} />
        )}
        {activeTab === 'warehouse' && <WarehouseView />}
        {activeTab === 'development' && <DevelopmentView />}
        {activeTab === 'statistics' && <StatisticsView />}
        {activeTab === 'journal' && <DecisionLogView />}
      </div>

      {/* Toast */}
      {savingsToast !== null && (
        <div style={{
          position: 'fixed', bottom: 88, left: 16, right: 16,
          background: K.blue, color: K.white,
          padding: '12px 16px', borderRadius: 10,
          fontSize: 12, fontWeight: 700, textAlign: 'center',
          animation: 'slideUp 0.3s ease',
        }}>
          💙 Контур сэкономил {savingsToast.toLocaleString('ru-RU')} ₽!
        </div>
      )}

      {/* Modals */}
      <AssortmentModal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} />
      <EventModal
        isOpen={showEventModal}
        event={pendingEvent}
        onOptionSelect={handleEventOption}
        queueLength={pendingEventsQueue?.length ?? 0}
      />
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} onRestart={onRestart} />
      <AchievementsModal isOpen={showAchievementsModal} onClose={() => setShowAchievementsModal(false)} />
      <NPCRosterModal isOpen={showNpcRosterModal} onClose={() => setShowNpcRosterModal(false)} />
      <HireEmployeeModal isOpen={showHireEmployeeModal} onClose={() => setShowHireEmployeeModal(false)} />
      <CashRegisterModal isOpen={showCashRegisterModal} onClose={() => setShowCashRegisterModal(false)} />
      <PromoCodeModal />
      <PromoWalletModal isOpen={showPromoWalletModal} onClose={() => setShowPromoWalletModal(false)} />
      <OwnerInvestmentsModal isOpen={showOwnerInvestmentsModal} onClose={() => setShowOwnerInvestmentsModal(false)} />
      <BundleModal />
      <VictoryModal isOpen={isVictory} type="victory" />
      <VictoryModal isOpen={isGameOver && !isVictory} type="defeat" />

      {/* 4-phase weekly cycle overlays */}
      {weekPhase === 'summary' && !isGameOver && !isVictory && (
        <WeekSummaryOverlay onStart={completeSummaryPhase} />
      )}
      {weekPhase === 'results' && !isGameOver && !isVictory && (
        <WeekResultsOverlay onContinue={completeResultsPhase} />
      )}
    </div>
  )
}
