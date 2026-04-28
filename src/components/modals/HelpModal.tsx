import Modal from './Modal'
import { K } from '../design-system/tokens'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const sections = [
    {
      title: '📆 Год — это финал',
      color: K.blue,
      content: 'У вас 52 недели. Что успеете сделать за год — то и будет историей. Игра заканчивается на 52-й неделе одной из четырёх концовок.',
    },
    {
      title: '💰 Деньги и энергия',
      color: K.orange,
      content: 'Это два видимых ресурса. Деньги — баланс. Энергия — ваша усталость, тратится каждую неделю. Пополняется отдыхом и инвестициями в себя.',
    },
    {
      title: '🌡️ Состояние бизнеса',
      color: K.mint,
      content: 'Качественная оценка вашего бизнеса (Уверенно / Стабильно / Шатко / Тревожно). Складывается из репутации, лояльности и качества — всё это работает в фоне, влияет на поток клиентов, цены и события.',
    },
    {
      title: '👥 Окружение',
      color: K.violet,
      content: 'Шесть человек: поставщик, продавец, конкурент, инспектор, постоянная клиентка, дядя со схемами. У каждого своя дуга — события появляются естественно, по ходу года.',
    },
    {
      title: '🎁 Сервисы Контура',
      color: K.blue,
      content: 'Появляются через ситуации — налоговая, штраф, проблема с поставщиком. Подключил один раз — работает до конца года, без месячных решений.',
    },
    {
      title: '🎯 События',
      color: K.orange,
      content: 'Случайные ситуации с выбором. В тексте опций видны только деньги — остальное игрок чувствует через «Состояние», NPC и финал.',
    },
    {
      title: '⚠️ Конец раньше времени',
      color: K.bad,
      content: 'Год может кончиться досрочно: банкротство (3 недели в минусе), выгорание (2 недели на нуле энергии), репутация ушла в ноль.',
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
