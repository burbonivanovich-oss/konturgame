import Modal from './Modal'
import { K } from '../design-system/tokens'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const sections = [
    {
      title: '📊 Основы игры',
      color: K.blue,
      content: 'Управляйте своим бизнесом, прокрутите дни и зарабатывайте деньги. Цель: достичь баланса в 1 000 000 ₽.',
    },
    {
      title: '💰 Экономика',
      color: K.orange,
      content: 'Доход зависит от клиентов и их покупок. Расходы включают закупку товара, зарплату и подписки. Налоги: 6% от выручки.',
    },
    {
      title: '📦 Склад (FIFO)',
      color: K.mint,
      content: 'Товары стареют на складе. Если товар просрочен, он списывается автоматически и наносит убыток.',
    },
    {
      title: '⭐ Репутация и Лояльность',
      color: K.violet,
      content: 'Репутация влияет на привлечение клиентов. Лояльность влияет на их удержание.',
    },
    {
      title: '🎁 Сервисы Контура',
      color: K.blue,
      content: 'Подключайте сервисы для получения бонусов. Синергия между сервисами дает дополнительные эффекты.',
    },
    {
      title: '🎯 События',
      color: K.orange,
      content: 'Случайные события появляются в течение игры. Выбирайте варианты осторожно, особенно предложения с Контуром.',
    },
    {
      title: '⚠️ Условия поражения',
      color: K.bad,
      content: 'Игра заканчивается, если баланс падает ниже нуля или репутация критична.',
    },
  ]

  return (
    <Modal isOpen={isOpen} title="ℹ️ Справка" onClose={onClose} size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
        {sections.map((section, i) => (
          <div key={i} style={{
            background: K.bone, borderRadius: 12, padding: 12,
            borderLeft: `4px solid ${section.color}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: section.color, marginBottom: 6 }}>
              {section.title}
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.8, margin: 0 }}>
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </Modal>
  )
}
