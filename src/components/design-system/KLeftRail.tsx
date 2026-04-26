import { K } from './tokens'
import { KIcon } from './KIcon'
import { Row, Col, Card } from './primitives'
import type { BusinessType, PersonalGoal } from '../../types/game'

type NavId = 'dashboard' | 'ecosystem' | 'finance' | 'development' | 'operations' |
             'warehouse' | 'statistics' | 'journal'

export interface NavItem {
  id: NavId
  label: string
  icon: string
  unlocksAtWeek?: number  // hidden until this week
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',   label: 'Дневной цикл', icon: 'dashboard'               },
  { id: 'ecosystem',   label: 'Экосистема',   icon: 'eco'                     },
  { id: 'finance',     label: 'Финансы',      icon: 'finance'                 },
  { id: 'warehouse',   label: 'Склад',        icon: 'warehouse', unlocksAtWeek: 2  },
  { id: 'operations',  label: 'Состав',       icon: 'ops'                          },
  { id: 'development', label: 'Развитие',     icon: 'upgrade',   unlocksAtWeek: 2  },
  { id: 'statistics',  label: 'Статистика',   icon: 'stats',     unlocksAtWeek: 7  },
  { id: 'journal',     label: 'Журнал',       icon: 'log',       unlocksAtWeek: 10 },
]

// Top-level nav collapses 8 views into 3 groups. Sub-tabs inside each group
// give granular access. Existing setActiveView('finance') etc. still work —
// they auto-resolve to the correct group via NAV_ITEM_TO_GROUP below.
export type NavGroupId = 'today' | 'business' | 'reports'

interface NavGroup {
  id: NavGroupId
  label: string
  icon: string
  members: NavId[]  // sub-tabs in display order
}

export const NAV_GROUPS: NavGroup[] = [
  { id: 'today',    label: 'Сегодня', icon: 'dashboard', members: ['dashboard'] },
  { id: 'business', label: 'Дело',    icon: 'ops',       members: ['ecosystem', 'warehouse', 'operations', 'development'] },
  { id: 'reports',  label: 'Отчёты',  icon: 'finance',   members: ['finance', 'statistics', 'journal'] },
]

export function getGroupForNav(navId: NavId): NavGroupId {
  for (const g of NAV_GROUPS) {
    if (g.members.includes(navId)) return g.id
  }
  return 'today'
}

// Returns the first unlocked member of a group at the current week.
// Used when the player clicks a group tab — we land them on the first
// available sub-view rather than asking them to pick a sub-tab.
export function firstUnlockedMember(groupId: NavGroupId, currentWeek: number): NavId {
  const group = NAV_GROUPS.find(g => g.id === groupId)
  if (!group) return 'dashboard'
  for (const memberId of group.members) {
    const item = NAV_ITEMS.find(it => it.id === memberId)
    if (!item) continue
    if (!item.unlocksAtWeek || currentWeek >= item.unlocksAtWeek) return memberId
  }
  return group.members[0]  // fallback even if locked
}

export function getSubTabsForGroup(groupId: NavGroupId, currentWeek: number): NavItem[] {
  const group = NAV_GROUPS.find(g => g.id === groupId)
  if (!group) return []
  return group.members
    .map(id => NAV_ITEMS.find(it => it.id === id))
    .filter((it): it is NavItem => !!it && (!it.unlocksAtWeek || currentWeek >= it.unlocksAtWeek))
}

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
  balance: number
  personalGoal: PersonalGoal | null | undefined
  pendingEventCount: number
  promoCodesCount: number
  revealedNpcCount: number
  highlightNav?: NavId
  onNav: (id: NavId) => void
  onHelp: () => void
  onSettings: () => void
  onPromoWallet: () => void
  onAchievements: () => void
  onNpcRoster: () => void
}

