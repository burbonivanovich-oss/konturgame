import { K } from './tokens'

interface TabBarProps {
  active?: string
}

export function TabBar({ active = 'day' }: TabBarProps) {
  const tabs = [
    { id: 'day',  label: 'День',     glyph: '◎' },
    { id: 'stock',label: 'Склад',    glyph: '▦' },
    { id: 'ads',  label: 'Реклама',  glyph: '◆' },
    { id: 'kon',  label: 'Контур',   glyph: '□' },
    { id: 'me',   label: 'Профиль',  glyph: '●' },
  ]

  return (
    <div className="k-tabbar">
      {tabs.map(t => (
        <div key={t.id} className={`k-tab ${active === t.id ? 'active' : ''}`}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: active === t.id ? K.ink : K.line,
            color: active === t.id ? K.white : K.ink,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700,
          }}>{t.glyph}</div>
          <span>{t.label}</span>
        </div>
      ))}
    </div>
  )
}
