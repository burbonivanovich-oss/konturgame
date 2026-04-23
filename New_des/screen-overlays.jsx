// Overlays: WeekSummary (week start), WeekResults (week end), Event, Victory, GameOver.
// Rendered in-place on top of a blurred placeholder so they show as modal states.

const Backdrop = ({ children, bg = 'rgba(15,15,20,0.55)' }) => (
  <div style={{ position:'absolute', inset:0, background: bg, backdropFilter:'blur(6px)',
    display:'grid', placeItems:'center', padding:24 }}>
    {children}
  </div>
);

// A faint dashboard silhouette behind the modal
const FakeStage = ({ children }) => (
  <div className="kb" style={{ width:1440, height:900, background:K.paper, position:'relative', overflow:'hidden' }}>
    {/* silhouette */}
    <div style={{ position:'absolute', inset:0, display:'flex', opacity:0.35, filter:'blur(2px)' }}>
      <div style={{ width:240, background:K.white, borderRight:`1px solid ${K.line}` }}/>
      <div style={{ flex:1, padding:16 }}>
        <div style={{ height:56, background:K.white, border:`1px solid ${K.line}`, borderRadius:8, marginBottom:16 }}/>
        <div style={{ display:'grid', gridTemplateColumns:'260px 1fr 240px', gap:16 }}>
          {[[180,140,120],[260],[100,100,100,100]].map((col,ci) => (
            <div key={ci} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {col.map((h,i) => <div key={i} style={{ height:h, background:K.white, border:`1px solid ${K.line}`, borderRadius:12 }}/>)}
            </div>
          ))}
        </div>
      </div>
    </div>
    {children}
  </div>
);

// ───── WEEK SUMMARY (start of week)
const WeekSummaryOverlay = () => (
  <FakeStage>
    <Backdrop>
      <div style={{ width:480, background:K.white, borderRadius:20, border:`1px solid ${K.line}`, padding:32, boxShadow:'0 30px 80px rgba(0,0,0,0.25)' }}>
        <Label color={K.blue}>Начало недели</Label>
        <div style={{ fontSize:40, fontWeight:800, letterSpacing:'-0.03em', marginTop:6 }}>Неделя 6</div>
        <div style={{ fontSize:13, color:K.muted, marginTop:2 }}>Лето · первый день из 7</div>

        <div style={{ marginTop:22, padding:16, background:K.bone, borderRadius:12 }}>
          <Label size={10}>Итоги прошлой недели</Label>
          <Row gap={18} style={{ marginTop:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:K.muted }} className="caps">Выручка</div>
              <div className="tnum" style={{ fontSize:16, fontWeight:700, marginTop:2 }}>86 400 ₽</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:K.muted }} className="caps">Прибыль</div>
              <div className="tnum" style={{ fontSize:16, fontWeight:700, marginTop:2, color:K.good }}>+42 800 ₽</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:K.muted }} className="caps">Баланс</div>
              <div className="tnum" style={{ fontSize:16, fontWeight:700, marginTop:2 }}>142 350 ₽</div>
            </div>
          </Row>
        </div>

        <Row justify="space-between" style={{ marginTop:14, fontSize:12 }}>
          <span style={{ color:K.muted }}>Активных сервисов</span>
          <span className="tnum"><b>3</b> из 7</span>
        </Row>
        <div style={{ marginTop:14 }}>
          <Row justify="space-between" style={{ fontSize:12, marginBottom:6 }}>
            <span style={{ color:K.muted }}>Энергия на старте</span>
            <span className="tnum"><b>71%</b></span>
          </Row>
          <ProgressBar value={71} color={K.orange}/>
        </div>
        <Btn kind="primary" size="lg" style={{ width:'100%', marginTop:24 }}>
          Начать неделю <Icon name="arrow" size={14} color={K.white}/>
        </Btn>
      </div>
    </Backdrop>
  </FakeStage>
);

