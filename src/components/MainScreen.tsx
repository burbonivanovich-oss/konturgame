import { useState, useRef } from 'react'
import { CHAIN_FOLLOWUP_DELAY, getChainEvent } from '../constants/eventChains'
import { getNPCDefinition } from '../constants/npcs'
import ResponsiveLayout from './ResponsiveLayout'
import MobileMainScreen from './MobileMainScreen'
import { OnboardingPanel } from './OnboardingPanel'
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
import OwnerInvestmentsModal from './modals/OwnerInvestmentsModal'
import { WeekSummaryOverlay } from './WeekSummaryOverlay'
import { WeekResultsOverlay } from './WeekResultsOverlay'
import { DesktopKontur } from './design-system/DesktopKontur'
import { WarehouseView } from './views/WarehouseView'
import { MarketingView } from './views/MarketingView'
import { FinanceView } from './views/FinanceView'
import { ReputationView } from './views/ReputationView'
import OperationsView from './views/OperationsView'
import StatisticsView from './views/StatisticsView'
import { CampaignROIView } from './views/CampaignROIView'
import { MilestoneView } from './views/MilestoneView'
import { DecisionLogView } from './views/DecisionLogView'
import { useGameStore } from '../stores/gameStore'
import { ONBOARDING_STAGES } from '../constants/onboarding'
import { BUSINESS_CONFIGS } from '../constants/business'
import type { BusinessType } from '../types/game'
import { KLeftRail } from './design-system/KLeftRail'
import { KHeaderBar } from './design-system/KHeaderBar'
import { K } from './design-system/tokens'
import type { NavId } from './design-system/KLeftRail'

const ONBOARDING_ACTION_TO_NAV: Record<string, NavId> = {
  activate_bank:    'ecosystem',
  activate_ofd:     'ecosystem',
  activate_market:  'ecosystem',
  activate_diadoc:  'ecosystem',
  activate_fokus:   'ecosystem',
  activate_elba:    'ecosystem',
  activate_extern:  'ecosystem',
  buy_register:     'operations',
}

type ActiveView = NavId


