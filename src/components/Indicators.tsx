import { useGameStore } from '../stores/gameStore'
import { useMemo, useState } from 'react'
import { ECONOMY_CONSTANTS } from '../constants/business'
import { getBusinessStage, STAGE_CONFIG, getNextStage } from '../constants/businessStages'
import { getBusinessHealth } from '../services/businessHealth'
import { ENERGY_THRESHOLDS } from '../constants/gameBalance'
import { getWeeklyEnergyCost, getUpgradeEnergyBonus } from '../services/employeeManager'
import { getWeeklyTacticDef } from '../constants/weeklyTactics'
import { K } from './design-system/tokens'

function statusColor(value: number): string {
  if (value >= 70) return K.mint
  if (value >= 40) return K.orange
  return K.bad
}

function BreakdownRow({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      color: K.ink2,
    }}>
      <span>{label}</span>
      <span style={{ color: positive ? K.mint : K.bad, fontWeight: 700 }}>{value}</span>
    </div>
  )
}

interface IndicatorsProps {
  // Если передано — burnout-карточка становится кликабельной и зовёт
  // открыть «Инвестиции в себя» (отдых/премия), где можно потратить
  // деньги на восстановление энергии. Без пропа карточка просто
  // предупреждает текстом.
  onOpenOwnerInvestments?: () => void
}