// ───── WEEK RESULTS (end of week)
const WeekResultsOverlay = () => (
  <FakeStage>
    <Backdrop>
      <div style={{ width:520, background:K.white, borderRadius:20, border:`1px solid ${K.line}`, padding:32, boxShadow:'0 30px 80px rgba(0,0,0,0.25)' }}>
        <Label color={K.mint}>Итоги недели</Label>
        <div style={{ fontSize:20, fontWeight:700, marginTop:4 }}>Неделя 5 завершена</div>

        <div style={{ marginTop:20, padding:'20px 16px', background: K.mintSoft, borderRadius:14, textAlign:'center' }}>
          <div className="caps" style={{ fontSize:10, color:K.mint }}>Чистая прибыль</div>
          <div className="tnum" style={{ fontSize:52, fontWeight:800, letterSpacing:'-0.03em', marginTop:4, color:K.ink }}>+42 800 ₽</div>
          <div style={{ fontSize:12, color:K.ink2, marginTop:4 }}>↑ 12% к неделе 4</div>
        </div>

        <div style={{ marginTop:20 }}>
          <Label>Детализация</Label>
          <div style={{ marginTop:6 }}>
            <FinanceRow label="Выручка"        value="+86 400 ₽"/>
            <FinanceRow label="Закупки"        value="−24 000 ₽" muted/>
            <FinanceRow label="Налог УСН 6%"   value="−5 184 ₽" muted/>
            <FinanceRow label="Аренда + ФОТ"   value="−12 500 ₽" muted/>
            <FinanceRow label="Подписки Контур" value="−1 750 ₽" muted/>
            <FinanceRow label="Списания"       value="−166 ₽" muted/>
            <Row justify="space-between" style={{ padding:'10px 0 0' }}>
              <div style={{ fontSize:13, fontWeight:700 }}>Итого</div>
              <div className="tnum" style={{ fontSize:15, fontWeight:800, color:K.good }}>+42 800 ₽</div>
            </Row>
          </div>
        </div>

        <div style={{ marginTop:18, padding:12, borderRadius:12, background:K.bone }}>
          <Row gap={10}>
            <Icon name="rep" size={18} color={K.orange}/>
            <div style={{ fontSize:12 }}>
              <b>Новое достижение:</b> «Неделя без убытков»
            </div>
          </Row>
        </div>

        <Btn kind="mint" size="lg" style={{ width:'100%', marginTop:22 }}>
          Следующая неделя <Icon name="arrow" size={14} color={K.white}/>
        </Btn>
      </div>
    </Backdrop>
  </FakeStage>
);

// ───── EVENT MODAL
const EventModal = () => (
  <FakeStage>
    <Backdrop>
      <div style={{ width:520, background:K.white, borderRadius:20, border:`1px solid ${K.line}`, padding:28, boxShadow:'0 30px 80px rgba(0,0,0,0.25)' }}>
        <Row gap={14} style={{ marginBottom:14 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:K.orangeSoft, display:'grid', placeItems:'center' }}>
            <Icon name="alert" size={26} color={K.orange}/>
          </div>
          <div>
            <div className="caps" style={{ fontSize:10, color:K.muted }}>Событие · неделя 5</div>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginTop:2 }}>Проверка Роспотребнадзора</div>
          </div>
        </Row>
        <div style={{ fontSize:14, color:K.ink2, lineHeight:1.55 }}>
          К вам пришла плановая проверка. Инспектор хочет видеть журнал приёмки товара за 2 последние недели. У вас нет электронной системы документооборота.
        </div>
        <div style={{ marginTop:16, padding:12, borderRadius:10, background:K.bone, fontSize:12, color:K.muted }}>
          Неделя 5 · Лето · При штрафе теряете 15 000 ₽ и −10 к репутации.
        </div>
        <Col gap={10} style={{ marginTop:20 }}>
          <button style={{
            textAlign:'left', padding:'14px 16px', borderRadius:12,
            border:`2px solid ${K.orange}`, background:'#fffaf5', cursor:'pointer',
            fontFamily:'inherit', color:K.ink,
          }}>
            <Row justify="space-between"><div style={{ fontSize:14, fontWeight:700 }}>Показать документы из Диадока</div><Pill size="sm" bg={K.orange} fg={K.white}>Контур</Pill></Row>
            <div style={{ fontSize:12, color:K.ink2, marginTop:4 }}>Документы подписаны электронно, инспектор принимает сразу.</div>
          </button>
          <button style={{ textAlign:'left', padding:'14px 16px', borderRadius:12, border:`1px solid ${K.line}`, background:K.white, cursor:'pointer', fontFamily:'inherit', color:K.ink }}>
            <div style={{ fontSize:14, fontWeight:700 }}>Собрать бумаги вручную</div>
            <div style={{ fontSize:12, color:K.muted, marginTop:4 }}>Потеряете день, есть риск штрафа 50/50.</div>
          </button>
          <button style={{ textAlign:'left', padding:'14px 16px', borderRadius:12, border:`1px solid ${K.line}`, background:K.white, cursor:'pointer', fontFamily:'inherit', color:K.ink }}>
            <div style={{ fontSize:14, fontWeight:700 }}>Пойти на штраф</div>
            <div style={{ fontSize:12, color:K.muted, marginTop:4 }}>−15 000 ₽ и −10 к репутации. Спокойно работаете дальше.</div>
          </button>
        </Col>
      </div>
    </Backdrop>
  </FakeStage>
);

