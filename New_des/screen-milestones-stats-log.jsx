// Screens: Milestones, Statistics, Campaign ROI, Decision Log

// ───────── MILESTONES — violet primary
const MilestoneCard = ({ state, week, title, balTarget, balCur, profTarget, profCur, remainingWeeks, rewards }) => {
  const stateMap = {
    'in-progress': { pill:'В прогрессе', bg:K.violet,     fg:K.white, border:K.violet, band:K.violet },
    'done':        { pill:'Достигнута',  bg:K.mint,       fg:K.white, border:K.line,   band:K.mint },
    'skipped':     { pill:'Пропущена',   bg:K.bone,       fg:K.muted, border:K.line,   band:K.muted2 },
    'future':      { pill:'Впереди',     bg:K.bone,       fg:K.muted, border:K.line,   band:K.line },
  };
  const s = stateMap[state];
  return (
    <Card pad={20} radius={16} border={s.border} style={{
      position:'relative', overflow:'hidden',
      opacity: state === 'future' ? 0.7 : 1,
    }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:s.band }}/>
      <Row justify="space-between" align="flex-start">
        <Row gap={12}>
          <div style={{ width:46, height:46, borderRadius:12, background: state === 'done' ? K.mintSoft : state === 'in-progress' ? K.violetSoft : K.bone, display:'grid', placeItems:'center' }}>
            <Icon name="milestone" size={22} color={state === 'done' ? K.mint : state === 'in-progress' ? K.violet : K.muted}/>
          </div>
          <div>
            <div style={{ fontSize:18, fontWeight:800, letterSpacing:'-0.02em' }}>{title}</div>
            <div style={{ fontSize:12, color:K.muted, marginTop:2 }}>Неделя {week}</div>
          </div>
        </Row>
        <Pill bg={s.bg} fg={s.fg}>{s.pill}</Pill>
      </Row>

      <div style={{ marginTop:18 }}>
        <Row justify="space-between" style={{ fontSize:12, marginBottom:4 }}>
          <span style={{ color:K.muted }}>Баланс</span>
          <span className="tnum"><b>{fmt(balCur)} ₽</b> / {fmt(balTarget)} ₽</span>
        </Row>
        <ProgressBar value={balCur} max={balTarget} color={state === 'done' ? K.mint : K.violet} h={6}/>
      </div>
      <div style={{ marginTop:12 }}>
        <Row justify="space-between" style={{ fontSize:12, marginBottom:4 }}>
          <span style={{ color:K.muted }}>Прибыль за неделю</span>
          <span className="tnum"><b>{fmt(profCur)} ₽</b> / {fmt(profTarget)} ₽</span>
        </Row>
        <ProgressBar value={profCur} max={profTarget} color={state === 'done' ? K.mint : K.violet} h={6}/>
      </div>

      {state !== 'done' && state !== 'skipped' && (
        <div style={{ fontSize:12, color:K.muted, marginTop:12 }}>
          Осталось: <b className="tnum" style={{ color:K.ink }}>{remainingWeeks} недель</b>
        </div>
      )}

      <div style={{ marginTop:14, padding:12, background: state === 'done' ? K.mintSoft : K.bone, borderRadius:10 }}>
        <div className="caps" style={{ fontSize:10, color:K.muted, marginBottom:6 }}>Награда при достижении</div>
        <Col gap={4}>
          {rewards.map((r, i) => (
            <Row key={i} gap={8} style={{ fontSize:12 }}>
              <div style={{ width:4, height:4, borderRadius:999, background:K.ink, marginTop:7 }}/>
              <span>{r}</span>
            </Row>
          ))}
        </Col>
      </div>
    </Card>
  );
};

