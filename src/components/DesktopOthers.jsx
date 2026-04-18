// Desktop — secondary screens: event modal, Kontur ecosystem, recap

function DesktopEvent() {
  return (
    <div style={{
      width: 1440, height: 900, background: 'rgba(14,17,22,0.72)',
      fontFamily: 'Manrope, sans-serif', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Blurred dashboard behind */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'var(--k-surface)',
        filter: 'blur(24px) brightness(0.75)',
        opacity: 0.8,
      }}/>
      {/* Dimmed rectangles for bg atmosphere */}
      <div style={{
        position: 'absolute', top: 60, left: 60, width: 320, height: 120,
        background: 'var(--k-orange)', opacity: 0.3, borderRadius: 24,
        filter: 'blur(8px)',
      }}/>
      <div style={{
        position: 'absolute', bottom: 80, right: 80, width: 420, height: 180,
        background: 'var(--k-purple)', opacity: 0.25, borderRadius: 24,
        filter: 'blur(8px)',
      }}/>

      {/* Modal */}
      <div style={{
        position: 'relative', width: 900,
        background: 'var(--k-ink)', color: '#fff',
        borderRadius: 32, padding: 36,
        boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              padding: '6px 12px', borderRadius: 999,
              background: 'var(--k-orange)', color: 'var(--k-ink)',
              fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
            }}>ШТОРМ · 3 СОБЫТИЯ ПОДРЯД</div>
            <div style={{ fontSize: 12, opacity: 0.5, fontWeight: 700 }}>День 47 · Событие 1/3</div>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}>✕</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 28, alignItems: 'center' }}>
          <div>
            <div style={{
              fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.02,
            }}>
              Пришла выездная проверка ФНС
            </div>
            <div style={{ fontSize: 15, opacity: 0.6, lineHeight: 1.45, marginTop: 12 }}>
              Инспектор требует декларации за&nbsp;квартал, книгу доходов и&nbsp;расшифровки операций. До&nbsp;конца дня.
            </div>
            <div style={{
              marginTop: 16, display: 'flex', gap: 8,
            }}>
              <div style={{
                padding: '6px 10px', borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                fontSize: 11, fontWeight: 700, opacity: 0.8,
              }}>Следом: сломался холодильник</div>
              <div style={{
                padding: '6px 10px', borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                fontSize: 11, fontWeight: 700, opacity: 0.8,
              }}>Поставщик обманул</div>
            </div>
          </div>

          {/* Bento illustration */}
          <div style={{
            height: 220, display: 'grid',
            gridTemplateColumns: '1.3fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: 8,
          }}>
            <div style={{
              gridRow: 'span 2',
              background: 'var(--k-purple)', borderRadius: 20,
              padding: 20, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                background: '#fff', borderRadius: 12,
                padding: 14, height: '100%',
              }}>
                <div style={{ height: 5, width: '60%', background: 'var(--k-ink)', borderRadius: 2 }}/>
                <div style={{ height: 4, width: '90%', background: 'var(--k-ink-10)', borderRadius: 2, marginTop: 8 }}/>
                <div style={{ height: 4, width: '80%', background: 'var(--k-ink-10)', borderRadius: 2, marginTop: 4 }}/>
                <div style={{ height: 4, width: '70%', background: 'var(--k-ink-10)', borderRadius: 2, marginTop: 4 }}/>
                <div style={{
                  display: 'inline-block', marginTop: 14, padding: '3px 8px',
                  background: 'var(--k-orange)', borderRadius: 4,
                  fontSize: 9, fontWeight: 800, color: 'var(--k-ink)',
                }}>ФНС · АКТ</div>
              </div>
            </div>
            <div style={{
              background: 'var(--k-orange)', borderRadius: 16,
              padding: 14, color: 'var(--k-ink)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7 }}>БЕЗ КОНТУРА</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>−30к</div>
                <div style={{ fontSize: 9, opacity: 0.7, fontWeight: 700 }}>штраф + риск</div>
              </div>
            </div>
            <div style={{
              background: 'var(--k-green)', borderRadius: 16,
              padding: 14, color: 'var(--k-ink)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7 }}>С ЭКСТЕРНОМ</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>−5к</div>
                <div style={{ fontSize: 9, opacity: 0.7, fontWeight: 700 }}>спасено 25к</div>
              </div>
            </div>
          </div>
        </div>

        {/* Three choice cards — full width */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { n: 'Разбираться самому', v: '−30 000 ₽', s: 'репутация −5', risk: 'РИСК',
              bg: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', col: 'var(--k-bad)' },
            { n: 'Нанять юриста', v: '−18 000 ₽', s: '15 000 ₽ · репутация −2',
              bg: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', col: '#FFA066' },
          ].map((o,i) => (
            <div key={i} style={{
              background: o.bg, border: o.border,
              borderRadius: 20, padding: 18,
              display: 'flex', flexDirection: 'column', gap: 10,
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 800 }}>{o.n}</span>
                {o.risk && (
                  <span style={{
                    padding: '2px 7px', borderRadius: 999,
                    background: 'rgba(255,90,90,0.18)', color: 'var(--k-bad)',
                    fontSize: 9, fontWeight: 800,
                  }}>{o.risk}</span>
                )}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: o.col, letterSpacing: '-0.02em' }} className="k-num">
                {o.v}
              </div>
              <div style={{ fontSize: 11, opacity: 0.55, fontWeight: 600 }}>{o.s}</div>
            </div>
          ))}

          {/* Kontur — special green card */}
          <div style={{
            background: 'var(--k-green)', color: 'var(--k-ink)',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', gap: 10,
            cursor: 'pointer', position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 800 }}>Экстерн подготовит</span>
              <span style={{
                padding: '3px 8px', borderRadius: 5,
                background: 'var(--k-ink)', color: 'var(--k-green)',
                fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
              }}>КОНТУР</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
              −5 000 ₽
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75 }}>
              Пояснения по ТКС. +25&nbsp;000&nbsp;₽ к&nbsp;спасённым.
            </div>
          </div>
        </div>

        <div style={{
          marginTop: -8,
          padding: 14, borderRadius: 14,
          background: 'rgba(255,255,255,0.04)',
          fontSize: 12, opacity: 0.6, lineHeight: 1.4,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            padding: '3px 7px', borderRadius: 4, fontSize: 9, fontWeight: 800,
            background: 'var(--k-green)', color: 'var(--k-ink)',
          }}>ПОДСКАЗКА</span>
          Подписка Экстерн 117&nbsp;₽ за эти 10&nbsp;дней предотвращает ~150&nbsp;000&nbsp;₽ штрафов за полгода. В&nbsp;6 раз выгоднее.
        </div>
      </div>
    </div>
  );
}

