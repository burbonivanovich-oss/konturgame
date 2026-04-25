import { useState, useRef } from 'react'
import { CHAIN_FOLLOWUP_DELAY, getChainEvent } from '../constants/eventChains'
import { getNPCDefinition } from '../constants/npcs'
import ResponsiveLayout from './ResponsiveLayout'
import MobileMainScreen from './MobileMainScreen'
import { OnboardingPanel } from './OnboardingPanel'
import HelpModal from './modals/HelpModal'
import SettingsModal from './modals/SettingsModal'
import VictoryModal from './modals/VictoryModal'
import AchievementsModal from './modals/AchievementsModal'
import NPCRosterModal from './modals/NPCRosterModal'
import CashRegisterModal from './modals/CashRegisterModal'
import AssortmentModal from './modals/AssortmentModal'
import PromoCodeModal from './modals/PromoCodeModal'
import PromoWalletModal from './modals/PromoWalletModal'
import BundleModal from './modals/BundleModal'
import HireEmployeeModal from './modals/HireEmployeeModal'
import OwnerInvestmentsModal from './modals/OwnerInvestmentsModal'
import { WeekSummaryOverlay } from './WeekSummaryOverlay'
import { WeekResultsOverlay } from './WeekResultsOverlay'
import { DesktopKontur } from './design-system/DesktopKontur'
import { WarehouseView } from './views/WarehouseView'
import { FinanceView } from './views/FinanceView'
import OperationsView from './views/OperationsView'
import StatisticsView from './views/StatisticsView'
import { DecisionLogView } from './views/DecisionLogView'
import { DevelopmentView } from './views/DevelopmentView'
import { useGameStore } from '../stores/gameStore'
import { ONBOARDING_STAGES } from '../constants/onboarding'
import { BUSINESS_CONFIGS } from '../constants/business'
import { getBusinessStage, STAGE_CONFIG, getNextStage } from '../constants/businessStages'
import type { BusinessType } from '../types/game'
import { KLeftRail } from './design-system/KLeftRail'
import { KHeaderBar } from './design-system/KHeaderBar'
import { K } from './design-system/tokens'
import type { NavId } from './design-system/KLeftRail'
import { getActiveSynergies } from '../services/synergyEngine'
import { getTotalThroughput } from '../services/cashRegisterEngine'
import type { ServiceType } from '../types/game'

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
  showCashRegisterModal, setShowCashRegisterModal,
  handleEventOption, onOpenOwnerInvestments,
}: {
  onNextDay: () => void
  dayBlockedMsg: string | null
  showCashRegisterModal: boolean
  setShowCashRegisterModal: (v: boolean) => void
  handleEventOption: (id: string) => void
  onOpenOwnerInvestments: () => void
}) {
  const store = useGameStore()
  const {
    currentWeek, balance, reputation, loyalty, services,
    pendingEvent, pendingEventsQueue, lastDayResult,
    entrepreneurEnergy, npcs, stockBatches, capacity, cashRegisters,
    businessType, qualityLevel, level,
  } = store

  const bizConfig = BUSINESS_CONFIGS[businessType]
  const activeServiceIds = Object.values(services).filter(s => s.isActive).map(s => s.id)
  const dailyRevenue = lastDayResult?.revenue ?? 0
  const dailyExpenses = lastDayResult?.expenses ?? 0
  const dailyProfit = lastDayResult?.netProfit ?? 0
  const dailyClients = lastDayResult?.clients ?? 0
  const isDayBlocked = !!pendingEvent

  const totalStock = (stockBatches ?? []).reduce((s: number, b: { quantity: number }) => s + b.quantity, 0)
  const stockPct = capacity > 0 ? Math.round((totalStock / capacity) * 100) : 0
  const stockLow = bizConfig.hasStock && stockPct < 25

  // Day metrics for top KPI strip and viz
  const servedToday = lastDayResult?.served ?? 0
  const missedToday = lastDayResult?.missed ?? 0
  const clientsToday = lastDayResult?.clients ?? 0
  const throughput = cashRegisters && cashRegisters.length > 0
    ? getTotalThroughput(cashRegisters, store)
    : bizConfig.capacity

  // Active synergies (for right panel)
  const synergies = getActiveSynergies(store)

  // Stock batches with expiry info
  const currentDayAbs = currentWeek * 7
  const batchesWithInfo = (stockBatches ?? []).map(b => {
    const age = Math.max(0, currentDayAbs - b.dayReceived)
    const daysLeft = Math.max(0, b.expirationDays - age)
    const pct = b.expirationDays > 0 ? Math.min(100, (age / b.expirationDays) * 100) : 0
    return { ...b, age, daysLeft, pct }
  }).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 3)

  // Service → accent color (cycling through 4 accents)
  const SERVICE_ACCENT: Record<ServiceType, string> = {
    market:  K.orange,
    bank:    K.blue,
    ofd:     K.violet,
    diadoc:  K.mint,
    fokus:   K.orange,
    elba:    K.mint,
    extern:  K.violet,
  }
  const SERVICE_SHORT: Record<ServiceType, string> = {
    market: 'Маркет', bank: 'Банк', ofd: 'ОФД',
    diadoc: 'Диадок', fokus: 'Фокус', elba: 'Эльба', extern: 'Экстерн',
  }
  const serviceOrder: ServiceType[] = ['market', 'bank', 'ofd', 'extern', 'diadoc', 'fokus', 'elba']

  // Business stage (from main)
  const stage = getBusinessStage(currentWeek, level)
  const stageCfg = STAGE_CONFIG[stage]
  const nextStage = getNextStage(stage)
  const nextCfg = nextStage ? STAGE_CONFIG[nextStage] : null

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: K.paper }}>

      {/* Two-column body: center content + right panel */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: 0, overflow: 'hidden',
      }}>

        {/* ── CENTER: KPI strip + event + widgets ── */}
        <div style={{
          padding: '20px 20px 20px 24px',
          display: 'flex', flexDirection: 'column', gap: 14,
          overflowY: 'auto',
        }}>
          {/* Top KPI strip — hero balance card + 3 supporting metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 10 }}>
            {/* Hero balance card — visually dominant */}
            <div style={{
              background: `linear-gradient(135deg, ${K.orange} 0%, #FFB020 100%)`,
              borderRadius: 14, padding: '16px 18px',
              display: 'flex', flexDirection: 'column', gap: 4,
              boxShadow: '0 4px 14px rgba(255,106,44,0.25)',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Баланс
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: K.white, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
                {balance.toLocaleString('ru-RU')} ₽
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
                Неделя {currentWeek}
                {dailyProfit !== 0 && (
                  <> · <span style={{ fontWeight: 700 }}>
                    {dailyProfit > 0 ? '+' : ''}{dailyProfit.toLocaleString('ru-RU')} ₽/день
                  </span></>
                )}
              </div>
            </div>

            {[
              { label: 'Прибыль / день', value: `${dailyProfit > 0 ? '+' : ''}${dailyProfit.toLocaleString('ru-RU')} ₽`, bg: dailyProfit >= 0 ? K.mint : '#c0392b', sub: 'после налогов' },
              { label: 'Расходы / день', value: `${dailyExpenses.toLocaleString('ru-RU')} ₽`, bg: K.violet, sub: lastDayResult ? 'за вчера' : 'нет данных' },
              { label: 'Клиенты', value: lastDayResult ? `${servedToday} / ${clientsToday}` : '—', bg: K.blue, sub: missedToday > 0 ? `${missedToday} ушли` : 'все обслужены' },
            ].map(t => (
              <div key={t.label} style={{
                background: t.bg, borderRadius: 14, padding: '14px 16px',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                  {t.label}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: K.white, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {t.value}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{t.sub}</div>
              </div>
            ))}
          </div>

          {/* Daily tasks checklist */}
          <div style={{ background: K.white, border: `1px solid ${K.line}`, borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 11, color: K.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Задачи дня
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { label: 'Разрешить событие', done: !pendingEvent, urgent: !!pendingEvent },
                { label: 'Нажать «Следующий день»', done: false, urgent: false },
              ].map(task => (
                <div key={task.label} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', borderRadius: 999,
                  background: task.urgent ? K.orangeSoft : K.bone,
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: 999, flexShrink: 0,
                    border: `2px solid ${task.done ? K.mint : task.urgent ? K.orange : K.line}`,
                    background: task.done ? K.mint : 'transparent',
                    display: 'grid', placeItems: 'center',
                  }}>
                    {task.done && (
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke={K.white} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 500,
                    color: task.urgent ? K.orange : task.done ? K.muted : K.ink,
                    textDecoration: task.done ? 'line-through' : 'none',
                  }}>
                    {task.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending event card */}
          {pendingEvent && (() => {
            const npcDef = pendingEvent.npcId ? getNPCDefinition(pendingEvent.npcId) : null
            const npc = pendingEvent.npcId ? (npcs ?? []).find(n => n.id === pendingEvent.npcId) : null
            const isMoral = pendingEvent.isMoralDilemma === true
            const deadlineWeeksLeft = pendingEvent.decisionDeadlineWeek
              ? Math.max(0, pendingEvent.decisionDeadlineWeek - currentWeek)
              : null
            const totalEvents = 1 + (pendingEventsQueue?.length ?? 0)

            return (
              <div style={{
                background: K.ink, borderRadius: 16, padding: 20,
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    background: isMoral ? K.orange : K.orange,
                    color: K.white,
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                    padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase',
                  }}>
                    {isMoral ? 'Дилемма' : 'Событие · Требует решения'}
                  </span>
                  <span style={{
                    background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)',
                    fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                  }}>
                    Блокирует «Следующий день»
                  </span>
                  {deadlineWeeksLeft !== null && (
                    <span style={{
                      background: 'rgba(255,106,44,0.25)', color: K.orange,
                      fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                    }}>
                      {deadlineWeeksLeft === 0 ? 'Решить сейчас' : `${deadlineWeeksLeft} нед.`}
                    </span>
                  )}
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}>
                    1 / {totalEvents}
                  </span>
                </div>

                {npcDef && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.07)',
                  }}>
                    <span style={{ fontSize: 22 }}>{npcDef.portrait}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: K.white }}>{npcDef.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{npcDef.shortRole}</div>
                    </div>
                    {npc && npc.isRevealed && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: npc.relationshipLevel >= 60 ? K.mint : 'rgba(255,255,255,0.4)' }}>
                        {npc.relationshipLevel >= 80 ? 'Союзник' :
                         npc.relationshipLevel >= 60 ? 'Доверяет' :
                         npc.relationshipLevel >= 40 ? 'Нейтрально' : 'Напряжённо'}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ fontSize: 20, fontWeight: 700, color: K.white, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  {pendingEvent.title}
                </div>

                {pendingEvent.description && (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                    {pendingEvent.description}
                  </div>
                )}

                {/* Options — horizontal row */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {pendingEvent.options.map((opt: any) => {
                    const isRisk = !opt.isContourOption &&
                      opt.consequences?.balanceDelta != null &&
                      opt.consequences.balanceDelta < -5000
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleEventOption(opt.id)}
                        style={{
                          flex: 1,
                          background: opt.isContourOption ? K.mint : 'rgba(255,255,255,0.07)',
                          border: opt.isContourOption
                            ? `1.5px solid ${K.mint}`
                            : '1.5px solid rgba(255,255,255,0.12)',
                          borderRadius: 12, padding: '14px 12px',
                          cursor: 'pointer', fontFamily: 'inherit',
                          display: 'flex', flexDirection: 'column', gap: 6,
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: 12, fontWeight: 700, lineHeight: 1.3,
                            color: opt.isContourOption ? K.white : 'rgba(255,255,255,0.85)',
                            flex: 1,
                          }}>
                            {opt.text}
                          </span>
                          {opt.isContourOption && (
                            <span style={{
                              fontSize: 9, padding: '2px 7px', borderRadius: 999, flexShrink: 0,
                              background: 'rgba(255,255,255,0.22)', color: K.white,
                              fontWeight: 700, letterSpacing: '0.08em',
                            }}>
                              КОНТУР
                            </span>
                          )}
                          {isRisk && (
                            <span style={{
                              fontSize: 9, padding: '2px 7px', borderRadius: 999, flexShrink: 0,
                              background: 'rgba(255,90,90,0.2)', color: '#FF8080',
                              fontWeight: 700, letterSpacing: '0.06em',
                            }}>
                              РИСК
                            </span>
                          )}
                        </div>
                        {opt.consequences?.balanceDelta != null && (
                          <div style={{
                            fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em',
                            fontVariantNumeric: 'tabular-nums',
                            color: opt.isContourOption
                              ? K.white
                              : opt.consequences.balanceDelta >= 0 ? K.mint : '#FF8080',
                          }}>
                            {opt.consequences.balanceDelta > 0 ? '+' : ''}
                            {opt.consequences.balanceDelta.toLocaleString('ru-RU')} ₽
                          </div>
                        )}
                        {opt.consequences?.reputationDelta != null && opt.consequences.reputationDelta !== 0 && (
                          <div style={{
                            fontSize: 11, fontWeight: 600,
                            color: opt.isContourOption ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)',
                          }}>
                            репутация {opt.consequences.reputationDelta > 0 ? '+' : ''}{opt.consequences.reputationDelta}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* ── Widget row: Queue + Stock ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: bizConfig.hasStock ? '1fr 1fr' : '1fr',
            gap: 12,
          }}>
            {/* QUEUE: served/missed dot grid */}
            <div style={{
              background: K.white, border: `1px solid ${K.line}`,
              borderRadius: 14, padding: 16,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 10, color: K.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Пропускная · очередь
                </div>
                {missedToday > 0 && (
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 999,
                    background: K.orangeSoft, color: K.orange, fontWeight: 700,
                  }}>
                    {missedToday} ушли
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                <span style={{ color: K.ink }}>{servedToday}</span>
                <span style={{ color: K.muted, fontWeight: 600 }}> / {clientsToday || '—'}</span>
              </div>
              {/* Dot grid */}
              {clientsToday > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(clientsToday, 20)}, 1fr)`,
                  gap: 3,
                }}>
                  {Array.from({ length: Math.min(clientsToday, 60) }).map((_, i) => {
                    const isServed = i < Math.min(servedToday, 60)
                    return (
                      <div key={i} style={{
                        aspectRatio: '1',
                        borderRadius: 3,
                        background: isServed ? K.mint : K.orange,
                      }} />
                    )
                  })}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: K.muted }}>
                  День ещё не завершён
                </div>
              )}
              {/* Market hint if no market and missing clients */}
              {!services.market?.isActive && missedToday > 0 && (
                <div style={{
                  marginTop: 4, padding: '8px 10px', borderRadius: 8,
                  background: K.orangeSoft,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{
                    fontSize: 9, padding: '2px 7px', borderRadius: 999,
                    background: K.orange, color: K.white, fontWeight: 700, letterSpacing: '0.06em',
                  }}>
                    МАРКЕТ
                  </span>
                  <span style={{ fontSize: 11, color: K.ink, fontWeight: 500 }}>
                    +20% пропускной — очередь исчезает
                  </span>
                </div>
              )}
              <div style={{ fontSize: 10, color: K.muted }}>
                касса: {throughput} чел/день
              </div>
            </div>

            {/* STOCK: batches with expiry */}
            {bizConfig.hasStock && (
              <div style={{
                background: K.white, border: `1px solid ${K.line}`,
                borderRadius: 14, padding: 16,
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 10, color: K.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Склад · партии
                  </div>
                  {stockLow && (
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 999,
                      background: K.orangeSoft, color: K.orange, fontWeight: 700,
                    }}>
                      мало
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em',
                  fontVariantNumeric: 'tabular-nums', color: K.ink,
                }}>
                  {totalStock} ед
                  <span style={{ fontSize: 12, color: K.muted, fontWeight: 600, marginLeft: 8 }}>
                    · {stockPct}%
                  </span>
                </div>
                {/* Batches */}
                {batchesWithInfo.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {batchesWithInfo.map(b => {
                      const color = b.daysLeft <= 1 ? K.orange : b.daysLeft <= 3 ? K.violet : K.blue
                      return (
                        <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ fontSize: 10, color: K.muted, width: 42, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                            {b.daysLeft} {b.daysLeft === 1 ? 'дн' : 'дн'}
                          </div>
                          <div style={{ flex: 1, height: 14, background: K.bone, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.max(10, 100 - b.pct)}%`,
                              background: color, borderRadius: 4,
                              display: 'flex', alignItems: 'center', paddingLeft: 6,
                            }}>
                              <span style={{ fontSize: 10, color: K.white, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                                {b.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: K.muted }}>
                    Склад пуст
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT panel: status + ecosystem + synergies + CTA ── */}
        <div style={{
          borderLeft: `1px solid ${K.line}`, background: K.white,
          padding: 18, display: 'flex', flexDirection: 'column', gap: 14,
          overflowY: 'auto',
        }}>
          {/* Status pills row */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { label: 'Реп', value: reputation, color: K.violet, bg: K.violetSoft },
              { label: 'Лоял', value: `${loyalty}%`, color: K.mint, bg: K.mintSoft },
              {
                label: 'Энергия',
                value: `${entrepreneurEnergy}`,
                color: entrepreneurEnergy < 40 ? K.orange : K.blue,
                bg: entrepreneurEnergy < 40 ? K.orangeSoft : K.blueSoft,
                onClick: onOpenOwnerInvestments,
              },
            ].map(p => (
              <button
                key={p.label}
                onClick={p.onClick}
                disabled={!p.onClick}
                style={{
                  background: p.bg, border: 'none', borderRadius: 999,
                  padding: '5px 10px', fontSize: 11, fontWeight: 700,
                  color: p.color, cursor: p.onClick ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <span style={{ opacity: 0.7, fontWeight: 500 }}>{p.label}</span>
                <span>{p.value}</span>
              </button>
            ))}
          </div>

          {/* Quality + Stage compact row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(() => {
              const qualColor = qualityLevel > 70 ? K.mint : qualityLevel > 40 ? K.orange : '#c0392b'
              return (
                <div style={{ background: K.bone, borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: K.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Качество
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: qualColor }}>{qualityLevel}%</span>
                  </div>
                  <div style={{ height: 5, background: K.lineSoft, borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${qualityLevel}%`, background: qualColor, borderRadius: 999 }} />
                  </div>
                </div>
              )
            })()}
            <div style={{ background: K.bone, borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: K.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                Стадия
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: K.ink }}>{stageCfg.label}</div>
              {nextCfg && (
                <div style={{ fontSize: 10, color: K.muted, marginTop: 2 }}>
                  далее: {nextCfg.label}
                </div>
              )}
            </div>
          </div>

          {/* Ecosystem */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
            }}>
              <div style={{ fontSize: 10, color: K.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Экосистема
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: K.ink }}>
                Контур · {Object.values(services).filter(s => s.isActive).length}/7
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {serviceOrder.map(sid => {
                const svc = services[sid]
                const isActive = svc?.isActive
                const accent = SERVICE_ACCENT[sid]
                return (
                  <div key={sid} style={{
                    padding: '10px 10px',
                    borderRadius: 10,
                    background: isActive ? accent : K.bone,
                    color: isActive ? K.white : K.muted,
                    fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    opacity: isActive ? 1 : 0.75,
                  }}>
                    <span>{SERVICE_SHORT[sid]}</span>
                    <span style={{
                      width: 6, height: 6, borderRadius: 999,
                      background: isActive ? K.white : K.line,
                    }} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active synergies */}
          {synergies.length > 0 && (
            <div style={{
              background: K.mintSoft, borderRadius: 12, padding: 12,
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ fontSize: 10, color: K.mint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Активные синергии · {synergies.length}
              </div>
              {synergies.slice(0, 3).map(s => (
                <div key={s.id} style={{ fontSize: 11, fontWeight: 600, color: K.ink, lineHeight: 1.35 }}>
                  {s.name}
                </div>
              ))}
              {synergies.length > 3 && (
                <div style={{ fontSize: 11, color: K.muted }}>+ ещё {synergies.length - 3}</div>
              )}
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Primary CTA */}
          <button
            onClick={onNextDay}
            disabled={isDayBlocked}
            style={{
              padding: '16px 20px', borderRadius: 14, border: 'none',
              background: isDayBlocked ? K.lineSoft : K.orange,
              color: isDayBlocked ? K.muted : K.white,
              fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em',
              cursor: isDayBlocked ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <span>{isDayBlocked ? 'Разрешите событие' : 'Следующий день'}</span>
            <span style={{ fontSize: 18 }}>→</span>
          </button>
          {dayBlockedMsg && (
            <div style={{
              fontSize: 11, fontWeight: 600, color: K.orange,
              background: K.orangeSoft, padding: '6px 10px', borderRadius: 8,
              textAlign: 'center',
            }}>
              {dayBlockedMsg}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

function DesktopMainScreen({ onRestart }: { onRestart?: () => void }) {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showAchievementsModal, setShowAchievementsModal] = useState(false)
  const [showNpcRosterModal, setShowNpcRosterModal] = useState(false)
  const [showCashRegisterModal, setShowCashRegisterModal] = useState(false)
  const [showPromoWalletModal, setShowPromoWalletModal] = useState(false)
  const [showHireEmployeeModal, setShowHireEmployeeModal] = useState(false)
  const [showOwnerInvestmentsModal, setShowOwnerInvestmentsModal] = useState(false)
  const [dayBlockedMsg, setDayBlockedMsg] = useState<string | null>(null)
  const [savingsToast, setSavingsToast] = useState<{ savings: number; vsOption: string } | null>(null)
  const [unlockToast, setUnlockToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unlockToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const visitedTabsRef = useRef<Set<NavId>>(new Set(['dashboard', 'ecosystem', 'finance', 'development']))

  const {
    currentWeek, balance, services, pendingEvent, pendingEventsQueue,
    isGameOver, isVictory, savedBalance, promoCodesRevealed,
    addBalance, addReputation, addLoyalty, markEventAsResolved, activateService,
    addSavedBalance, setTemporaryModifiers, advanceDay,
    weekPhase, completeActionsPhase, completeResultsPhase, completeSummaryPhase,
    onboardingStage, onboardingStepIndex, onboardingCompleted,
    businessType, npcs, personalGoal,
    updateNPCRelationship: storeUpdateNPCRelationship,
    addChainFollowUp,
    addDecisionLogEntry,
  } = useGameStore()

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
        const bestAlternative = nonKontour.reduce((best, o) =>
          (o.consequences.balanceDelta ?? 0) > (best.consequences.balanceDelta ?? 0) ? o : best
        )
        const savings = c.balanceDelta - (bestAlternative.consequences.balanceDelta ?? 0)
        if (savings > 0) {
          addSavedBalance(savings)
          if (toastTimer.current) clearTimeout(toastTimer.current)
          setSavingsToast({ savings, vsOption: bestAlternative.text })
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
    development: 'Раздел «Развитие» разблокирован',
    statistics:  'Раздел «Статистика» разблокирован',
    journal:     'Раздел «Журнал» разблокирован',
  }

  const handleNavClick = (id: NavId) => {
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
        balance={balance}
        personalGoal={personalGoal}
        pendingEventCount={pendingEventCount}
        promoCodesCount={promoCodesRevealed?.length ?? 0}
        revealedNpcCount={(npcs ?? []).filter(n => n.isRevealed).length}
        highlightNav={highlightNav}
        onNav={handleNavClick}
        onHelp={() => setShowHelpModal(true)}
        onSettings={() => setShowSettingsModal(true)}
        onPromoWallet={() => setShowPromoWalletModal(true)}
        onAchievements={() => setShowAchievementsModal(true)}
        onNpcRoster={() => setShowNpcRosterModal(true)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <KHeaderBar
          businessType={businessType}
          week={currentWeek}
          day={useGameStore.getState().dayOfWeek + 1}
          phase={weekPhase}
        />

        <OnboardingPanel
          onNavigate={setActiveView}
          onAction={(action) => {
            if (action === 'buy_register') setShowCashRegisterModal(true)
          }}
        />

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {activeView === 'dashboard' && (
        <DashboardView
          onNextDay={handleNextDay}
          dayBlockedMsg={dayBlockedMsg}
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
      {activeView === 'finance' && <FinanceView />}
      {activeView === 'operations' && (
        <OperationsView
          onShowHireModal={() => setShowHireEmployeeModal(true)}
        />
      )}
      {activeView === 'development' && <DevelopmentView />}
      {activeView === 'statistics' && <StatisticsView />}
      {activeView === 'journal' && <DecisionLogView />}

        </div>{/* end content area */}
      </div>{/* end right column */}

      {/* Global modals */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} onRestart={onRestart} />
      <AchievementsModal isOpen={showAchievementsModal} onClose={() => setShowAchievementsModal(false)} />
      <NPCRosterModal isOpen={showNpcRosterModal} onClose={() => setShowNpcRosterModal(false)} />
      <CashRegisterModal isOpen={showCashRegisterModal} onClose={() => setShowCashRegisterModal(false)} />
      <HireEmployeeModal isOpen={showHireEmployeeModal} onClose={() => setShowHireEmployeeModal(false)} />
      <OwnerInvestmentsModal isOpen={showOwnerInvestmentsModal} onClose={() => setShowOwnerInvestmentsModal(false)} />
      <PromoCodeModal />
      <PromoWalletModal isOpen={showPromoWalletModal} onClose={() => setShowPromoWalletModal(false)} />
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

      {/* Savings toast */}
      {savingsToast !== null && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 50, background: K.mint, color: K.white,
          padding: '16px 24px', borderRadius: 16, fontSize: 14, fontWeight: 700,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <span>✅ Контур сэкономил {savingsToast.savings.toLocaleString('ru-RU')} ₽</span>
          <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>
            vs «{savingsToast.vsOption}»
          </span>
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
