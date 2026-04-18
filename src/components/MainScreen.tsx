import { useState, useEffect, useRef } from 'react'
import ResponsiveLayout from './ResponsiveLayout'
import MobileMainScreen from './MobileMainScreen'
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

function DesktopMainScreen() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showUpgradesModal, setShowUpgradesModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showAchievementsModal, setShowAchievementsModal] = useState(false)

  const { pendingEvent, pendingEventsQueue, isGameOver, isVictory, businessType, achievements } = useGameStore()
  const [savingsToast, setSavingsToast] = useState<number | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const config = BUSINESS_CONFIGS[businessType]

  useEffect(() => {
    if (pendingEvent) {
      setShowEventModal(true)
    }
  }, [pendingEvent])

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

    // Считаем спасённые рубли при выборе Контур-опции
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

  return (
    <div className="min-h-screen bg-kontour-light p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Бизнес с Контуром</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAchievementsModal(true)}
              className="px-3 py-2 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-200 transition relative"
            >
              🏆
              {achievements.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {achievements.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowHelpModal(true)}
              className="px-3 py-2 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-200 transition"
            >
              ?
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-3 py-2 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-200 transition"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left/Center Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* KPI Panel */}
            <KPIPanel />

            {/* Indicators */}
            <Indicators />

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {config.hasStock && (
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="px-4 py-3 bg-brand-blue text-white rounded-md font-semibold text-sm hover:opacity-90 transition"
                >
                  📦 Закупка
                </button>
              )}
              <button
                onClick={() => setShowCampaignModal(true)}
                className="px-4 py-3 bg-brand-purple text-white rounded-md font-semibold text-sm hover:opacity-90 transition"
              >
                📢 Реклама
              </button>
              <button
                onClick={() => setShowUpgradesModal(true)}
                className="px-4 py-3 bg-brand-orange text-white rounded-md font-semibold text-sm hover:opacity-90 transition"
              >
                🔧 Улучшения
              </button>
            </div>

            {/* Next Day Button */}
            <div className="pt-4">
              <NextDayButton />
            </div>
          </div>

          {/* Right Sidebar - Services */}
          <ServicePanel />
        </div>

        {/* Savings Toast */}
        {savingsToast !== null && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-brand-blue text-white px-6 py-3 rounded-lg shadow-lg text-sm font-semibold whitespace-nowrap">
            💙 Контур сэкономил {savingsToast.toLocaleString('ru-RU')} ₽!
          </div>
        )}
      </div>

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