const Milestones = () => (
  <div className="kb" style={{ width:1440, height:900, background:K.paper, display:'flex' }}>
    <LeftRail active="milestone"/>
    <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
      <HeaderBar phase="actions"/>
      <div style={{ flex:1, overflowY:'auto', padding:'24px 40px' }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <div style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.02em' }}>Вехи</div>
          <div style={{ fontSize:13, color:K.muted, marginBottom:18 }}>Три ключевые точки роста — и большая цель к 52 неделе</div>

          <Row gap={12} style={{ marginBottom:20 }}>
            <Card pad={14} radius={12} style={{ flex:1 }}>
              <Label size={10}>Неделя</Label>
              <div style={{ fontSize:22, fontWeight:800, marginTop:6 }}>5 / 52</div>
            </Card>
            <Card pad={14} radius={12} style={{ flex:1 }}>
              <Label size={10}>Баланс</Label>
              <div style={{ fontSize:22, fontWeight:800, marginTop:6 }} className="tnum">142 350 ₽</div>
            </Card>
            <Card pad={14} radius={12} style={{ flex:1 }}>
              <Label size={10}>Прибыль последней недели</Label>
              <div style={{ fontSize:22, fontWeight:800, marginTop:6, color:K.good }} className="tnum">+42 800 ₽</div>
            </Card>
          </Row>

          <Col gap={12}>
            <MilestoneCard state="in-progress" week={10} title="Закрепиться" balTarget={200000} balCur={142350} profTarget={50000} profCur={42800} remainingWeeks={5} rewards={['+15 000 ₽ бонус','+1 к максимуму сотрудников','Разблокирует Диадок']}/>
            <MilestoneCard state="future"      week={20} title="Расти"       balTarget={350000} balCur={142350} profTarget={90000} profCur={42800} remainingWeeks={15} rewards={['+40 000 ₽ бонус','Стадия «Средний»','Разблокирует Экстерн']}/>
            <MilestoneCard state="future"      week={30} title="Победа"      balTarget={500000} balCur={142350} profTarget={150000} profCur={42800} remainingWeeks={25} rewards={['Ачивка «Стабильность»','Финальная концовка','Сохранение в историю']}/>
          </Col>
        </div>
      </div>
    </div>
  </div>
);

// ───────── STATISTICS — blue primary
const StatTile = ({ label, value, sub }) => (
  <Card pad={14} radius={12}>
    <Label size={10}>{label}</Label>
    <div style={{ fontSize:22, fontWeight:800, marginTop:6 }} className="tnum">{value}</div>
    {sub && <div style={{ fontSize:11, color:K.muted, marginTop:2 }}>{sub}</div>}
  </Card>
);

const Statistics = () => {
  const achievements = Array.from({ length: 20 }, (_, i) => ({
    done: i < 8,
    name: ['Первая неделя','Первый клиент','Первые 100k','Без просрочки','Баланс 150k','Все кампании','5 синергий','Нанял двоих',
           'Репутация 80','Неделя без убытков','Закрыл долг','Премиум-поставщик','Баланс 300k','3 стадии','Все улучшения',
           'Неделя 20','Все сервисы','7 синергий','Баланс 500k','Победа'][i] || `Ачивка ${i+1}`,
  }));
  return (
    <div className="kb" style={{ width:1440, height:900, background:K.paper, display:'flex' }}>
      <LeftRail active="stats"/>
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <HeaderBar phase="actions"/>
        <div style={{ flex:1, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, padding:16 }}>
          {/* Current */}
          <div style={{ overflowY:'auto', paddingRight:4 }}>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.02em' }}>Статистика</div>
            <div style={{ fontSize:13, color:K.muted, marginBottom:16 }}>Эта игра · №7</div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              <StatTile label="Неделя" value="5"/>
              <StatTile label="Баланс" value="142 350 ₽"/>
              <StatTile label="Стадия" value="Малый" sub="до «Развивающийся» — 2 из 3"/>
              <StatTile label="Репутация" value="72" sub="лояльность 58"/>
            </div>

            <Card pad={16} radius={14} style={{ marginBottom:16 }}>
              <Label>Прогресс игры</Label>
              <Col gap={10} style={{ marginTop:12 }}>
                {[
                  ['Активных сервисов', 3, 7, K.mint],
                  ['Достижений', 8, 20, K.blue],
                  ['Кампаний запущено', 4, 10, K.orange],
                  ['Вех достигнуто', 0, 3, K.violet],
                ].map(([n, a, b, c], i) => (
                  <div key={i}>
                    <Row justify="space-between" style={{ fontSize:12, marginBottom:4 }}>
                      <span>{n}</span>
                      <span className="tnum"><b>{a}</b> из {b}</span>
                    </Row>
                    <ProgressBar value={a} max={b} color={c} h={5}/>
                  </div>
                ))}
              </Col>
            </Card>

            <Card pad={16} radius={14}>
              <Row justify="space-between">
                <Label>Достижения</Label>
                <span style={{ fontSize:11, color:K.muted }}>8 из 20</span>
              </Row>
              <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:10 }}>
                {achievements.map((a, i) => (
                  <div key={i} style={{ textAlign:'center', opacity: a.done ? 1 : 0.35 }}>
                    <div style={{ width:44, height:44, margin:'0 auto', borderRadius:12, background: a.done ? K.blueSoft : K.bone, display:'grid', placeItems:'center' }}>
                      <Icon name={a.done ? 'rep' : 'lock'} size={20} color={a.done ? K.blue : K.muted}/>
                    </div>
                    <div style={{ fontSize:10, marginTop:6, color:a.done ? K.ink : K.muted, lineHeight:1.2, height:24 }}>{a.name}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* History */}
          <div style={{ overflowY:'auto', paddingLeft:4 }}>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.02em' }}>История</div>
            <div style={{ fontSize:13, color:K.muted, marginBottom:16 }}>Все попытки</div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, marginBottom:16 }}>
              <StatTile label="Всего игр" value="7"/>
              <StatTile label="Побед" value="1"/>
              <StatTile label="Средняя длина" value="18 нед."/>
              <StatTile label="Лучший баланс" value="530k ₽"/>
            </div>

            <Card pad={0} radius={14} style={{ marginBottom:16, overflow:'hidden' }}>
              <div style={{ padding:'10px 14px', background:K.bone, borderBottom:`1px solid ${K.line}` }}>
                <Row gap={8} style={{ fontSize:11, color:K.muted }} className="caps">
                  <div style={{ width:30 }}>#</div>
                  <div style={{ flex:1.2 }}>Бизнес</div>
                  <div style={{ width:70 }}>Недель</div>
                  <div style={{ width:80, textAlign:'right' }}>Итог</div>
                </Row>
              </div>
              {[
                { n:7, b:'Магазин',     w:5, r:'Идёт', c:K.blue },
                { n:6, b:'Кафе',        w:5,  r:'Банкротство', c:K.bad },
                { n:5, b:'Магазин',     w:31, r:'Победа',      c:K.good },
                { n:4, b:'Салон',       w:12, r:'Банкротство', c:K.bad },
                { n:3, b:'Кафе',        w:22, r:'Сдался',      c:K.muted },
                { n:2, b:'Магазин',     w:18, r:'Банкротство', c:K.bad },
                { n:1, b:'Магазин',     w:7,  r:'Банкротство', c:K.bad },
              ].map(g => (
                <Row key={g.n} gap={8} style={{ padding:'12px 14px', borderBottom:`1px solid ${K.lineSoft}`, fontSize:13 }}>
                  <div style={{ width:30, color:K.muted }} className="tnum">{g.n}</div>
                  <div style={{ flex:1.2 }}>{g.b}</div>
                  <div style={{ width:70 }} className="tnum">{g.w}</div>
                  <div style={{ width:80, textAlign:'right', color:g.c, fontWeight:600 }}>{g.r}</div>
                </Row>
              ))}
            </Card>

            <Card pad={16} radius={14}>
              <Label>Паттерны побед</Label>
              <Col gap={8} style={{ marginTop:10, fontSize:12 }}>
                <div><b style={{ color:K.good }}>Выигрышные игры:</b> 5+ сервисов Контура · подключили Эльбу до 10 недели · ≥ 2 кампании с ROI &gt; 50%</div>
                <div><b style={{ color:K.bad }}>Проигрышные игры:</b> 0–2 сервиса · игнорирование событий · нет подушки к 8 неделе</div>
              </Col>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// ───────── CAMPAIGN ROI — mint primary
const ROICampaignRow = ({ n, name, week, spent, revenue, roi, rank }) => (
  <Row gap={14} style={{ padding:'14px 16px', borderBottom:`1px solid ${K.lineSoft}` }}>
    {rank && <div style={{ width:28, fontSize:16, fontWeight:800, color: rank === 'best' ? K.mint : K.bad }}>#{n}</div>}
    <div style={{ flex:1 }}>
      <div style={{ fontSize:14, fontWeight:700 }}>{name}</div>
      <div style={{ fontSize:11, color:K.muted, marginTop:2 }} className="tnum">
        потрачено {rub(spent)} · выручка {rub(revenue)}
      </div>
    </div>
    <div style={{ width:80, textAlign:'right' }}>
      <div style={{ fontSize:11, color:K.muted }} className="tnum">Неделя {week}</div>
    </div>
    <div style={{ width:100, textAlign:'right' }}>
      <div className="tnum" style={{ fontSize:16, fontWeight:800, color: roi > 0 ? K.good : K.bad }}>
        {roi > 0 ? '+' : ''}{roi}%
      </div>
    </div>
  </Row>
);

const CampaignROI = () => (
  <div className="kb" style={{ width:1440, height:900, background:K.paper, display:'flex' }}>
    <LeftRail active="roi"/>
    <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
      <HeaderBar phase="actions"/>
      <div style={{ flex:1, overflowY:'auto', padding:'24px 32px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.02em' }}>Кампании · ROI</div>
          <div style={{ fontSize:13, color:K.muted, marginBottom:16 }}>Посмертный разбор — что сработало, что нет</div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, marginBottom:20 }}>
            <StatTile label="Запущено" value="4"/>
            <StatTile label="Потрачено" value="28 000 ₽"/>
            <StatTile label="Выручка" value="46 400 ₽"/>
            <StatTile label="Средний ROI" value="+66%" sub="цель: 50%+"/>
          </div>

          <Card pad={0} radius={14} style={{ marginBottom:16, overflow:'hidden' }}>
            <div style={{ padding:'14px 16px', borderBottom:`1px solid ${K.line}`, background:K.mintSoft }}>
              <Row gap={8}><div style={{ width:4, height:14, background:K.mint, borderRadius:2 }}/><Label color={K.mint}>Лучшие · топ-3 по ROI</Label></Row>
            </div>
            <ROICampaignRow n={1} name="Таргет ВК" week={4} spent={8000} revenue={12640} roi={58} rank="best"/>
            <ROICampaignRow n={2} name="Яндекс Директ" week={3} spent={15000} revenue={21300} roi={42} rank="best"/>
            <ROICampaignRow n={3} name="Листовки у входа" week={3} spent={3000} revenue={3720} roi={24} rank="best"/>
          </Card>

          <Card pad={0} radius={14} style={{ overflow:'hidden' }}>
            <div style={{ padding:'14px 16px', borderBottom:`1px solid ${K.line}`, background:'#fdf0ee' }}>
              <Row gap={8}><div style={{ width:4, height:14, background:K.bad, borderRadius:2 }}/><Label color={K.bad}>Худшие · антитоп</Label></Row>
            </div>
            <ROICampaignRow n={1} name="Блогер-обзор" week={2} spent={18000} revenue={15300} roi={-15} rank="worst"/>
            <div style={{ padding:'16px', color:K.muted, fontSize:12 }}>
              Ещё не запускали провальных кампаний. Блогеры — лотерея: половина даёт ROI &gt; 100%, половина уходит в минус.
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
);

