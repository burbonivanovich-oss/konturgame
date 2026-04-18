import { useState } from 'react'
import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'

interface CampaignModalProps {
  isOpen: boolean
  onClose: () => void
}

const CAMPAIGNS = [
  {
    id: 'social-media',
    name: '📱 Социальные сети',
    description: 'Дешевая реклама с низким охватом',
    cost: 5000,
    clientBonus: 0.15,
    duration: 5,
  },
  {
    id: 'local-ads',
    name: '📰 Местная реклама',
    description: 'Средняя реклама для среднего бюджета',
    cost: 15000,
    clientBonus: 0.35,
    duration: 10,
  },
  {
    id: 'influencer',
    name: '⭐ Инфлюэнсер',
    description: 'Дорогая, но эффективная реклама',
    cost: 40000,
    clientBonus: 0.75,
    duration: 15,
  },
]

export default function CampaignModal({ isOpen, onClose }: CampaignModalProps) {
  const { balance, addAdCampaign, setBalance } = useGameStore()
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)

  const handleStartCampaign = (campaign: typeof CAMPAIGNS[0]) => {
    if (balance >= campaign.cost) {
      addAdCampaign({
        id: campaign.id,
        name: campaign.name,
        duration: campaign.duration,
        cost: campaign.cost,
        clientEffect: campaign.clientBonus,
        checkEffect: 0,
        daysRemaining: campaign.duration,
      })
      setBalance(balance - campaign.cost)
      setSelectedCampaign(null)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} title="📢 Рекламные кампании" onClose={onClose} size="lg">
      <div className="space-y-4">
        <div className="space-y-3">
          {CAMPAIGNS.map((campaign) => {
            const canAfford = balance >= campaign.cost

            return (
              <div
                key={campaign.id}
                onClick={() => setSelectedCampaign(campaign.id)}
                className={`p-4 rounded-md border-2 transition cursor-pointer ${
                  selectedCampaign === campaign.id
                    ? 'border-brand-green bg-green-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-800">{campaign.name}</span>
                  <span className={`text-sm font-bold ${
                    canAfford ? 'text-gray-600' : 'text-red-600'
                  }`}>
                    {campaign.cost.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                <div className="text-xs space-y-1 text-gray-700">
                  <p>👥 +{(campaign.clientBonus * 100).toFixed(0)}% клиентов</p>
                  <p>📅 {campaign.duration} дней</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-md transition font-semibold text-gray-700"
          >
            Отмена
          </button>
          {selectedCampaign && (
            <button
              onClick={() => {
                const campaign = CAMPAIGNS.find(c => c.id === selectedCampaign)
                if (campaign && balance >= campaign.cost) {
                  handleStartCampaign(campaign)
                }
              }}
              disabled={!balance || balance < (CAMPAIGNS.find(c => c.id === selectedCampaign)?.cost || 0)}
              className="flex-1 bg-brand-purple hover:opacity-90 disabled:bg-gray-300 py-2 rounded-md transition font-semibold text-white disabled:text-gray-500"
            >
              Запустить
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
