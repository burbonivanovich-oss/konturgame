import { useState } from 'react'
import KPIPanel from './KPIPanel'
import Indicators from './Indicators'
import NextDayButton from './NextDayButton'
import ServicePanel from './ServicePanel'
import PurchaseModal from './modals/PurchaseModal'
import EventModal from './modals/EventModal'
import CampaignModal from './modals/CampaignModal'
import UpgradesModal from './modals/UpgradesModal'
import HelpModal from './modals/HelpModal'
import SettingsModal from './modals/SettingsModal'
import AchievementsModal from './modals/AchievementsModal'
import VictoryModal from './modals/VictoryModal'
import { useGameStore } from '../stores/gameStore'

export default function MobileMainScreen() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showUpgradesModal, setShowUpgradesModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showAchievementsModal, setShowAchievementsModal] = useState(false)
  const [activeTab, setActiveTab] = useState('day')

  const { pendingEvent, pendingEventsQueue, isGameOver, isVictory, businessType, achievements } = useGameStore()
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
      height: '100%', background: 'var(--k-surface)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingBottom: 12, borderBottom: '1px solid var(--k-ink-10)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 800 }}>Бизнес с Контуром</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setShowAchievementsModal(true)}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--k-ink-10)', border: 'none', cursor: 'pointer',
              fontSize: 14,
            }}
          >
            🏆
            {achievements.length > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: 'var(--k-orange)', color: 'white',
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
              background: 'var(--k-ink-10)', border: 'none', cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ?
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--k-ink-10)', border: 'none', cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{
        display: 'flex', gap: 4, overflow: 'x', borderBottom: '1px solid var(--k-ink-10)',
        marginBottom: 8,
      }}>
        {[
          { id: 'day', label: '◎ День' },
          { id: 'stats', label: '⭐ Индикаторы' },
          { id: 'services', label: '🔌 Сервисы' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              border: 'none', background: activeTab === tab.id ? 'var(--k-ink)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--k-ink)',
              cursor: 'pointer', transition: 'all 0.2s',
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{
                background: 'var(--k-orange)', color: 'var(--k-ink)',
                borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.7 }}>ДОХОД</div>
                <div style={{ fontSize: 18, fontWeight: 800 }} className="k-num">24860</div>
                <div style={{ fontSize: 9, opacity: 0.7 }}>+18%</div>
              </div>

              <div style={{
                background: 'var(--k-green)', color: 'var(--k-ink)',
                borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.7 }}>ЧИСТАЯ</div>
                <div style={{ fontSize: 18, fontWeight: 800 }} className="k-num">+14220</div>
                <div style={{ fontSize: 9, opacity: 0.7 }}>₽</div>
              </div>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
            }}>
              <button
                onClick={() => setShowCampaignModal(true)}
                style={{
                  padding: 12, borderRadius: 10, border: 'none',
                  background: 'var(--k-purple)', color: 'white',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                📢 Реклама
              </button>
              <button
                onClick={() => setShowUpgradesModal(true)}
                style={{
                  padding: 12, borderRadius: 10, border: 'none',
                  background: 'var(--k-blue)', color: 'white',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                🔧 Улучш.
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
            <ServicePanel />
          </>
        )}
      </div>

      {/* Toast */}
      {savingsToast !== null && (
        <div style={{
          position: 'fixed', bottom: 88, left: 16, right: 16,
          background: 'var(--k-blue)', color: 'white',
          padding: '12px 16px', borderRadius: 10,
          fontSize: 12, fontWeight: 700, textAlign: 'center',
          animation: 'slideUp 0.3s ease',
        }}>
          💙 Контур сэкономил {savingsToast.toLocaleString('ru-RU')} ₽!
        </div>
      )}

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
    </div>
  )
}