export function KLeftRail({
  active, businessType, currentWeek, activeServiceCount,
  savedBalance, balance, personalGoal, pendingEventCount,
  promoCodesCount, revealedNpcCount,
  highlightNav, onNav, onHelp, onSettings,
  onPromoWallet, onAchievements, onNpcRoster,
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

      {/* Business status card — week N/52 + progress bar makes the year-as-finale
          visible at all times, not just at the end. */}
      <Card pad={12} radius={12} bg={K.bone} border={K.lineSoft}>
        <Row gap={8}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: K.white, border: `1px solid ${K.line}`,
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <KIcon name={BIZ_ICON[businessType]} size={16} color={K.ink2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{BIZ_LABEL[businessType]}</div>
            <div style={{ fontSize: 11, color: K.muted, fontVariantNumeric: 'tabular-nums' }}>
              Неделя {currentWeek} / 52 · {season}
            </div>
          </div>
        </Row>
        <div style={{
          marginTop: 8, height: 3, background: K.lineSoft,
          borderRadius: 999, overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.min(100, (currentWeek / 52) * 100)}%`,
            height: '100%',
            background: currentWeek >= 49 ? K.orange : K.ink2,
            transition: 'width 0.3s',
          }} />
        </div>
      </Card>

      {/* Navigation — 3 top-level groups (Сегодня / Дело / Отчёты).
          Sub-tabs surface inside the content area when a group has more
          than one available view. Achievements and NPC roster stay as
          modal-style buttons below. */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {(() => {
          const activeGroup = getGroupForNav(active)
          const groupHighlight = highlightNav ? getGroupForNav(highlightNav) : undefined
          return NAV_GROUPS.map(group => {
            const isActive = group.id === activeGroup
            const subTabs = getSubTabsForGroup(group.id, currentWeek)
            // Group is "locked" only if every member is locked. With the
            // current set, only 'today' is always-on; 'business' is on
            // from week 1 (ecosystem + operations); 'reports' is on from
            // week 1 (finance always available).
            const isLocked = subTabs.length === 0
            // Badge: dashboard has pending events; business shows
            // service count; reports has no badge.
            let badge: string | undefined
            if (group.id === 'today' && pendingEventCount > 0) badge = String(pendingEventCount)
            else if (group.id === 'business') badge = `${activeServiceCount}/7`

            const isPulsing = groupHighlight === group.id && !isActive && !isLocked
            return (
              <button
                key={group.id}
                onClick={() => !isLocked && onNav(firstUnlockedMember(group.id, currentWeek))}
                disabled={isLocked}
                className={isPulsing ? 'nav-pulse' : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 9,
                  background: isActive ? K.ink : 'transparent',
                  color: isActive ? K.white : K.ink,
                  fontSize: 14, fontWeight: 600,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.45 : 1,
                  border: 'none', fontFamily: 'inherit', width: '100%', textAlign: 'left',
                  outline: isPulsing ? `2px solid ${K.orange}` : 'none',
                }}
              >
                <KIcon name={group.icon} size={17} color={isActive ? K.white : K.ink2} />
                <div style={{ flex: 1 }}>{group.label}</div>
                {badge && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    padding: '2px 7px', borderRadius: 999,
                    background: isActive ? 'rgba(255,255,255,0.15)' : K.bone,
                    color: isActive ? K.white : K.muted,
                    letterSpacing: '0.04em',
                  }}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })
        })()}

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

        {/* NPC roster — opens modal */}
        <button
          onClick={onNpcRoster}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 9,
            background: 'transparent', color: K.ink,
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            border: 'none', fontFamily: 'inherit', width: '100%', textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 14, width: 16, textAlign: 'center' }}>👥</span>
          <div style={{ flex: 1 }}>Окружение</div>
          {revealedNpcCount > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              padding: '2px 7px', borderRadius: 999,
              background: K.bone, color: K.muted,
              letterSpacing: '0.04em',
            }}>
              {revealedNpcCount}
            </span>
          )}
        </button>
      </nav>

      <div style={{ flex: 1 }} />

      {/* Personal goal — anchors the run with a real reason and deadline.
          When the player hasn't started a backstory (or goal is null) we
          show a quiet placeholder so the rail layout doesn't shift when
          the goal appears. */}
      {!personalGoal && (
        <Card pad={12} radius={12} bg={K.bone} border={K.lineSoft}>
          <div style={{ fontSize: 10, color: K.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
            Личная цель
          </div>
          <div style={{ fontSize: 12, color: K.muted, marginTop: 6, lineHeight: 1.35 }}>
            Появится после выбора предыстории
          </div>
        </Card>
      )}
      {personalGoal && (() => {
        const pct = Math.min(100, Math.round((balance / personalGoal.targetAmount) * 100))
        const weeksLeft = Math.max(0, personalGoal.deadlineWeek - currentWeek)
        const isAchieved = personalGoal.achieved
        const isMissed = personalGoal.missed
        // Tone: green when on track, amber when behind, red when missed
        const expectedPctByNow = Math.min(100, Math.round((currentWeek / personalGoal.deadlineWeek) * 100))
        const onTrack = pct >= expectedPctByNow * 0.9
        const accent = isAchieved ? K.mint : isMissed ? '#c0392b' : onTrack ? K.ink : K.orange
        return (
          <Card pad={12} radius={12} bg={K.white} border={K.line}>
            <div style={{ fontSize: 10, color: K.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
              Личная цель
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, color: K.ink, lineHeight: 1.25 }}>
              {personalGoal.shortLabel}
            </div>
            <div style={{ marginTop: 8, height: 6, borderRadius: 999, background: K.lineSoft, overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: accent, transition: 'width 0.3s',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: K.muted, fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ color: accent, fontWeight: 700 }}>{pct}%</span>
              <span>
                {isAchieved ? 'Цель достигнута ✓'
                  : isMissed ? 'Срок истёк'
                  : weeksLeft === 0 ? 'Последняя неделя!'
                  : `${weeksLeft} нед. до срока`}
              </span>
            </div>
          </Card>
        )
      })()}

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
