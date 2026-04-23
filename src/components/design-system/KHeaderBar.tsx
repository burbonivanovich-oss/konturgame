import { K } from './tokens'
import { Row } from './primitives'
import type { WeekPhase, BusinessType } from '../../types/game'

interface PhaseConfig {
  label: string
  text: string
  tone: string
  soft: string
}

const PHASES: Record<WeekPhase, PhaseConfig> = {
  summary: { label: 'СВОДКА',   text: 'Итоги прошлой недели',  tone: K.blue,   soft: K.blueSoft   },
  actions: { label: 'ДЕЙСТВИЯ', text: 'Управляйте бизнесом',   tone: K.violet, soft: K.violetSoft },
  events:  { label: 'СОБЫТИЯ',  text: 'Требуется решение',     tone: K.violet, soft: K.violetSoft },
  results: { label: 'ИТОГИ',    text: 'Неделя завершается',    tone: K.mint,   soft: K.mintSoft   },
}

const BIZ_LABEL: Record<BusinessType, string> = {
  shop:           'Магазин',
  cafe:           'Кафе',
  'beauty-salon': 'Салон красоты',
}

function getSeason(week: number): string {
  const month = Math.ceil((week / 52) * 12)
  if (month <= 2 || month === 12) return 'Зима'
  if (month <= 5) return 'Весна'
  if (month <= 8) return 'Лето'
  return 'Осень'
}

interface KHeaderBarProps {
  businessType: BusinessType
  week: number
  day: number
  phase: WeekPhase
}

export function KHeaderBar({ businessType, week, day, phase }: KHeaderBarProps) {
  const p = PHASES[phase]
  const season = getSeason(week)

  return (
    <div style={{
      height: 60, borderBottom: `1px solid ${K.line}`,
      background: K.white,
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16, flexShrink: 0,
    }}>
      <div style={{ fontSize: 14 }}>
        <span style={{ fontWeight: 700 }}>{BIZ_LABEL[businessType]}</span>
        <span style={{ color: K.muted }}> · Неделя {week} · День {day} из 7 · {season}</span>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '7px 14px', borderRadius: 999, background: p.soft,
      }}>
        <div style={{ width: 7, height: 7, borderRadius: 999, background: p.tone, flexShrink: 0 }} />
        <span style={{
          fontSize: 11, color: p.tone,
          textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
        }}>
          {p.label}
        </span>
        <span style={{ fontSize: 12, color: K.ink2 }}>— {p.text}</span>
      </div>
    </div>
  )
}
