import { useState } from 'react'
import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { K } from '../design-system/tokens'

interface CampaignModalProps {
  isOpen: boolean
  onClose: () => void
}

const CAMPAIGNS = [
  {
    id: 'social-media',
    name: '📱 Социальные сети',
    description: 'Реклама в соцсетях (эффект через 2-3 недели)',
    cost: 50000,
    clientBonus: 0.15,
    duration: 21,
    delay: 2,
  },
  {
    id: 'local-ads',
    name: '📰 Местная реклама',
    description: 'Объявления в местных изданиях (эффект через 2-3 недели)',
    cost: 150000,
    clientBonus: 0.35,
    duration: 28,
    delay: 2,
  },
  {
    id: 'influencer',
    name: '⭐ Инфлюэнсер',
    description: 'Сотрудничество с инфлюэнсером (эффект через 2-3 недели)',
    cost: 400000,
    clientBonus: 0.75,
    duration: 35,
    delay: 3,
  },
]

export default function CampaignModal({ isOpen, onClose }: CampaignModalProps) {
  const { balance, addAdCampaign, setBalance, currentWeek } = useGameStore()
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)

  const handleStartCampaign = (campaign: typeof CAMPAIGNS[0]) => {
    if (balance >= campaign.cost) {
      addAdCampaign({
        id: `campaign_${Date.now()}`,
        name: campaign.name,
        duration: campaign.duration,
        cost: campaign.cost,
        clientEffect: campaign.clientBonus,
        checkEffect: 0,
        daysRemaining: campaign.duration,
        startWeek: currentWeek + campaign.delay,
      })
      setBalance(balance - campaign.cost)
      setSelectedCampaign(null)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} title="📢 Рекламные кампании" onClose={onClose} size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          background: K.orangeSoft,
          border: `1px solid ${K.orange}`,
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 12,
          color: K.orange,
          fontWeight: 600,
        }}>
          ⚠️ Эффект от рекламы приходит через 2-3 недели после запуска
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CAMPAIGNS.map((campaign) => {
            const canAfford = balance >= campaign.cost
            const isSelected = selectedCampaign === campaign.id

            return (
              <div
                key={campaign.id}
                onClick={() => setSelectedCampaign(campaign.id)}
                style={{
                  border: isSelected ? `2px solid ${K.mint}` : `1px solid ${K.line}`,
                  background: isSelected ? K.mintSoft : K.bone,
                  cursor: 'pointer',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{campaign.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: canAfford ? K.ink : K.bad }}>
                    {campaign.cost.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <p style={{ fontSize: 12, color: K.muted, marginBottom: 10, margin: '0 0 10px 0' }}>
                  {campaign.description}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: K.muted }}>
                  <p style={{ margin: 0 }}>👥 +{(campaign.clientBonus * 100).toFixed(0)}% клиентов (когда активна)</p>
                  <p style={{ margin: 0 }}>📅 {campaign.duration} дней активности</p>
                  <p style={{ margin: 0 }}>⏰ Эффект начнется на неделе {currentWeek + campaign.delay}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: K.bone,
              color: K.ink,
              border: `1px solid ${K.line}`,
              borderRadius: 10,
              padding: '8px 0',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
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
              style={{
                flex: 1,
                background: (!balance || balance < (CAMPAIGNS.find(c => c.id === selectedCampaign)?.cost || 0))
                  ? K.bone : K.ink,
                color: (!balance || balance < (CAMPAIGNS.find(c => c.id === selectedCampaign)?.cost || 0))
                  ? K.muted : K.white,
                border: 'none',
                borderRadius: 10,
                padding: '8px 0',
                fontWeight: 600,
                cursor: (!balance || balance < (CAMPAIGNS.find(c => c.id === selectedCampaign)?.cost || 0))
                  ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Запустить
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
