// Desktop — 1440×900 dashboard.
// The "airplane cockpit" metaphor from the concept: all day-critical info visible at once.

function DesktopApp() {
  return (
    <div style={{
      width: 1440, height: 900,
      background: 'var(--k-surface)',
      fontFamily: 'Manrope, sans-serif',
      color: 'var(--k-ink)',
      display: 'flex',
      overflow: 'hidden',
      letterSpacing: '-0.01em',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    }}>
      {/* LEFT RAIL — navigation */}
      <aside style={{
        width: 240, background: 'var(--k-ink)', color: '#fff',
        padding: '24px 20px', display: 'flex', flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--k-orange)',
          }}/>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Бизнес</div>
            <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 600 }}>с Контуром</div>
          </div>
        </div>

        {/* Day info box */}
        <div style={{
          padding: 12, borderRadius: 12,
          background: 'rgba(255,255,255,0.06)',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 700, letterSpacing: '0.1em' }}>
            КОФЕЙНЯ «ЗЕРНО»
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>День 47</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 6,
            fontSize: 11, fontWeight: 600, opacity: 0.7,
          }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--k-blue-soft)' }}/>
            Весна · солнечно · +8%
          </div>
        </div>

        {/* Navigation items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { n: 'Дневной цикл',  g: '◎', on: true,  badge: '1' },
            { n: 'Склад',         g: '▦', on: false, badge: '20' },
            { n: 'Маркетинг',     g: '◆', on: false },
            { n: 'Экосистема',    g: '□', on: false, badge: '4/7' },
            { n: 'Финансы',       g: '₽', on: false },
            { n: 'Репутация',     g: '★', on: false },
            { n: 'Достижения',    g: '◈', on: false },
          ].map(i => (
            <div key={i.n} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: i.on ? 'var(--k-orange)' : 'transparent',
              color: i.on ? 'var(--k-ink)' : '#fff',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6,
                background: i.on ? 'var(--k-ink)' : 'rgba(255,255,255,0.08)',
                color: i.on ? 'var(--k-orange)' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
              }}>{i.g}</span>
              <span style={{ flex: 1 }}>{i.n}</span>
              {i.badge && (
                <span style={{
                  fontSize: 10, fontWeight: 800,
                  padding: '2px 6px', borderRadius: 999,
                  background: i.on ? 'var(--k-ink)' : 'rgba(255,255,255,0.12)',
                  color: i.on ? 'var(--k-orange)' : '#fff',
                }}>{i.badge}</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}/>

        {/* Saved rubles — bottom of rail */}
        <div style={{
          padding: 14, borderRadius: 16,
          background: 'var(--k-green)', color: 'var(--k-ink)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7, letterSpacing: '0.1em' }}>
            СПАСЕНО С КОНТУРОМ
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }} className="k-num">
            220 400 ₽
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, marginTop: 4 }}>
            ×6 ROI · за 47 дней
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{
        flex: 1, padding: '20px 24px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Top KPI bento strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr 1fr 1fr',
          gap: 10, height: 146,
        }}>
          {/* Income — dominant orange */}
          <div style={{
            background: 'var(--k-orange)', color: 'var(--k-ink)',
            borderRadius: 20, padding: 20,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.65 }}>
                  ДОХОД ЗА ДЕНЬ
                </div>
                <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 2 }} className="k-num">
                  24 860 ₽
                </div>
              </div>
              <div style={{
                padding: '4px 8px', borderRadius: 999,
                background: 'var(--k-ink)', color: 'var(--k-orange)',
                fontSize: 11, fontWeight: 800,
              }}>+18%</div>
            </div>
            <Spark data={[8,11,9,14,13,18,16,22,19,25]} color="#0E1116" fill/>
          </div>

          {/* Net */}
          <div style={{
            background: 'var(--k-green)', color: 'var(--k-ink)',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.65 }}>
              ЧИСТАЯ
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                +14 220 ₽
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.7, marginTop: 4 }}>
                после налога 6% и закупок
              </div>
            </div>
          </div>

          {/* Monthly */}
          <div style={{
            background: 'var(--k-blue)', color: '#fff',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.7 }}>
              РАСХОДЫ / МЕС
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                168 000 ₽
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.8, marginTop: 4 }}>
                через 12 дн. списание
              </div>
            </div>
          </div>

          {/* To goal */}
          <div style={{
            background: 'var(--k-purple)', color: '#fff',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.7 }}>
              К ЦЕЛИ
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                672 400 ₽
              </div>
              <div style={{
                marginTop: 6, height: 5, background: 'rgba(255,255,255,0.22)',
                borderRadius: 999, overflow: 'hidden',
              }}>
                <div style={{ width: '67%', height: '100%', background: '#fff' }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Main row: left big · right cockpit */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 12, flex: 1, minHeight: 0 }}>

          {/* LEFT column — decision cluster + capacity + stock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>

            {/* Event / decision — wide */}
            <div style={{
              background: 'var(--k-ink)', color: '#fff',
              borderRadius: 24, padding: 20,
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    padding: '4px 10px', borderRadius: 999,
                    background: 'var(--k-orange)', color: 'var(--k-ink)',
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                  }}>СОБЫТИЕ · ТРЕБУЕТ РЕШЕНИЯ</div>
                  <div style={{ fontSize: 11, opacity: 0.5, fontWeight: 700 }}>
                    Блокирует «Следующий день»
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.5 }}>1 / 1</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
                Пришла выездная проверка ФНС
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {/* Option 1 */}
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: 16, padding: 14,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>Разбираться самому</span>
                    <span style={{
                      padding: '2px 6px', borderRadius: 999,
                      background: 'rgba(255,90,90,0.18)', color: 'var(--k-bad)',
                      fontSize: 9, fontWeight: 800,
                    }}>РИСК</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--k-bad)' }} className="k-num">−30 000 ₽</div>
                  <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>репутация −5</div>
                </div>
                {/* Option 2 */}
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: 16, padding: 14,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>Нанять юриста</span>
                    <span style={{ fontSize: 10, opacity: 0.5 }}>15 000 ₽</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#FFA066' }} className="k-num">−18 000 ₽</div>
                  <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>репутация −2</div>
                </div>
                {/* Option 3 — Kontur */}
                <div style={{
                  background: 'var(--k-green)', color: 'var(--k-ink)',
                  borderRadius: 16, padding: 14,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>Экстерн подготовит</span>
                    <span style={{
                      padding: '2px 6px', borderRadius: 4,
                      background: 'var(--k-ink)', color: 'var(--k-green)',
                      fontSize: 9, fontWeight: 800,
                    }}>КОНТУР</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800 }} className="k-num">−5 000 ₽</div>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, marginTop: 2 }}>+25 000 ₽ спасено</div>
                </div>
              </div>
            </div>

            {/* Capacity + stock row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 12, flex: 1, minHeight: 0 }}>
              {/* Capacity */}
              <div style={{
                background: '#fff', borderRadius: 20, padding: 18,
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.5 }}>
                      ПРОПУСКНАЯ · ОЧЕРЕДЬ
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>
                      120 <span style={{ opacity: 0.3 }}>/</span> 137
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 10px', borderRadius: 999,
                    background: 'var(--k-orange-soft)',
                    fontSize: 11, fontWeight: 800,
                  }}>17 ушли к конкурентам</div>
                </div>

                {/* stacked bar */}
                <div style={{ display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden', gap: 2 }}>
                  <div style={{ flex: 120, background: 'var(--k-green)' }}/>
                  <div style={{ flex: 17, background: 'var(--k-orange)' }}/>
                </div>

                {/* queue dots viz */}
                <div style={{
                  display: 'flex', gap: 3, flexWrap: 'wrap',
                }}>
                  {Array.from({length: 137}).map((_, i) => (
                    <div key={i} style={{
                      width: 10, height: 10, borderRadius: 3,
                      background: i < 120 ? 'var(--k-green)' : 'var(--k-orange)',
                    }}/>
                  ))}
                </div>

                <div style={{
                  padding: 10, borderRadius: 12,
                  background: 'var(--k-surface)',
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: 12,
                }}>
                  <div style={{
                    padding: '3px 8px', borderRadius: 4,
                    background: 'var(--k-orange)', fontSize: 10, fontWeight: 800,
                  }}>МАРКЕТ</div>
                  <span style={{ flex: 1, opacity: 0.7 }}>+20% пропускной. Очередь исчезает, −3.4 реп не будет.</span>
                  <span style={{ fontSize: 16, opacity: 0.3 }}>→</span>
                </div>
              </div>

              {/* Stock mini */}
              <div style={{
                background: '#fff', borderRadius: 20, padding: 18,
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.5 }}>
                      СКЛАД · МОЛОКО 3.2%
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>
                      108 ед <span style={{ fontSize: 13, opacity: 0.5, fontWeight: 600 }}>· 5 дн</span>
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 8px', borderRadius: 999,
                    background: 'var(--k-orange)', color: 'var(--k-ink)',
                    fontSize: 10, fontWeight: 800,
                  }}>20 ПРОСРОЧКА</div>
                </div>

                {/* day markers */}
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,1,1,1,1,0,0].map((v,i) => (
                    <div key={i} style={{
                      flex: 1, height: 8,
                      background: v ? 'var(--k-green)' : 'var(--k-surface-2)',
                      borderRadius: 999,
                    }}/>
                  ))}
                </div>

                {/* batches */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  {[
                    { d: 'Пн · 2 дн', left: 18, qty: 28, c: 'var(--k-orange)', warn: true },
                    { d: 'Чт · 5 дн', left: 42, qty: 48, c: 'var(--k-blue)' },
                    { d: 'Сб · 8 дн', left: 48, qty: 48, c: 'var(--k-purple)' },
                  ].map((b,i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 8, fontSize: 11,
                    }}>
                      <span style={{ width: 64, fontWeight: 700, opacity: 0.6 }}>{b.d}</span>
                      <div style={{
                        flex: 1, height: 20, borderRadius: 999,
                        background: 'var(--k-surface-2)', overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${(b.left / 48) * 100}%`, height: '100%',
                          background: b.c,
                          color: b.c === 'var(--k-purple)' || b.c === 'var(--k-blue)' ? '#fff' : 'var(--k-ink)',
                          fontSize: 10, fontWeight: 800,
                          display: 'flex', alignItems: 'center', paddingLeft: 8,
                        }}>{b.left}/{b.qty}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button style={{
                  marginTop: 'auto', padding: '10px 14px', border: 'none',
                  background: 'var(--k-ink)', color: '#fff',
                  borderRadius: 999, fontFamily: 'inherit',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>
                  Заказать стандарт · 2 880 ₽
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT rail — Kontur services + next-day */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>

            {/* Indicators */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: 14,
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
            }}>
              {[
                { l: 'Склад', v: '5 дн', d: 'green', bg: 'var(--k-green-soft)' },
                { l: 'Персонал', v: '74%', d: 'yellow', bg: '#FFEFB8' },
                { l: 'Репутация', v: '↑ +2', d: 'green', bg: 'var(--k-green-soft)' },
              ].map(i => (
                <div key={i.l} style={{
                  padding: 10, borderRadius: 12, background: i.bg,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <span className={`k-dot k-dot-${i.d}`}/>
                    <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.65 }}>{i.l}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800 }} className="k-num">{i.v}</div>
                </div>
              ))}
            </div>

            {/* Kontur services mini-grid */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: 14,
              flex: 1, display: 'flex', flexDirection: 'column', gap: 10,
              minHeight: 0,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.5 }}>
                    ЭКОСИСТЕМА
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>Контур · 4/7</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.5 }}>Развернуть →</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { n: 'Маркет',  on: true,  c: 'var(--k-orange)' },
                  { n: 'Банк',    on: true,  c: 'var(--k-blue)' },
                  { n: 'Экстерн', on: true,  c: 'var(--k-green)' },
                  { n: 'ОФД',     on: true,  c: 'var(--k-purple)' },
                  { n: 'Фокус',   on: false },
                  { n: 'Диадок',  on: false },
                  { n: 'Эльба',   on: false },
                  { n: '+',       empty: true },
                ].map(s => (
                  <div key={s.n} style={{
                    background: s.on ? s.c : (s.empty ? 'transparent' : 'var(--k-surface)'),
                    color: s.on && (s.c === 'var(--k-blue)' || s.c === 'var(--k-purple)') ? '#fff' : 'var(--k-ink)',
                    borderRadius: 10, padding: '8px 10px',
                    border: s.empty ? '1.5px dashed var(--k-ink-30)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontSize: 11, fontWeight: 800,
                    opacity: s.on ? 1 : 0.55,
                    minHeight: 32,
                  }}>
                    <span>{s.n}</span>
                    {s.on && (
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: s.c === 'var(--k-blue)' || s.c === 'var(--k-purple)' ? '#fff' : 'var(--k-ink)',
                      }}/>
                    )}
                  </div>
                ))}
              </div>

              {/* Synergies */}
              <div style={{
                marginTop: 'auto', padding: 10, borderRadius: 12,
                background: 'var(--k-green-soft)',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.6, letterSpacing: '0.08em' }}>
                  АКТИВНЫЕ СИНЕРГИИ · 2
                </div>
                <div style={{ fontSize: 11, fontWeight: 700 }}>
                  Маркет + ОФД → +2% реп/день
                </div>
                <div style={{ fontSize: 11, fontWeight: 700 }}>
                  Экстерн + Банк → эквайринг 1.2%
                </div>
              </div>
            </div>

            {/* Next day button */}
            <button style={{
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: 'var(--k-orange)', color: 'var(--k-ink)',
              padding: '20px 24px', borderRadius: 999,
              fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              Следующий день
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 10h10m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { DesktopApp });
