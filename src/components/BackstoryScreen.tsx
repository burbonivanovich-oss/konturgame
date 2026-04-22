import { useState } from 'react'
import type { BackstoryMotivation, BackstoryPersonal, PlayerBackstory } from '../types/game'

interface BackstoryScreenProps {
  onComplete: (backstory: PlayerBackstory) => void
}

const MOTIVATIONS: Array<{
  id: BackstoryMotivation
  icon: string
  title: string
  description: string
  hint: string
}> = [
  {
    id: 'corp',
    icon: '🏢',
    title: 'Надоела корпорация',
    description: 'Восемь лет опенспейс, KPI и совещания по совещаниям. В пятницу написали заявление. В понедельник — первый рабочий день на себя.',
    hint: '+10 репутации на старте — люди уважают решительность',
  },
  {
    id: 'contest',
    icon: '🏆',
    title: 'Выиграл грант',
    description: 'Подали заявку на конкурс малого бизнеса — почти в шутку. Пришло письмо: «Поздравляем». 80 000 ₽ и ни одного повода не попробовать.',
    hint: 'Старт с полным капиталом и хорошим настроением',
  },
  {
    id: 'accident',
    icon: '🎲',
    title: 'Так получилось',
    description: 'Один разговор с другом, одна аренда помещения, одна случайная идея. Иногда лучшие решения — это те, которые не планировались.',
    hint: '+15 энергии на старте — энтузиазм новичка',
  },
]

const PERSONAL_SITUATIONS: Array<{
  id: BackstoryPersonal
  icon: string
  title: string
  description: string
}> = [
  {
    id: 'free',
    icon: '🧭',
    title: 'Полная свобода',
    description: 'Никаких обязательств. Можно работать в 2 ночи или уйти в 3 дня. Всё только на ваш вкус.',
  },
  {
    id: 'friend',
    icon: '🤝',
    title: 'Лучший друг — болельщик №1',
    description: 'Димка верит в вас больше, чем вы сами. Звонит каждую неделю, спрашивает как дела. Иногда заходит помочь.',
  },
  {
    id: 'hometown',
    icon: '🏘️',
    title: 'Возвращение в свой район',
    description: 'Выросли здесь. Знаете половину жителей. Они знают вас. Хочется сделать что-то настоящее для своего места.',
  },
]

export default function BackstoryScreen({ onComplete }: BackstoryScreenProps) {
  const [motivation, setMotivation] = useState<BackstoryMotivation | null>(null)
  const [personal, setPersonal] = useState<BackstoryPersonal | null>(null)

  const canProceed = motivation !== null && personal !== null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--k-bg, #f5f5f0)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'var(--k-font, system-ui)',
    }}>
      <div style={{ maxWidth: 680, width: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: 'var(--k-orange, #ff6b00)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.08em',
            padding: '5px 14px',
            borderRadius: 999,
            marginBottom: 16,
          }}>
            ПРЕЖДЕ ЧЕМ НАЧАТЬ
          </div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            margin: '0 0 10px',
            color: 'var(--k-ink, #0e1116)',
            lineHeight: 1.1,
          }}>
            С чего всё началось?
          </h1>
          <p style={{
            fontSize: 15,
            fontWeight: 500,
            opacity: 0.55,
            margin: 0,
            lineHeight: 1.5,
          }}>
            Ваша история повлияет на то, что будет происходить в игре.<br />
            Выберите — и начнём.
          </p>
        </div>

        {/* Step 1: Motivation */}
        <section style={{ marginBottom: 36 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.06em',
            opacity: 0.4,
            marginBottom: 14,
          }}>
            КАК ВЫ ЗДЕСЬ ОКАЗАЛИСЬ?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MOTIVATIONS.map(m => (
              <div
                key={m.id}
                onClick={() => setMotivation(m.id)}
                style={{
                  padding: '16px 20px',
                  borderRadius: 16,
                  border: `2px solid ${motivation === m.id ? 'var(--k-orange, #ff6b00)' : 'rgba(14,17,22,0.08)'}`,
                  background: motivation === m.id ? 'rgba(255,107,0,0.04)' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: 28, flexShrink: 0 }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.6, lineHeight: 1.4, marginBottom: 6 }}>
                    {m.description}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--k-orange, #ff6b00)', opacity: 0.9 }}>
                    {m.hint}
                  </div>
                </div>
                {motivation === m.id && (
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--k-orange, #ff6b00)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: 12, color: '#fff', fontWeight: 800,
                  }}>✓</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Step 2: Personal situation */}
        <section style={{ marginBottom: 36 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.06em',
            opacity: 0.4,
            marginBottom: 14,
          }}>
            КТО РЯДОМ?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {PERSONAL_SITUATIONS.map(p => (
              <div
                key={p.id}
                onClick={() => setPersonal(p.id)}
                style={{
                  padding: '16px 14px',
                  borderRadius: 16,
                  border: `2px solid ${personal === p.id ? 'var(--k-orange, #ff6b00)' : 'rgba(14,17,22,0.08)'}`,
                  background: personal === p.id ? 'rgba(255,107,0,0.04)' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{p.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{p.title}</div>
                <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.55, lineHeight: 1.4 }}>
                  {p.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <button
          onClick={() => canProceed && onComplete({ motivation: motivation!, personal: personal! })}
          disabled={!canProceed}
          style={{
            width: '100%',
            padding: '18px 32px',
            borderRadius: 16,
            border: 'none',
            background: canProceed ? 'var(--k-orange, #ff6b00)' : 'rgba(14,17,22,0.08)',
            color: canProceed ? '#fff' : 'rgba(14,17,22,0.3)',
            fontSize: 16,
            fontWeight: 800,
            cursor: canProceed ? 'pointer' : 'default',
            transition: 'all 0.15s',
            letterSpacing: '-0.01em',
          }}
        >
          {canProceed ? 'Выбрать тип бизнеса →' : 'Выберите историю и ситуацию'}
        </button>
      </div>
    </div>
  )
}
