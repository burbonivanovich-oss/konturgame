import { K } from './tokens'
import { KIcon } from './KIcon'
import { Row, Col, Card } from './primitives'
import type { BusinessType } from '../../types/game'

type NavId = 'dashboard' | 'ecosystem' | 'finance' | 'marketing' | 'operations' |
             'warehouse' | 'reputation' | 'milestones' | 'statistics' | 'campaigns' | 'journal'

interface NavItem {
  id: NavId
  label: string
  icon: string
  unlocksAtWeek?: number  // hidden until this week
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',   label: 'Дневной цикл', icon: 'dashboard'               },
  { id: 'ecosystem',   label: 'Экосистема',   icon: 'eco'                     },
  { id: 'finance',     label: 'Финансы',      icon: 'finance'                 },
  { id: 'marketing',   label: 'Маркетинг',    icon: 'mkt'                     },
  { id: 'warehouse',   label: 'Склад',        icon: 'warehouse', unlocksAtWeek: 2  },
  { id: 'operations',  label: 'Управление',   icon: 'ops',       unlocksAtWeek: 2  },
  { id: 'reputation',  label: 'Репутация',    icon: 'rep',       unlocksAtWeek: 4  },
  { id: 'milestones',  label: 'Вехи',         icon: 'milestone', unlocksAtWeek: 7  },
  { id: 'statistics',  label: 'Статистика',   icon: 'stats',     unlocksAtWeek: 7  },
  { id: 'campaigns',   label: 'Кампании ROI', icon: 'roi',       unlocksAtWeek: 10 },
  { id: 'journal',     label: 'Журнал',       icon: 'log',       unlocksAtWeek: 10 },
]

const BIZ_ICON: Record<BusinessType, string> = {
  shop:           'shop',
  cafe:           'cafe',
  'beauty-salon': 'salon',
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

interface KLeftRailProps {
  active: NavId
  businessType: BusinessType
  currentWeek: number
  activeServiceCount: number
  savedBalance: number
  pendingEventCount: number
  milestoneBadge?: boolean
  promoCodesCount: number
  highlightNav?: NavId
  onNav: (id: NavId) => void
  onHelp: () => void
  onSettings: () => void
  onPromoWallet: () => void
  onAchievements: () => void
}

export function KLeftRail({
  active, businessType, currentWeek, activeServiceCount,
  savedBalance, pendingEventCount, milestoneBadge,
  promoCodesCount, highlightNav, onNav, onHelp, onSettings,
  onPromoWallet, onAchievements,
}: KLeftRailProps) {
  const season = getSeason(currentWeek)

  return (
    <aside style={{
      width: 240, flex: '0 0 240px',
      background: K.white, borderRight: `1px solid ${K.line}`,
      padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 14, height: '100%',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <Row gap={10} style={{ padding: '2px 6px 0' }}>
        <svg width={26} height={26} viewBox="0 0 32 32" style={{ display: 'block', flexShrink: 0 }}>
          <circle cx="16" cy="16" r="15" fill="none" stroke={K.ink} strokeWidth="1.6"/>
          <path d="M22 10 L12 16 L22 22" fill="none" stroke={K.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div>
          <div style={{ fontSize: 11, color: K.muted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Бизнес</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: -2 }}>с Контуром</div>
        </div>
      </Row>

      {/* Business status card */}
      <Card pad={12} radius={12} bg={K.bone} border={K.lineSoft}>
        <Row gap={8}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: K.white, border: `1px solid ${K.line}`,
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <KIcon name={BIZ_ICON[businessType]} size={16} color={K.ink2} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{BIZ_LABEL[businessType]}</div>
            <div style={{ fontSize: 11, color: K.muted }}>Неделя {currentWeek} · {season}</div>
          </div>
        </Row>
      </Card>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.filter(item => !item.unlocksAtWeek || currentWeek >= item.unlocksAtWeek).map(item => {
          const isActive = item.id === active
          const badge =
            item.id === 'dashboard' && pendingEventCount > 0 ? String(pendingEventCount) :
            item.id === 'ecosystem' ? `${activeServiceCount}/7` :
            item.id === 'milestones' && milestoneBadge ? 'NEW' :
            undefined

          const isPulsing = item.id === highlightNav && !isActive
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={isPulsing ? 'nav-pulse' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 9,
                background: isActive ? K.ink : 'transparent',
                color: isActive ? K.white : K.ink,
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                border: 'none', fontFamily: 'inherit', width: '100%', textAlign: 'left',
                outline: isPulsing ? `2px solid ${K.orange}` : 'none',
              }}
            >
              <KIcon name={item.icon} size={16} color={isActive ? K.white : K.ink2} />
              <div style={{ flex: 1 }}>{item.label}</div>
              {badge && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 7px', borderRadius: 999,
                  background: badge === 'NEW'
                    ? K.violet
                    : isActive ? 'rgba(255,255,255,0.15)' : K.bone,
                  color: badge === 'NEW'
                    ? K.white
                    : isActive ? K.white : K.muted,
                  letterSpacing: '0.04em',
                }}>
                  {badge}
                </span>
              )}
            </button>
          )
        })}

        {/* Achievements — opens modal, no view */}
        <button
          onClick={onAchievements}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 9,
            background: 'transparent', color: K.ink,
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            border: 'none', fontFamily: 'inherit', width: '100%', textAlign: 'left',
          }}
        >
          <KIcon name="rep" size={16} color={K.muted} />
          <div style={{ flex: 1 }}>Достижения</div>
        </button>
      </nav>

      <div style={{ flex: 1 }} />

      {/* Cumulative savings */}
      <Card pad={12} radius={12} bg={K.mint} border={K.mint} style={{ color: K.white }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Спасено с Контуром
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
          {savedBalance.toLocaleString('ru-RU')} ₽
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
          за {currentWeek} {currentWeek === 1 ? 'неделю' : currentWeek < 5 ? 'недели' : 'недель'}
        </div>
      </Card>

      {/* Promo wallet */}
      <button
        onClick={onPromoWallet}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10,
          background: K.mintSoft, color: K.mintInk,
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          border: 'none', fontFamily: 'inherit', width: '100%', position: 'relative',
        }}
      >
        <KIcon name="gift" size={16} color={K.mintInk} />
        <div style={{ flex: 1, textAlign: 'left' }}>Промокоды</div>
        {promoCodesCount > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700,
            padding: '2px 6px', borderRadius: 6,
            background: K.mint, color: K.white,
          }}>
            {Math.min(promoCodesCount, 9)}
          </span>
        )}
      </button>

      {/* Help + Settings */}
      <Row gap={6} style={{ borderTop: `1px solid ${K.lineSoft}`, paddingTop: 12 }}>
        <button
          onClick={onHelp}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 6,
            color: K.muted, fontSize: 12, cursor: 'pointer',
            background: 'transparent', border: 'none', fontFamily: 'inherit', padding: 0,
          }}
        >
          <KIcon name="help" size={15} color={K.muted} /> Справка
        </button>
        <button
          onClick={onSettings}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 6,
            color: K.muted, fontSize: 12, cursor: 'pointer',
            background: 'transparent', border: 'none', fontFamily: 'inherit', padding: 0,
          }}
        >
          <KIcon name="settings" size={15} color={K.muted} /> Настройки
        </button>
      </Row>
    </aside>
  )
}

export type { NavId }
