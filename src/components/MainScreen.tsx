import { useState, useEffect } from 'react'
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
import VictoryModal from './modals/VictoryModal'
import AchievementsModal from './modals/AchievementsModal'
import { useGameStore } from '../stores/gameStore'
import { BUSINESS_CONFIGS } from '../constants/business'

export default function MainScreen() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showUpgradesModal, setShowUpgradesModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showAchievementsModal, setShowAchievementsModal] = useState(false)

  const { pendingEvent, isGameOver, isVictory, businessType, achievements } = useGameStore()
  const config = BUSINESS_CONFIGS[businessType]

  useEffect(() => {
    if (pendingEvent) {
      setShowEventModal(true)
    }
  }, [pendingEvent])

  const handleEventOption = (optionId: string) => {
    const state = useGameStore.getState()
    const { pendingEvent, markEventAsResolved, setTemporaryModifiers, activateService } = state

    if (!pendingEvent) return
    const option = pendingEvent.options.find((o) => o.id === optionId)
    if (!option) return

    const c = option.consequences
    const { addBalance, addReputation, addLoyalty } = useGameStore.getState()

    if (c.balanceDelta) addBalance(c.balanceDelta)
    if (c.reputationDelta) addReputation(c.reputationDelta)
    if (c.loyaltyDelta) addLoyalty(c.loyaltyDelta)

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

    markEventAsResolved(pendingEvent.id)
    setShowEventModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-md mx-auto lg:max-w-2xl">
        <KPIPanel />

        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <Indicators />
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {config.hasStock && (
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition"
                >
                  📦 Закупка
                </button>
              )}
              <button
                onClick={() => setShowCampaignModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition"
              >
                📢 Реклама
              </button>
              <button
                onClick={() => setShowUpgradesModal(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-semibold transition"
              >
                🔧 Улучшения
              </button>
            </div>
            <div className="mt-8 flex justify-center">
              <NextDayButton />
            </div>
          </div>

          <ServicePanel />
        </div>

        <div className="mt-8 flex flex-wrap justify-between items-center gap-2 text-sm text-gray-400">
          <button
            onClick={() => setShowHelpModal(true)}
            className="hover:text-white transition"
          >
            ℹ️ Справка
          </button>
          <button
            onClick={() => setShowAchievementsModal(true)}
            className="hover:text-white transition relative"
          >
            🏆 Достижения
            {achievements.length > 0 && (
              <span className="ml-1 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded-full font-bold">
                {achievements.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="hover:text-white transition"
          >
            ⚙️ Настройки
          </button>
        </div>
      </div>

      <PurchaseModal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} />
      <EventModal
        isOpen={showEventModal}
        event={pendingEvent}
        onOptionSelect={handleEventOption}
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
    </div>
  )
}