function DesktopKontur() {
  const svs = [
    { n: 'Маркет',  sub: 'Склад, маркировка, +20% пропускной · +15% чек', p: '3 500', c: 'var(--k-orange)', on: true, saved: 120, dark: false },
    { n: 'Банк',    sub: 'Овердрафт, +10% клиентов (эквайринг)',         p: '1 200', c: 'var(--k-blue)',   on: true, saved: 35, dark: true },
    { n: 'Экстерн', sub: 'Пояснения ФНС, автоплатежи',                   p: '1 200', c: 'var(--k-green)',  on: true, saved: 42, dark: false },
    { n: 'ОФД',     sub: 'Авто-отправка чеков, восстановление',          p:   '170', c: 'var(--k-purple)', on: true, saved: 23, dark: true },
    { n: 'Фокус',   sub: 'Проверка поставщиков до сделки',                p: '1 500', c: 'var(--k-orange)', on: false },
    { n: 'Диадок',  sub: 'Электронный документооборот в облаке',         p: '3 000', c: 'var(--k-green)',  on: false },
    { n: 'Эльба',   sub: 'Авто-отчётность, бухгалтерия',                  p: '1 700', c: 'var(--k-blue)',   on: false, dark: true },
  ];
  const syn = [
    { a: 'Маркет', b: 'ОФД',    eff: 'Идеальная касса · +2% репутации/день',       on: true },
    { a: 'Экстерн', b: 'Банк',  eff: 'Эквайринг 1.2% вместо 1.5%',                  on: true },
    { a: 'Фокус',  b: 'Банк',   eff: 'Овердрафт 0.15%/день вместо 0.2%',            on: false },
    { a: 'Фокус',  b: 'Диадок', eff: 'Полная защита от поставщиков (штраф = 0)',    on: false },
  ];

  return (
    <div style={{
      width: 1440, height: 900, background: 'var(--k-surface)',
      fontFamily: 'Manrope, sans-serif', color: 'var(--k-ink)',
      padding: 40, overflow: 'hidden', display: 'flex', gap: 20,
    }}>
      {/* Left — hero savings */}
      <div style={{ width: 440, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--k-ink)' }}/>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', opacity: 0.5 }}>
            ЭКОСИСТЕМА
          </div>
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.98 }}>
          Контур<br/>
          <span style={{
            background: 'var(--k-green)', padding: '0 14px',
            borderRadius: 18, display: 'inline-block',
          }}>бережёт.</span>
        </div>

        <div style={{
          background: 'var(--k-ink)', color: '#fff',
          borderRadius: 24, padding: 24, marginTop: 12,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.5, letterSpacing: '0.08em' }}>
                СПАСЕНО ЗА 47 ДНЕЙ
              </div>
              <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.035em', marginTop: 4 }} className="k-num">
                220 400 ₽
              </div>
            </div>
            <div style={{
              padding: '6px 10px', borderRadius: 999,
              background: 'var(--k-green)', color: 'var(--k-ink)',
              fontSize: 12, fontWeight: 800,
            }}>×6 ROI</div>
          </div>
          <div style={{ display: 'flex', gap: 2, height: 14, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ flex: 120, background: 'var(--k-orange)' }}/>
            <div style={{ flex: 42, background: 'var(--k-green)' }}/>
            <div style={{ flex: 35, background: 'var(--k-blue)' }}/>
            <div style={{ flex: 23, background: 'var(--k-purple)' }}/>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6 }}>
            Экономит в 6 раз больше, чем стоит подписка (36&nbsp;600&nbsp;₽).
          </div>
        </div>

        <div style={{
          background: '#fff', borderRadius: 20, padding: 18,
          flex: 1, display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.5 }}>
            СИНЕРГИИ · {syn.filter(s=>s.on).length}/{syn.length}
          </div>
          {syn.map((s,i) => (
            <div key={i} style={{
              padding: '10px 12px', borderRadius: 12,
              background: s.on ? 'var(--k-green-soft)' : 'var(--k-surface)',
              border: s.on ? 'none' : '1.5px dashed var(--k-ink-10)',
              display: 'flex', alignItems: 'center', gap: 10,
              opacity: s.on ? 1 : 0.6,
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{
                  padding: '2px 6px', borderRadius: 4,
                  background: s.on ? 'var(--k-ink)' : 'var(--k-ink-10)',
                  color: s.on ? '#fff' : 'var(--k-ink-50)',
                  fontSize: 9, fontWeight: 800,
                }}>{s.a}</span>
                <span style={{ fontSize: 10, opacity: 0.5, alignSelf: 'center' }}>+</span>
                <span style={{
                  padding: '2px 6px', borderRadius: 4,
                  background: s.on ? 'var(--k-ink)' : 'var(--k-ink-10)',
                  color: s.on ? '#fff' : 'var(--k-ink-50)',
                  fontSize: 9, fontWeight: 800,
                }}>{s.b}</span>
              </div>
              <div style={{ flex: 1, fontSize: 11, fontWeight: 700 }}>{s.eff}</div>
              {s.on && <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--k-good)' }}>✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Right — services grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.5 }}>
              7 СЕРВИСОВ
            </div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Каждый решает проблему</div>
          </div>
          <div style={{
            padding: '8px 14px', borderRadius: 999,
            background: 'var(--k-ink)', color: '#fff',
            fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0,
          }}>Подключено 4 · 6 070 ₽/мес</div>
        </div>

        <div style={{
          flex: 1, display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridAutoRows: '1fr',
          gap: 10,
        }}>
          {svs.map(s => (
            <div key={s.n} style={{
              background: s.on ? s.c : '#fff',
              color: s.on && s.dark ? '#fff' : 'var(--k-ink)',
              border: s.on ? 'none' : '1.5px solid var(--k-ink-10)',
              borderRadius: 18, padding: 18,
              display: 'flex', flexDirection: 'column', gap: 10,
              position: 'relative',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{s.n}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.75, marginTop: 2, lineHeight: 1.3 }}>{s.sub}</div>
                </div>
                {s.on ? (
                  <div style={{
                    padding: '3px 7px', borderRadius: 4,
                    background: s.dark ? '#fff' : 'var(--k-ink)',
                    color: s.dark ? 'var(--k-ink)' : s.c,
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
                  }}>ON</div>
                ) : (
                  <div style={{
                    width: 14, height: 14, borderRadius: 4,
                    border: '1.5px solid var(--k-ink-30)',
                  }}/>
                )}
              </div>
              <div style={{ flex: 1 }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6 }}>ЦЕНА</div>
                  <div style={{ fontSize: 14, fontWeight: 800 }} className="k-num">{s.p} ₽<span style={{ fontSize: 10, opacity: 0.7 }}>/мес</span></div>
                </div>
                {s.on && s.saved && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6 }}>СПАСЕНО</div>
                    <div style={{ fontSize: 14, fontWeight: 800 }} className="k-num">+{s.saved}к ₽</div>
                  </div>
                )}
                {!s.on && (
                  <button style={{
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    padding: '6px 12px', borderRadius: 999,
                    background: 'var(--k-ink)', color: '#fff',
                    fontSize: 11, fontWeight: 700,
                  }}>Подключить</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DesktopRecap() {
  return (
    <div style={{
      width: 1440, height: 900, background: 'var(--k-surface)',
      fontFamily: 'Manrope, sans-serif', color: 'var(--k-ink)',
      padding: 40, overflow: 'hidden', display: 'flex', gap: 20,
    }}>
      {/* Left — hero number */}
      <div style={{ width: 460, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', opacity: 0.5 }}>
          ИТОГИ ДНЯ · 47 · ср, 14 мая
        </div>

        <div style={{
          background: 'var(--k-green)', color: 'var(--k-ink)',
          borderRadius: 28, padding: 24,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.7, letterSpacing: '0.08em' }}>
            ЧИСТАЯ ПРИБЫЛЬ
          </div>
          <div>
            <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.9 }} className="k-num">
              +14 220
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, opacity: 0.6, marginTop: 2 }}>рублей</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              padding: '6px 12px', borderRadius: 999,
              background: 'var(--k-ink)', color: 'var(--k-green)',
              fontSize: 12, fontWeight: 800,
            }}>+18% к среднему</div>
            <div style={{
              padding: '6px 12px', borderRadius: 999,
              background: 'rgba(14,17,22,0.1)',
              fontSize: 12, fontWeight: 700,
            }}>лучший день недели</div>
          </div>
        </div>

        <div style={{
          background: 'var(--k-orange)', color: 'var(--k-ink)',
          borderRadius: 20, padding: 18,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--k-ink)', color: 'var(--k-orange)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800,
          }}>★</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.7 }}>
              ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
              Без просрочки неделю
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, marginTop: 2 }}>
              +50 репутации · 7/20 достижений
            </div>
          </div>
        </div>
      </div>

      {/* Right — receipt */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        <div style={{
          background: '#fff', borderRadius: 24, padding: 20,
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.5 }}>
                ЕСЛИ БЫ НЕ КОНТУР
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em', marginTop: 2 }}>
                Сравнение дня
              </div>
            </div>
            <div className="k-mono" style={{ fontSize: 11, opacity: 0.4 }}>#47-0514</div>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 110px 110px 110px',
            gap: 8, padding: '6px 10px',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.4,
            borderBottom: '1.5px solid var(--k-ink-10)',
          }}>
            <span>ПРОБЛЕМА</span>
            <span style={{ textAlign: 'right' }}>БЕЗ</span>
            <span style={{ textAlign: 'right' }}>С КОНТУРОМ</span>
            <span style={{ textAlign: 'right' }}>СПАСЕНО</span>
          </div>

          {[
            { l: 'Списание молока (просрочка)',    ch: 'Маркет',   a: -2000,  b: -400,   c: 1600 },
            { l: 'Выездная проверка ФНС',           ch: 'Экстерн',  a: -30000, b: -5000,  c: 25000 },
            { l: 'Блокировка расчётного счёта',     ch: 'Экстерн',  a: -8000,  b: 0,      c: 8000 },
            { l: 'Эквайринг (1.5% vs 1.2%)',        ch: 'Банк+Экст',a: -420,   b: -336,   c: 84 },
            { l: 'Отчётность за квартал',           ch: 'Эльба',    a: -20000, b: 0,      c: 20000 },
          ].map((r,i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 110px 110px 110px',
              gap: 8, padding: '8px 10px',
              borderBottom: '1px dashed var(--k-ink-10)',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{r.l}</div>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, marginTop: 1 }}>
                  через {r.ch}
                </div>
              </div>
              <div className="k-mono k-num" style={{
                textAlign: 'right', fontWeight: 700, fontSize: 14, color: 'var(--k-bad)',
              }}>{r.a.toLocaleString('ru')}</div>
              <div className="k-mono k-num" style={{
                textAlign: 'right', fontWeight: 700, fontSize: 14,
                color: r.b === 0 ? 'var(--k-good)' : '#FFA066',
              }}>{r.b === 0 ? '0' : r.b.toLocaleString('ru')}</div>
              <div className="k-mono k-num" style={{
                textAlign: 'right', fontWeight: 800, fontSize: 14, color: 'var(--k-good)',
              }}>+{r.c.toLocaleString('ru')}</div>
            </div>
          ))}

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 110px 110px 110px',
            gap: 8, padding: '10px 10px 0',
            borderTop: '2px solid var(--k-ink)',
            alignItems: 'center', marginTop: 'auto',
          }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Сэкономлено за день</div>
            <div className="k-mono k-num" style={{ textAlign: 'right', fontWeight: 800, fontSize: 15, color: 'var(--k-bad)' }}>−60 420</div>
            <div className="k-mono k-num" style={{ textAlign: 'right', fontWeight: 800, fontSize: 15 }}>−5 736</div>
            <div className="k-mono k-num" style={{ textAlign: 'right', fontWeight: 800, fontSize: 22, color: 'var(--k-good)' }}>+54 684</div>
          </div>
        </div>

        {/* Progression row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, height: 110, flexShrink: 0 }}>
          <div style={{
            background: 'var(--k-purple)', color: '#fff',
            borderRadius: 20, padding: 20,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.7, letterSpacing: '0.08em' }}>
              К ЦЕЛИ 1 000 000 ₽
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800 }} className="k-num">672 400 ₽</div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.22)', borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
                <div style={{ width: '67%', height: '100%', background: '#fff' }}/>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--k-blue)', color: '#fff',
            borderRadius: 20, padding: 20,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.7, letterSpacing: '0.08em' }}>
              УРОВЕНЬ 7 · до 8
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800 }} className="k-num">40%</div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.22)', borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
                <div style={{ width: '40%', height: '100%', background: '#fff' }}/>
              </div>
            </div>
          </div>
        </div>

        <button style={{
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          background: 'var(--k-ink)', color: '#fff',
          padding: '18px 24px', borderRadius: 999,
          fontSize: 17, fontWeight: 800, flexShrink: 0,
        }}>
          Продолжить · День 48 →
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { DesktopEvent, DesktopKontur, DesktopRecap });