// ───────── DECISION LOG — neutral
const LogFilterPill = ({ children, active }) => (
  <div style={{ padding:'6px 12px', borderRadius:999, fontSize:12, fontWeight:500, cursor:'pointer',
    background: active ? K.ink : 'transparent', color: active ? K.white : K.ink2,
    border: active ? `1px solid ${K.ink}` : `1px solid ${K.line}`,
  }}>{children}</div>
);

const LogEntry = ({ impact, week, type, text, kontur, npc }) => {
  const dir = impact > 0 ? { ch:'↑', c:K.good, bg:'#e6f7f1' } : impact < 0 ? { ch:'↓', c:K.bad, bg:'#fdeeec' } : { ch:'·', c:K.muted, bg:K.bone };
  return (
    <Row gap={14} style={{ padding:'14px 16px', borderBottom:`1px solid ${K.lineSoft}` }} align="flex-start">
      <div style={{ width:32, height:32, borderRadius:9, background:dir.bg, color:dir.c, display:'grid', placeItems:'center', fontSize:16, fontWeight:700, flex:'0 0 32px' }}>{dir.ch}</div>
      <div style={{ flex:1 }}>
        <Row gap={6} wrap>
          <Pill size="sm" bg={K.bone} fg={K.muted}>Неделя {week}</Pill>
          <Pill size="sm" bg={type === 'Контур' ? K.mintSoft : K.bone} fg={type === 'Контур' ? K.mint : K.muted}>{type}</Pill>
          {kontur && <Pill size="sm" bg={K.orangeSoft} fg={K.orange}>Контур</Pill>}
          {npc && <Pill size="sm" bg={K.violetSoft} fg={K.violet}>НПС · {npc}</Pill>}
        </Row>
        <div style={{ fontSize:13, marginTop:8, lineHeight:1.55 }}>{text}</div>
      </div>
    </Row>
  );
};