function DashboardView({
  onNextDay, dayBlockedMsg,
  showCampaignModal, setShowCampaignModal,
  showUpgradesModal, setShowUpgradesModal,
  showCashRegisterModal, setShowCashRegisterModal,
  handleEventOption, onOpenOwnerInvestments,
}: {
  onNextDay: () => void
  dayBlockedMsg: string | null
  showCampaignModal: boolean
  setShowCampaignModal: (v: boolean) => void
  showUpgradesModal: boolean
  setShowUpgradesModal: (v: boolean) => void
  showCashRegisterModal: boolean
  setShowCashRegisterModal: (v: boolean) => void
  handleEventOption: (id: string) => void
  onOpenOwnerInvestments: () => void
}) {
  const {
    currentWeek, balance, reputation, loyalty, services,
    pendingEvent, pendingEventsQueue, lastDayResult,
    entrepreneurEnergy, npcs, businessType,
  } = useGameStore()

  const bizConfig = BUSINESS_CONFIGS[businessType]
  const activeServiceIds = Object.values(services).filter(s => s.isActive).map(s => s.id)
  const dailyRevenue = lastDayResult?.revenue ?? 0
  const dailyExpenses = lastDayResult?.expenses ?? 0
  const dailyProfit = lastDayResult?.netProfit ?? 0
  const dailyClients = lastDayResult?.clients ?? 0
  const isDayBlocked = !!pendingEvent

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: K.paper }}>

      {/* Three-column body */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: '280px 1fr 240px',
        gap: 0, overflow: 'hidden',
      }}>

        {/* ── LEFT: Balance hero + energy + health ── */}
        <div style={{
          borderRight: `1px solid ${K.line}`,
          padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
          overflowY: 'auto',
        }}>
          {/* Ink balance card */}
          <div style={{
            background: K.ink, borderRadius: 16, padding: 20,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -30, right: -30,
              width: 120, height: 120, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,200,150,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Баланс
            </div>
            <div style={{
              fontSize: 28, fontWeight: 700, color: K.white,
              marginTop: 4, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
            }}>
              {balance.toLocaleString('ru-RU')} ₽
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
              Неделя {currentWeek}
            </div>
          </div>

          {/* Energy */}
          <div
            onClick={onOpenOwnerInvestments}
            style={{
              background: K.white, borderRadius: 12, padding: 14,
              border: `1px solid ${entrepreneurEnergy < 40 ? K.orange : K.line}`,
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: K.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Энергия
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: entrepreneurEnergy < 40 ? K.orange : K.ink }}>
                {entrepreneurEnergy}/100
              </span>
            </div>
            <div style={{ height: 6, background: K.lineSoft, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${entrepreneurEnergy}%`,
                background: entrepreneurEnergy < 40 ? K.orange : K.mint,
                borderRadius: 999,
              }} />
            </div>
            {entrepreneurEnergy < 40 && (
              <div style={{ marginTop: 6, fontSize: 11, color: K.orange, fontWeight: 600 }}>
                Восстановить →
              </div>
            )}
          </div>

          {/* Financial health tiles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Доход', value: `${dailyRevenue.toLocaleString('ru-RU')} ₽`, color: K.good },
              { label: 'Расходы', value: `${dailyExpenses.toLocaleString('ru-RU')} ₽`, color: K.orange },
              { label: 'Прибыль', value: `${dailyProfit > 0 ? '+' : ''}${dailyProfit.toLocaleString('ru-RU')} ₽`, color: dailyProfit >= 0 ? K.good : K.bad },
              { label: 'Клиенты', value: String(dailyClients), color: K.violet },
            ].map(t => (
              <div key={t.label} style={{
                background: K.white, border: `1px solid ${K.line}`,
                borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ fontSize: 10, color: K.muted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                  {t.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: t.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                  {t.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CENTER: Tasks + Event ── */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

          {/* Daily tasks checklist */}
          <div style={{ background: K.white, border: `1px solid ${K.line}`, borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, color: K.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Задачи дня
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Разрешить событие', done: !pendingEvent, urgent: !!pendingEvent },
                { label: 'Нажать «Следующий день»', done: false, urgent: false },
              ].map(task => (
                <div key={task.label} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 10px', borderRadius: 8,
                  background: task.urgent ? K.orangeSoft : 'transparent',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 999, flexShrink: 0,
                    border: `2px solid ${task.done ? K.mint : task.urgent ? K.orange : K.line}`,
                    background: task.done ? K.mint : 'transparent',
                    display: 'grid', placeItems: 'center',
                  }}>
                    {task.done && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke={K.white} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 500,
                    color: task.urgent ? K.orange : task.done ? K.muted : K.ink,
                    textDecoration: task.done ? 'line-through' : 'none',
                  }}>
                    {task.label}
                  </span>
                  {task.urgent && (
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: K.orange,
                      background: 'rgba(255,111,26,0.12)', padding: '2px 7px', borderRadius: 999,
                    }}>
                      СРОЧНО
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pending event card */}
          {pendingEvent && (() => {
            const npcDef = pendingEvent.npcId ? getNPCDefinition(pendingEvent.npcId) : null
            const npc = pendingEvent.npcId ? (npcs ?? []).find(n => n.id === pendingEvent.npcId) : null
            const isMoral = pendingEvent.isMoralDilemma === true
            const accentColor = isMoral ? K.warn : K.violet
            const accentBg = isMoral ? K.orangeSoft : K.violetSoft
            const deadlineWeeksLeft = pendingEvent.decisionDeadlineWeek
              ? Math.max(0, pendingEvent.decisionDeadlineWeek - currentWeek)
              : null

            return (
              <div style={{
                background: K.white, borderRadius: 14, padding: 20,
                border: `1.5px solid ${accentColor}`,
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      background: accentBg, color: accentColor,
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                      padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase',
                    }}>
                      {isMoral ? 'Дилемма' : 'Событие'}
                    </span>
                    {deadlineWeeksLeft !== null && (
                      <span style={{
                        background: K.orangeSoft, color: K.orange,
                        fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                      }}>
                        {deadlineWeeksLeft === 0 ? 'Решить сейчас' : `${deadlineWeeksLeft} нед.`}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: K.muted }}>
                    1 / {1 + (pendingEventsQueue?.length ?? 0)}
                  </span>
                </div>

                {npcDef && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 10,
                    background: K.bone,
                  }}>
                    <span style={{ fontSize: 22 }}>{npcDef.portrait}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{npcDef.name}</div>
                      <div style={{ fontSize: 11, color: K.muted }}>{npcDef.shortRole}</div>
                    </div>
                    {npc && npc.isRevealed && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: npc.relationshipLevel >= 60 ? K.good : K.muted }}>
                        {npc.relationshipLevel >= 80 ? 'Союзник' :
                         npc.relationshipLevel >= 60 ? 'Доверяет' :
                         npc.relationshipLevel >= 40 ? 'Нейтрально' : 'Напряжённо'}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                  {pendingEvent.title}
                </div>

                {pendingEvent.description && (
                  <div style={{ fontSize: 13, color: K.ink2, lineHeight: 1.5 }}>
                    {pendingEvent.description}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pendingEvent.options.map((opt: any) => (
                    <button
                      key={opt.id}
                      onClick={() => handleEventOption(opt.id)}
                      style={{
                        background: opt.isContourOption ? K.mintSoft : K.bone,
                        color: K.ink,
                        border: `1.5px solid ${opt.isContourOption ? K.mint : K.line}`,
                        borderRadius: 10, padding: '12px 14px',
                        cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{opt.text}</div>
                        {opt.isContourOption && (
                          <div style={{ fontSize: 10, color: K.mint, fontWeight: 700, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Контур ✓
                          </div>
                        )}
                      </div>
                      {opt.consequences?.balanceDelta != null && (
                        <span style={{
                          fontSize: 13, fontWeight: 700,
                          color: opt.consequences.balanceDelta >= 0 ? K.good : K.bad,
                          fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                        }}>
                          {opt.consequences.balanceDelta > 0 ? '+' : ''}
                          {opt.consequences.balanceDelta.toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          })()}

        </div>

        {/* ── RIGHT: KPIs + rep + loyalty ── */}
        <div style={{
          borderLeft: `1px solid ${K.line}`,
          padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
          overflowY: 'auto',
        }}>
          <div style={{ fontSize: 11, color: K.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ПОКАЗАТЕЛИ
          </div>

          {/* Reputation */}
          <div style={{ background: K.white, border: `1px solid ${K.line}`, borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: K.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Репутация</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: K.violet, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{reputation}</div>
            <div style={{ marginTop: 8, height: 4, background: K.lineSoft, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(reputation, 100)}%`, background: K.violet, borderRadius: 999 }} />
            </div>
          </div>

          {/* Loyalty */}
          <div style={{ background: K.white, border: `1px solid ${K.line}`, borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: K.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Лояльность</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: K.mint, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{loyalty}%</div>
            <div style={{ marginTop: 8, height: 4, background: K.lineSoft, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(loyalty, 100)}%`, background: K.mint, borderRadius: 999 }} />
            </div>
          </div>

        </div>
      </div>

      {/* ── Action bar ── */}
      <div style={{
        borderTop: `1px solid ${K.line}`, background: K.white,
        padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button
          onClick={() => setShowCampaignModal(true)}
          style={{
            padding: '9px 18px', borderRadius: 10, border: `1px solid ${K.line}`,
            background: K.bone, color: K.ink, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Реклама
        </button>
        <button
          onClick={() => setShowUpgradesModal(true)}
          style={{
            padding: '9px 18px', borderRadius: 10, border: `1px solid ${K.line}`,
            background: K.bone, color: K.ink, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Улучшения
        </button>

        <div style={{ flex: 1 }} />

        {dayBlockedMsg && (
          <div style={{
            fontSize: 12, fontWeight: 600, color: K.orange,
            background: K.orangeSoft, padding: '6px 14px', borderRadius: 8,
          }}>
            {dayBlockedMsg}
          </div>
        )}

        <button
          onClick={onNextDay}
          disabled={isDayBlocked}
          style={{
            padding: '10px 28px', borderRadius: 10, border: 'none',
            background: isDayBlocked ? K.lineSoft : K.ink,
            color: isDayBlocked ? K.muted : K.white,
            fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
            cursor: isDayBlocked ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {isDayBlocked ? 'Разрешите событие' : 'Следующий день →'}
        </button>
      </div>

      <CampaignModal isOpen={showCampaignModal} onClose={() => setShowCampaignModal(false)} />
      <UpgradesModal isOpen={showUpgradesModal} onClose={() => setShowUpgradesModal(false)} />
    </div>
  )
}

function DesktopMainScreen({ onRestart }: { onRestart?: () => void }) {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showUpgradesModal, setShowUpgradesModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showAchievementsModal, setShowAchievementsModal] = useState(false)
  const [showCashRegisterModal, setShowCashRegisterModal] = useState(false)
  const [showPromoWalletModal, setShowPromoWalletModal] = useState(false)
  const [showHireEmployeeModal, setShowHireEmployeeModal] = useState(false)
  const [showOwnerInvestmentsModal, setShowOwnerInvestmentsModal] = useState(false)
  const [dayBlockedMsg, setDayBlockedMsg] = useState<string | null>(null)
  const [savingsToast, setSavingsToast] = useState<number | null>(null)
  const [unlockToast, setUnlockToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unlockToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const visitedTabsRef = useRef<Set<NavId>>(new Set(['dashboard', 'ecosystem', 'finance', 'marketing']))

  const {
    currentWeek, services, pendingEvent, pendingEventsQueue,
    isGameOver, isVictory, savedBalance, promoCodesRevealed,
    addBalance, addReputation, addLoyalty, markEventAsResolved, activateService,
    addSavedBalance, setTemporaryModifiers, advanceDay,
    weekPhase, completeActionsPhase, completeResultsPhase, completeSummaryPhase,
    onboardingStage, onboardingStepIndex, onboardingCompleted,
    milestoneStatus, businessType, npcs,
    updateNPCRelationship: storeUpdateNPCRelationship,
    addChainFollowUp,
    addDecisionLogEntry,
  } = useGameStore()

  // Track which milestones the player has seen (opened the Вехи tab after they fired)
  const seenMilestonesRef = useRef({ week10: false, week20: false, week30: false })
  const achievedCount = [milestoneStatus?.week10, milestoneStatus?.week20, milestoneStatus?.week30].filter(Boolean).length
  const seenCount = [seenMilestonesRef.current.week10, seenMilestonesRef.current.week20, seenMilestonesRef.current.week30].filter(Boolean).length
  const milestoneBadge = achievedCount - seenCount

  const activeServiceIds = Object.values(services).filter(s => s.isActive).map(s => s.id)
  const activeCount = activeServiceIds.length
  const pendingEventCount = (pendingEvent ? 1 : 0) + (pendingEventsQueue?.length ?? 0)

  // Compute which nav item to highlight based on current onboarding step
  const highlightNav = (() => {
    if (onboardingCompleted) return undefined
    const stage = ONBOARDING_STAGES[onboardingStage as 0 | 1 | 2 | 3 | 4]
    if (!stage) return undefined
    const step = stage.steps[onboardingStepIndex ?? 0]
    if (!step?.requiresAction) return undefined
    return ONBOARDING_ACTION_TO_NAV[step.requiresAction]
  })()

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

    // NPC relationship update
    if (option.npcRelationshipDelta !== undefined && pendingEvent.npcId) {
      storeUpdateNPCRelationship(pendingEvent.npcId, option.npcRelationshipDelta)
    }

    // Chain follow-up scheduling
    if (option.chainFollowUpId) {
      const delay = CHAIN_FOLLOWUP_DELAY[option.chainFollowUpId] ?? 2
      addChainFollowUp(option.chainFollowUpId, currentWeek + delay)
    }

    // Log the decision
    const logImpact = (c.balanceDelta ?? 0) > 0 || (c.reputationDelta ?? 0) > 0 || (c.loyaltyDelta ?? 0) > 0
      ? 'positive'
      : (c.balanceDelta ?? 0) < 0 || (c.reputationDelta ?? 0) < 0 || (c.loyaltyDelta ?? 0) < 0
        ? 'negative'
        : 'neutral'
    addDecisionLogEntry({
      week: currentWeek,
      text: `${pendingEvent.title} → ${option.text}`,
      type: pendingEvent.npcId ? 'npc' : pendingEvent.isMoralDilemma ? 'choice' : 'choice',
      impact: logImpact as 'positive' | 'negative' | 'neutral',
      npcId: pendingEvent.npcId,
    })

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
    const result = completeActionsPhase()
    if (result.blocked) {
      setDayBlockedMsg(result.reason ?? 'Действие заблокировано')
      setTimeout(() => setDayBlockedMsg(null), 2500)
    }
  }

  const UNLOCK_TOAST_LABELS: Partial<Record<NavId, string>> = {
    warehouse:   'Раздел «Склад» разблокирован',
    operations:  'Раздел «Управление» разблокирован',
    reputation:  'Раздел «Репутация» разблокирован',
    milestones:  'Раздел «Вехи» разблокирован',
    statistics:  'Раздел «Статистика» разблокирован',
    campaigns:   'Раздел «Кампании ROI» разблокирован',
    journal:     'Раздел «Журнал» разблокирован',
  }

  const handleNavClick = (id: NavId) => {
    if (id === 'milestones' && milestoneStatus) {
      seenMilestonesRef.current = { ...milestoneStatus }
    }
    if (!visitedTabsRef.current.has(id) && UNLOCK_TOAST_LABELS[id]) {
      visitedTabsRef.current.add(id)
      if (unlockToastTimer.current) clearTimeout(unlockToastTimer.current)
      setUnlockToast(UNLOCK_TOAST_LABELS[id]!)
      unlockToastTimer.current = setTimeout(() => setUnlockToast(null), 3000)
    }
    setActiveView(id)
  }

  return (
    <div style={{
      width: '100%', height: '100vh',
      background: K.paper,
      fontFamily: 'Manrope, sans-serif',
      color: K.ink,
      display: 'flex',
      overflow: 'hidden',
      letterSpacing: '-0.01em',
    }}>
      <KLeftRail
        active={activeView}
        businessType={businessType}
        currentWeek={currentWeek}
        activeServiceCount={activeCount}
        savedBalance={savedBalance ?? 0}
        pendingEventCount={pendingEventCount}
        milestoneBadge={milestoneBadge > 0}
        promoCodesCount={promoCodesRevealed?.length ?? 0}
        highlightNav={highlightNav}
        onNav={handleNavClick}
        onHelp={() => setShowHelpModal(true)}
        onSettings={() => setShowSettingsModal(true)}
        onPromoWallet={() => setShowPromoWalletModal(true)}
        onAchievements={() => setShowAchievementsModal(true)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <KHeaderBar
          businessType={businessType}
          week={currentWeek}
          day={useGameStore.getState().dayOfWeek + 1}
          phase={weekPhase}
        />

        <OnboardingPanel onNavigate={setActiveView} />

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {activeView === 'dashboard' && (
        <DashboardView
          onNextDay={handleNextDay}
          dayBlockedMsg={dayBlockedMsg}
          showCampaignModal={showCampaignModal}
          setShowCampaignModal={setShowCampaignModal}
          showUpgradesModal={showUpgradesModal}
          setShowUpgradesModal={setShowUpgradesModal}
          showCashRegisterModal={showCashRegisterModal}
          setShowCashRegisterModal={setShowCashRegisterModal}
          handleEventOption={handleEventOption}
          onOpenOwnerInvestments={() => setShowOwnerInvestmentsModal(true)}
        />
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
          onShowUpgradesModal={() => setShowUpgradesModal(true)}
          onOpenOwnerInvestments={() => setShowOwnerInvestmentsModal(true)}
        />
      )}
      {activeView === 'statistics' && <StatisticsView />}
      {activeView === 'campaigns' && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <CampaignROIView />
        </div>
      )}
      {activeView === 'milestones' && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <MilestoneView />
        </div>
      )}
      {activeView === 'journal' && <DecisionLogView />}

        </div>{/* end content area */}
      </div>{/* end right column */}

      {/* Global modals */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} onRestart={onRestart} />
      <AchievementsModal isOpen={showAchievementsModal} onClose={() => setShowAchievementsModal(false)} />
      <CashRegisterModal isOpen={showCashRegisterModal} onClose={() => setShowCashRegisterModal(false)} />
      <HireEmployeeModal isOpen={showHireEmployeeModal} onClose={() => setShowHireEmployeeModal(false)} />
      <OwnerInvestmentsModal isOpen={showOwnerInvestmentsModal} onClose={() => setShowOwnerInvestmentsModal(false)} />
      <PromoCodeModal />
      <PromoWalletModal isOpen={showPromoWalletModal} onClose={() => setShowPromoWalletModal(false)} />
      <BundleModal />
      <MicroEventModal />
      <VictoryModal isOpen={isVictory} type="victory" />
      <VictoryModal isOpen={isGameOver && !isVictory} type="defeat" />

      {/* 4-phase weekly cycle overlays */}
      {weekPhase === 'summary' && !isGameOver && !isVictory && (
        <WeekSummaryOverlay onStart={completeSummaryPhase} />
      )}
      {weekPhase === 'results' && !isGameOver && !isVictory && (
        <WeekResultsOverlay onContinue={completeResultsPhase} />
      )}

      {/* Savings toast */}
      {savingsToast !== null && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 50, background: K.mint, color: K.white,
          padding: '16px 24px', borderRadius: 16, fontSize: 14, fontWeight: 700,
        }}>
          ✅ Спасено {savingsToast.toLocaleString('ru-RU')} ₽!
        </div>
      )}

      {/* Tab unlock toast */}
      {unlockToast !== null && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          zIndex: 50, background: K.violet, color: K.white,
          padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          🔓 {unlockToast}
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