export default function Indicators({ onOpenOwnerInvestments }: IndicatorsProps = {}) {
  const {
    stockBatches, capacity, lastDayResult, balance, entrepreneurEnergy,
    currentWeek, businessTier, burnoutWarningActive, weeklyTactic,
  } = useGameStore()
  const [energyExpanded, setEnergyExpanded] = useState(false)

  // Breakdown недельной энергетики — раскладка +/-, чтобы игрок понимал
  // откуда восстановление и куда уходит расход. Считается из тех же
  // функций, что и реальный движок (employeeManager + weeklyTactics),
  // чтобы цифры в подсказке совпадали с фактическим расчётом в processWeek.
  const energyBreakdown = useMemo(() => {
    const state = useGameStore.getState()
    const weeklyCost = getWeeklyEnergyCost(state)
    const upgradeBonus = getUpgradeEnergyBonus(state)
    const actualCost = Math.max(0, weeklyCost - upgradeBonus)
    const tactic = getWeeklyTacticDef(weeklyTactic)
    const tacticEnergy = Math.round((tactic?.energyDelta ?? 0) * 7)
    const restore = 30  // base restore per week; aligned with completeResultsPhase (Спринт 6: 42→30)
    const net = restore + tacticEnergy - actualCost
    const businessLabel = state.businessType === 'shop' ? 'магазин' : state.businessType === 'cafe' ? 'кафе' : 'салон'
    return { weeklyCost, upgradeBonus, actualCost, tacticEnergy, restore, net, tactic, businessLabel }
  }, [weeklyTactic, entrepreneurEnergy])
  const { addBalance, addLoyalty } = useGameStore()

  const stockLevel = useMemo(() => {
    if (!stockBatches.length || capacity === 0) return 0
    const totalQuantity = stockBatches.reduce((sum, batch) => sum + batch.quantity, 0)
    return Math.min(100, Math.round((totalQuantity / capacity) * 100))
  }, [stockBatches, capacity])

  const premiumCost = lastDayResult
    ? Math.floor(lastDayResult.revenue * ECONOMY_CONSTANTS.PREMIUM_COST_RATE)
    : 0

  const handlePremium = () => {
    if (premiumCost > 0 && balance >= premiumCost) {
      addBalance(-premiumCost)
      addLoyalty(ECONOMY_CONSTANTS.LOYALTY_BONUS_PREMIUM)
    }
  }

  const stockColorVal = statusColor(stockLevel)
  const energyColor = statusColor(entrepreneurEnergy)
  const stage = getBusinessStage(currentWeek, businessTier)
  const stageConfig = STAGE_CONFIG[stage]
  const nextStage = getNextStage(stage)
  const nextStageConfig = nextStage ? STAGE_CONFIG[nextStage] : null

  const health = getBusinessHealth(useGameStore.getState())
  const healthColor = health.tone === 'good' ? K.mint
    : health.tone === 'warn' ? K.orange
    : health.tone === 'bad' ? K.bad
    : K.ink2

  const servedPct = lastDayResult && lastDayResult.clients > 0
    ? Math.round((lastDayResult.served / lastDayResult.clients) * 100)
    : null

  // Прогрессивное раскрытие: на старте показываем только то, что игрок
  // успевает понять за первую сессию. Дополнительные карточки открываются
  // вместе с механиками, к которым относятся.
  //   W1-2: только Состояние и Энергия (2 карточки)
  //   W3+:  + Склад (после первых закупок)
  //   W5+:  + Стадия бизнеса
  const showStockCard = currentWeek >= 3
  const showStageCard = currentWeek >= 5

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Business health — single qualitative read replaces three numerical bars
          (reputation / loyalty / quality). Numbers still live in state and
          drive every mechanic, the player just feels them through this card
          and through events. */}
      <div style={{
        background: K.white, borderRadius: 16, padding: 16,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, letterSpacing: '0.05em' }}>
          СОСТОЯНИЕ
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: healthColor }}>
          {health.label}
        </div>
        <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.4 }}>
          {health.hint}
        </div>
        {premiumCost > 0 && (
          <button
            onClick={handlePremium}
            disabled={balance < premiumCost}
            style={{
              marginTop: 6, width: '100%', padding: '8px 12px', borderRadius: 10,
              fontSize: 11, fontWeight: 700, border: 'none',
              cursor: balance >= premiumCost ? 'pointer' : 'not-allowed',
              background: balance >= premiumCost ? K.orange : K.line,
              color: balance >= premiumCost ? K.ink : K.muted,
              transition: 'opacity 0.2s',
            }}
          >
            💰 Премия персоналу ({premiumCost.toLocaleString('ru-RU')} ₽)
          </button>
        )}
      </div>

      {/* Burnout warning — рисуется ТОЛЬКО когда на прошлой неделе энергия
          уже падала до нуля. Следующее обнуление = game over. Самое тихое
          плохое UX-ощущение игры было «умер от выгорания внезапно», эта
          карточка устраняет неожиданность. */}
      {burnoutWarningActive && (
        <div style={{
          background: K.bad, color: K.white, borderRadius: 16, padding: 14,
          display: 'flex', flexDirection: 'column', gap: 8,
          boxShadow: '0 0 0 2px rgba(220,38,38,0.18)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.02em' }}>
            🔥 ГРОЗИТ ВЫГОРАНИЕ
          </div>
          <div style={{ fontSize: 11, lineHeight: 1.5, opacity: 0.95 }}>
            Энергия падала до нуля. Если упадёт снова — игра закончится.
            Возьмите 🌿 спокойную неделю, наймите сотрудника или используйте отдых.
          </div>
          {onOpenOwnerInvestments && (
            <button
              type="button"
              onClick={onOpenOwnerInvestments}
              style={{
                background: K.white, color: K.bad,
                border: 'none', borderRadius: 8,
                padding: '8px 12px', marginTop: 2,
                fontFamily: 'inherit', fontSize: 11, fontWeight: 800,
                letterSpacing: '0.02em', cursor: 'pointer',
              }}
            >
              💪 Открыть «Инвестиции в себя»
            </button>
          )}
        </div>
      )}

      {/* Энергия владельца */}
      <div style={{
        background: K.white, borderRadius: 16, padding: 16,
        display: 'flex', flexDirection: 'column', gap: 8,
        // Пульсация при критическом уровне — привлекает внимание без
        // навязчивых модалок. Анимация определена в index.css.
        animation: entrepreneurEnergy < ENERGY_THRESHOLDS.CRITICAL ? 'pulse-critical 1.6s ease-in-out infinite' : undefined,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, letterSpacing: '0.05em' }}>⚡ ЭНЕРГИЯ</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: energyColor }} className="k-num">
            {entrepreneurEnergy}/100
          </div>
        </div>
        <div style={{
          height: 6, background: K.line, borderRadius: 999, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', background: energyColor, width: `${entrepreneurEnergy}%`,
            transition: 'width 0.3s ease',
          }}/>
        </div>
        <div style={{ fontSize: 10, opacity: 0.6, lineHeight: 1.3 }}>
          {entrepreneurEnergy > 70 ? '✅ Полна энергии' : entrepreneurEnergy > 40 ? '⚠️ Нужен отдых' : '🔴 Требуется восстановление'}
        </div>

        {/* Energy → revenue impact — игрок не догадывался, что усталость
            режет выручку. Теперь видно явно при критическом и просто
            утомлённом состоянии. Пороги синхронизированы с ENERGY_THRESHOLDS. */}
        {entrepreneurEnergy < ENERGY_THRESHOLDS.TIRED && (
          <div style={{
            fontSize: 10, fontWeight: 700,
            color: entrepreneurEnergy < ENERGY_THRESHOLDS.CRITICAL ? K.bad : K.orange,
            padding: '6px 8px', borderRadius: 8,
            background: K.bone,
            lineHeight: 1.3,
          }}>
            {entrepreneurEnergy < ENERGY_THRESHOLDS.CRITICAL
              ? '⚠️ Усталость режет выручку на 20%'
              : '⚠️ Усталость режет выручку на 10%'}
          </div>
        )}

        {/* Breakdown недельной динамики — раскладка «откуда +, куда -».
            Игроки не понимали почему энергия восстанавливается на разные
            суммы; теперь видно вклад каждой механики (база, сотрудники,
            апгрейды, тактика недели). */}
        <button
          type="button"
          onClick={() => setEnergyExpanded(v => !v)}
          style={{
            background: 'transparent', border: 'none',
            fontSize: 10, fontWeight: 700, color: K.muted,
            cursor: 'pointer', padding: '4px 0',
            textAlign: 'left', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          {energyExpanded ? '▾' : '▸'} Откуда и куда уходит
        </button>
        {energyExpanded && (
          <div style={{
            fontSize: 10, lineHeight: 1.5,
            background: K.bone, borderRadius: 8, padding: '8px 10px',
            display: 'flex', flexDirection: 'column', gap: 2,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <BreakdownRow label="Базовое восстановление" value={`+${energyBreakdown.restore}`} positive />
            {energyBreakdown.tacticEnergy !== 0 && (
              <BreakdownRow
                label={`Тактика «${energyBreakdown.tactic?.title ?? ''}»`}
                value={`${energyBreakdown.tacticEnergy > 0 ? '+' : ''}${energyBreakdown.tacticEnergy}`}
                positive={energyBreakdown.tacticEnergy > 0}
              />
            )}
            <BreakdownRow
              label={`Работа в ${energyBreakdown.businessLabel}е`}
              value={`-${energyBreakdown.weeklyCost}`}
              positive={false}
            />
            {energyBreakdown.upgradeBonus > 0 && (
              <BreakdownRow
                label="Бонус от апгрейдов"
                value={`+${energyBreakdown.upgradeBonus}`}
                positive
              />
            )}
            <div style={{
              borderTop: `1px solid ${K.lineSoft}`, marginTop: 2, paddingTop: 4,
              display: 'flex', justifyContent: 'space-between',
              fontWeight: 800,
              color: energyBreakdown.net >= 0 ? K.mint : K.bad,
            }}>
              <span>Итого / неделю</span>
              <span>{energyBreakdown.net > 0 ? '+' : ''}{energyBreakdown.net}</span>
            </div>
          </div>
        )}
      </div>

      {/* Склад — открывается на 3-й неделе (после первых закупок) */}
      {showStockCard && (
        <div style={{
          background: K.white, borderRadius: 16, padding: 16,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, letterSpacing: '0.05em' }}>📦 СКЛАД</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: stockColorVal }} className="k-num">
              {stockLevel}%
            </div>
          </div>
          <div style={{
            height: 6, background: K.line, borderRadius: 999, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', background: stockColorVal, width: `${stockLevel}%`,
              transition: 'width 0.3s ease',
            }}/>
          </div>
        </div>
      )}

      {/* Стадия бизнеса — открывается на 5-й неделе */}
      {showStageCard && (
        <div style={{
          background: K.white, borderRadius: 16, padding: 16,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, letterSpacing: '0.05em' }}>🏢 СТАДИЯ</div>
          <div style={{ fontSize: 14, fontWeight: 800 }}>{stageConfig.label}</div>
          <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.3 }}>{stageConfig.description}</div>
          {nextStageConfig && (
            <div style={{ fontSize: 10, opacity: 0.55, marginTop: 2 }}>
              Далее: {nextStageConfig.label}
            </div>
          )}
        </div>
      )}

      {/* Обслуженность */}
      {lastDayResult && lastDayResult.clients > 0 && (
        <div style={{
          background: K.white, borderRadius: 16, padding: 16,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, letterSpacing: '0.05em' }}>👥 ОБСЛУЖЕННОСТЬ</div>
            {lastDayResult.missed > 0 && (
              <div style={{ fontSize: 11, fontWeight: 700, color: K.bad }}>
                −{lastDayResult.missed} ушли
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 4, height: 6, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              flex: `${servedPct || 0} 0 0`,
              background: K.mint,
              transition: 'flex 0.3s ease',
            }} title={`Обслужено: ${lastDayResult.served}`}/>
            {lastDayResult.missed > 0 && (
              <div style={{
                flex: `${100 - (servedPct ?? 100)} 0 0`,
                background: K.bad,
                transition: 'flex 0.3s ease',
              }} title={`Ушли: ${lastDayResult.missed}`}/>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.6 }}>
            <span>✅ {lastDayResult.served}</span>
            <span>{lastDayResult.clients} всего</span>
          </div>
        </div>
      )}
    </div>
  )
}