const DecisionLog = () => (
  <div className="kb" style={{ width:1440, height:900, background:K.paper, display:'flex' }}>
    <LeftRail active="log"/>
    <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
      <HeaderBar phase="actions"/>
      <div style={{ flex:1, overflowY:'auto', padding:'24px 40px' }}>
        <div style={{ maxWidth:820, margin:'0 auto' }}>
          <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.02em' }}>Журнал решений</div>
          <div style={{ fontSize:13, color:K.muted, marginBottom:16 }}>Всё, что вы сделали и что к вам пришло</div>
          <Row gap={8} wrap style={{ marginBottom:16 }}>
            <LogFilterPill active>Все</LogFilterPill>
            <LogFilterPill>Решения</LogFilterPill>
            <LogFilterPill>Контур</LogFilterPill>
            <LogFilterPill>Вехи</LogFilterPill>
            <LogFilterPill>НПС</LogFilterPill>
          </Row>

          <Card pad={0} radius={14} style={{ overflow:'hidden' }}>
            <LogEntry impact={+1} week={5} type="Контур" kontur text="Подключили ОФД. Автопроводка выручки в Банк сэкономила 47 200 ₽ за 5 недель."/>
            <LogEntry impact={-1} week={5} type="НПС" npc="Мария · кассир" text="Попросила прибавку +10%. Решение ещё не принято — событие активно."/>
            <LogEntry impact={0}  week={4} type="Решение" text="Вернулись к «Стандарт»-поставщику после провала с «Эконом». Потеряли 2 дня на переход."/>
            <LogEntry impact={+1} week={4} type="Кампания" text="Запустили «Таргет ВК» на 5 дней. ROI +58%, привели 34 новых клиента."/>
            <LogEntry impact={-1} week={3} type="Событие" text="Поставщик «Эконом» прислал партию творога с 5% браком. Списание 2 300 ₽ + −3 к репутации."/>
            <LogEntry impact={+1} week={3} type="Веха" text="Достигли стадии «Малый». Разблокированы кампании длиной &gt; 7 дней."/>
            <LogEntry impact={-1} week={2} type="Событие" text="Блогер-обзор не зашёл. ROI −15%, зато +12 подписчиков в соцсетях."/>
            <LogEntry impact={+1} week={2} type="Контур" kontur text="Подключили Банк. Расчётный счёт открыт за 1 день."/>
            <LogEntry impact={+1} week={1} type="Старт" text="Выбор: Магазин + история «Надоела корпорация». +10 к стартовой репутации."/>
          </Card>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { Milestones, Statistics, CampaignROI, DecisionLog });
