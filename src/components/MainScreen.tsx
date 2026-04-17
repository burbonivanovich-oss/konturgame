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
import { useGameStore } from '../stores/gameStore'

export default function MainScreen() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showUpgradesModal, setShowUpgradesModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const { pendingEvent, isGameOver, isVictory } = useGameStore()

  useEffect(() => {
    if (pendingEvent) {
      setShowEventModal(true)
    }
  }, [pendingEvent])

  const handleEventOption = (optionId: string) => {
    const { pendingEvent, markEventAsResolved } = useGameStore.getState()
    if (pendingEvent) {
      const option = pendingEvent.options.find(o => o.id === optionId)
      if (option) {
        const { addBalance, addReputation, addLoyalty } = useGameStore.getState()

        if (option.consequences.balanceDelta) {
          addBalance(option.consequences.balanceDelta)
        }
        if (option.consequences.reputationDelta) {
          addReputation(option.consequences.reputationDelta)
        }
        if (option.consequences.loyaltyDelta) {
          addLoyalty(option.consequences.loyaltyDelta)
        }

        markEventAsResolved(pendingEvent.id)
        setShowEventModal(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-md mx-auto lg:max-w-2xl">
        <KPIPanel />

        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <Indicators />
            <div className="mt-8 flex justify-center">
              <NextDayButton />
            </div>
          </div>

          <ServicePanel />
        </div>

        <div className="mt-12 flex justify-between items-center text-sm text-gray-400">
          <button
            onClick={() => setShowHelpModal(true)}
            className="hover:text-white transition"
          >
            ℹ️ Справка
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="hover:text-white transition"
          >
            ⚙️ Настройки
          </button>
          <button
            onClick={() => setShowUpgradesModal(true)}
            className="hover:text-white transition"
          >
            🔧 Улучшения
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
      <VictoryModal isOpen={isVictory} type="victory" />
      <VictoryModal isOpen={isGameOver && !isVictory} type="defeat" />
    </div>
  )
}
