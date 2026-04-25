import { useState, useMemo } from 'react'
import type { BackstoryMotivation, BackstoryPersonal, PlayerBackstory } from '../types/game'
import { K } from './design-system/tokens'
import { loadMetaProgress } from '../services/metaProgress'
import { getMetaLesson, META_LESSONS } from '../constants/metaLessons'

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
    icon: '🏚️',
    title: 'Родители ждут ремонта',
    description: 'Живут в другом городе, в старой хрущёвке. Батарея гремит, трубы текут. «Нам тут нормально». Решили: сделать ремонт, пока ещё можно.',
  },
  {
    id: 'friend',
    icon: '🤝',
    title: 'Подруга начинает заново',
    description: 'Катя — подруга с детского сада. После развода осталась одна с дочкой. Нашла нормальную квартиру, но депозит три месяца — не потянуть. Попросила помочь.',
  },
  {
    id: 'hometown',
    icon: '🌳',
    title: 'Сквер хотят снести',
    description: 'Двор, в котором прошло детство, собираются застроить паркингом. Соседи создали инициативную группу — вы вошли первым и пообещали помочь с деньгами на юристов.',
  },
]

export default function BackstoryScreen({ onComplete }: BackstoryScreenProps) {
  const [motivation, setMotivation] = useState<BackstoryMotivation | null>(null)
  const [personal, setPersonal] = useState<BackstoryPersonal | null>(null)

  // Read once on mount — meta progress doesn't change while picking backstory
  const meta = useMemo(() => loadMetaProgress(), [])
  const unlockedLessons = meta.unlockedLessons
    .map(id => getMetaLesson(id))
    .filter((l): l is NonNullable<typeof l> => !!l)
  const hasLessons = unlockedLessons.length > 0

  const canProceed = motivation !== null && personal !== null

  return (
    <div style={{
      minHeight: '100vh',
      background: K.paper,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'Manrope, sans-serif',
    }}>
      <div style={{ maxWidth: 680, width: '100%' }}>

        {/* Lessons from past runs */}
        {hasLessons && (
          <div style={{
            background: K.bone,
            border: `1px solid ${K.lineSoft}`,
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>📚</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: K.ink, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Уроки прошлых попыток ({unlockedLessons.length}/{META_LESSONS.length})
              </span>
              <span style={{ fontSize: 11, color: K.muted, marginLeft: 'auto' }}>
                Прогонов: {meta.totalRuns} · Лучшая неделя: {meta.bestWeek}
              </span>
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 6,
              // Cap height so a long list doesn't push the backstory pickers
              // off-screen on small devices. Scrolls inside the card.
              maxHeight: 220, overflowY: 'auto',
            }}>
              {unlockedLessons.map(l => (
                <div key={l.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  fontSize: 12, lineHeight: 1.4,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{l.icon}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, color: K.ink }}>{l.name}.</span>{' '}
                    <span style={{ color: K.ink2 }}>{l.bonusText}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: K.orange,
            color: K.white,
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
            color: K.ink,
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
                  border: `2px solid ${motivation === m.id ? K.orange : K.line}`,
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
                  <div style={{ fontSize: 11, fontWeight: 700, color: K.orange, opacity: 0.9 }}>
                    {m.hint}
                  </div>
                </div>
                {motivation === m.id && (
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: K.orange,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: 12, color: K.white, fontWeight: 800,
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
                  border: `2px solid ${personal === p.id ? K.orange : K.line}`,
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
            background: canProceed ? K.ink : K.line,
            color: canProceed ? K.white : K.muted,
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