// ───── VICTORY
const VictoryModal = () => (
  <div className="kb" style={{ width:1440, height:900, background:`radial-gradient(circle at 50% 20%, ${K.mintSoft}, ${K.paper} 60%)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
    <div style={{ width:640, textAlign:'center' }}>
      <Pill bg={K.mint} fg={K.white} size="md">ПОБЕДА · Неделя 31</Pill>
      <div style={{ fontSize:64, fontWeight:800, letterSpacing:'-0.04em', marginTop:20, lineHeight:1 }}>
        Вы&nbsp;выиграли.
      </div>
      <div style={{ fontSize:16, color:K.muted, marginTop:14, maxWidth:460, margin:'14px auto 0' }}>
        Магазин дошёл до 530 000 ₽ и устойчиво растёт. Контур окупился — и окупится ещё не раз.
      </div>

      <div style={{ marginTop:36, display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12 }}>
        {[
          ['Недель', '31'],
          ['Баланс', '532 400 ₽'],
          ['Репутация', '84'],
          ['Сервисов', '6 / 7'],
        ].map(([l, v]) => (
          <div key={l} style={{ background:K.white, border:`1px solid ${K.line}`, borderRadius:14, padding:16 }}>
            <div className="caps" style={{ fontSize:10, color:K.muted }}>{l}</div>
            <div className="tnum" style={{ fontSize:22, fontWeight:800, marginTop:6 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:24, padding:18, background:K.white, border:`1px solid ${K.line}`, borderRadius:14, textAlign:'left' }}>
        <Label>Достижения этой игры · 14 из 20</Label>
        <div style={{ marginTop:10, display:'flex', gap:10, flexWrap:'wrap' }}>
          {['Неделя без убытков','Репутация 80','Все синергии','Подключил Эльбу','Баланс 300k','Баланс 500k','Победа'].map(n => (
            <Pill key={n} bg={K.mintSoft} fg={K.mint}>{n}</Pill>
          ))}
        </div>
      </div>

      <Row gap={12} justify="center" style={{ marginTop:28 }}>
        <Btn kind="ghost">Посмотреть статистику</Btn>
        <Btn kind="mint" size="lg">Новая игра <Icon name="arrow" size={14} color={K.white}/></Btn>
      </Row>
    </div>
  </div>
);

// ───── GAME OVER
const GameOverModal = () => (
  <div className="kb" style={{ width:1440, height:900, background:K.ink, color:K.white, display:'flex', alignItems:'center', justifyContent:'center' }}>
    <div style={{ width:620, textAlign:'center' }}>
      <Pill bg="rgba(255,255,255,0.1)" fg="rgba(255,255,255,0.7)" border="rgba(255,255,255,0.15)">BANKRUPT · Неделя 7</Pill>
      <div style={{ fontSize:56, fontWeight:800, letterSpacing:'-0.03em', marginTop:22, lineHeight:1 }}>
        Бизнес закрыт.
      </div>
      <div style={{ fontSize:15, color:'rgba(255,255,255,0.6)', marginTop:14, maxWidth:460, margin:'14px auto 0' }}>
        Баланс ушёл в минус на неделе 7. Проверка без ЭДО забрала 15 000 ₽ — и их не оказалось.
      </div>

      <div style={{ marginTop:32, padding:20, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, textAlign:'left' }}>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', letterSpacing:'0.08em', textTransform:'uppercase' }}>Что можно было сделать</div>
        <Col gap={8} style={{ marginTop:10, fontSize:13, color:'rgba(255,255,255,0.85)' }}>
          <div>• Подключить <b>Диадок</b> до недели 5 — проверка прошла бы бесплатно.</div>
          <div>• Не запускать «Блогера» за 18 000 ₽ без подушки.</div>
          <div>• Взять микрозайм заранее, не в момент кассового разрыва.</div>
        </Col>
      </div>

      <div style={{ marginTop:22, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10 }}>
        {[['Недель', '7'], ['Максимум баланса', '98 200 ₽'], ['Сервисов подключил', '2']].map(([l, v]) => (
          <div key={l} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:14 }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', letterSpacing:'0.08em', textTransform:'uppercase' }}>{l}</div>
            <div className="tnum" style={{ fontSize:18, fontWeight:700, marginTop:6 }}>{v}</div>
          </div>
        ))}
      </div>

      <Row gap={12} justify="center" style={{ marginTop:28 }}>
        <Btn kind="ghost" style={{ background:'transparent', color:K.white, borderColor:'rgba(255,255,255,0.2)' }}>Сменить бизнес</Btn>
        <Btn kind="orange" size="lg">Попробовать снова <Icon name="arrow" size={14} color={K.white}/></Btn>
      </Row>
    </div>
  </div>
);

Object.assign(window, { WeekSummaryOverlay, WeekResultsOverlay, EventModal, VictoryModal, GameOverModal });
