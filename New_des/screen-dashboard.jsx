// Screen 1: Dashboard — Daily cycle.
// New direction: ink hero balance, mint+violet protagonists, orange reserved
// for alerts only. More textural weight, less SaaS-grey.

const HeaderBar = ({ business = 'Магазин', week = 5, day = 3, season = 'Лето', phase = 'actions' }) => {
  const phases = {
    summary: { label:'СВОДКА',   text:'Итоги прошлой недели',   tone:K.blue,   soft:K.blueSoft },
    actions: { label:'ДЕЙСТВИЯ', text:'Управляйте бизнесом',     tone:K.violet, soft:K.violetSoft },
    events:  { label:'СОБЫТИЯ',  text:'Требуется решение',       tone:K.violet, soft:K.violetSoft },
    results: { label:'ИТОГИ',    text:'Неделя завершается',      tone:K.mint,   soft:K.mintSoft },
  };
  const p = phases[phase];
  return (
    <div style={{ height:60, borderBottom:`1px solid ${K.line}`, background:K.white, display:'flex', alignItems:'center', padding:'0 24px', gap:16 }}>
      <div style={{ fontSize:14 }}>
        <span style={{ fontWeight:700 }}>{business}</span>
        <span style={{ color:K.muted }}> · Неделя {week} · День {day} из 7 · {season}</span>
      </div>
      <div style={{ flex:1 }}/>
      <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'7px 14px', borderRadius:999, background:p.soft }}>
        <span style={{ width:7, height:7, borderRadius:999, background:p.tone }}/>
        <span className="caps" style={{ fontSize:11, color:p.tone }}>{p.label}</span>
        <span style={{ fontSize:12, color:K.ink2 }}>— {p.text}</span>
      </div>
    </div>
  );
};

const MetricKPI = ({ label, value, sub, accent, tone, bg = K.white }) => (
  <div style={{ background: bg, border:`1px solid ${K.line}`, borderRadius:14, padding:14, position:'relative' }}>
    {tone && <div style={{ position:'absolute', left:0, top:12, bottom:12, width:3, background:tone, borderRadius:3 }}/>}
    <Label size={10}>{label}</Label>
    <div style={{ fontSize:22, fontWeight:700, marginTop:6, letterSpacing:'-0.02em' }} className="tnum">{value}</div>
    {sub && <div style={{ fontSize:11, color: accent || K.muted, marginTop:3 }}>{sub}</div>}
  </div>
);

const Dashboard = () => {
  return (
    <div className="kb" style={{ width:1440, height:900, background:K.paper, display:'flex' }}>
      <LeftRail active="dashboard"/>
      <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
        <HeaderBar phase="events"/>
        <div style={{ flex:1, overflow:'hidden', display:'grid', gridTemplateColumns:'280px 1fr 240px', gap:16, padding:18 }}>
          {/* Left col */}
          <Col gap={12}>
            {/* Ink hero balance */}
            <div style={{ background:K.ink, color:K.white, borderRadius:16, padding:18, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:999, background:`radial-gradient(circle, ${K.mint} 0%, transparent 70%)`, opacity:0.35 }}/>
              <div className="caps" style={{ fontSize:10, color:'rgba(255,255,255,0.55)' }}>Текущий баланс</div>
              <div style={{ fontSize:34, fontWeight:800, marginTop:6, letterSpacing:'-0.03em' }} className="tnum">142 350 ₽</div>
              <Row gap={6} style={{ marginTop:4, fontSize:12 }}>
                <span style={{ color:K.mint, fontWeight:700 }}>↑ +15 250 ₽</span>
                <span style={{ color:'rgba(255,255,255,0.5)' }}>вчера</span>
              </Row>
              <div style={{ marginTop:14, position:'relative', zIndex:1 }}>
                <Sparkline data={[82,78,85,92,88,94,110,105,118,127,142]} w={244} h={32} color={K.mint} fill="rgba(0,200,150,0.15)"/>
              </div>
            </div>

            <Card pad={16} radius={14} tone={K.mint}>
              <Row justify="space-between" align="flex-end">
                <Label size={10}>Энергия владельца</Label>
                <span className="tnum" style={{ fontSize:20, fontWeight:700 }}>64<span style={{ fontSize:12, color:K.muted, fontWeight:500 }}>%</span></span>
              </Row>
              <div style={{ marginTop:10 }}>
                <ProgressBar value={64} color={K.mint} h={8}/>
              </div>
              <div style={{ fontSize:11, color:K.muted, marginTop:8, lineHeight:1.45 }}>
                Устали, но держитесь. Отдохните в выходной или делегируйте закупки.
              </div>
            </Card>

            <Card pad={16} radius={14} tone={K.violet} bg={K.violetSoft} border={K.violetSoft}>
              <Label size={10}>Финансовое здоровье</Label>
              <Row gap={8} style={{ marginTop:8 }}>
                <div style={{ width:10, height:10, borderRadius:999, background:K.violet }}/>
                <div style={{ fontSize:16, fontWeight:700, color:K.violetInk }}>Устойчиво</div>
              </Row>
              <div style={{ fontSize:11, color:K.violetInk, marginTop:4, opacity:0.7 }}>
                Баланс на 3+ месяца расходов
              </div>
            </Card>
          </Col>

          {/* Center */}
          <Col gap={12} style={{ minWidth:0 }}>
            <Card pad={16} radius={14}>
              <Row justify="space-between">
                <Label size={10}>План на день</Label>
                <span style={{ fontSize:11, color:K.muted }}>2 / 3</span>
              </Row>
              <Col gap={8} style={{ marginTop:10 }}>
                {[
                  { d:true,  t:'Закупить партию молочки (≤ 2 дней на складе)' },
                  { d:true,  t:'Принять решение по событию «Негатив в соцсетях»' },
                  { d:false, t:'Запустить летнюю кампанию (рекомендация: «Акция выходного дня»)' },
                ].map((i, idx) => (
                  <Row key={idx} gap={10}>
                    <div style={{
                      width:18, height:18, borderRadius:5, border:`1.5px solid ${i.d ? K.mint : K.line}`,
                      background: i.d ? K.mint : 'transparent', display:'grid', placeItems:'center', flex:'0 0 18px', marginTop:1
                    }}>
                      {i.d && <Icon name="check" size={11} color={K.white}/>}
                    </div>
                    <div style={{ fontSize:13, color: i.d ? K.muted : K.ink, textDecoration: i.d ? 'line-through' : 'none' }}>{i.t}</div>
                  </Row>
                ))}
              </Col>
            </Card>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <Row justify="space-between" align="baseline">
                <Label size={10}>Активные события <span style={{ color:K.violet, marginLeft:6 }}>2</span></Label>
                <span style={{ fontSize:11, color:K.muted }}>Требуется решение, чтобы начать новый день</span>
              </Row>

              <div style={{ background:K.white, border:`2px solid ${K.violet}`, borderRadius:14, padding:16, position:'relative' }}>
                <div style={{ position:'absolute', top:-10, left:16, background:K.violet, color:K.white, padding:'2px 10px', borderRadius:999, fontSize:10, fontWeight:700, letterSpacing:'0.08em' }}>СРОЧНО</div>
                <Row gap={12} align="flex-start">
                  <div style={{ width:44, height:44, borderRadius:11, background:K.violetSoft, display:'grid', placeItems:'center', flex:'0 0 44px' }}>
                    <Icon name="alert" size={22} color={K.violet}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:15, fontWeight:700 }}>Негатив в соцсетях</div>
                    <div style={{ fontSize:13, color:K.ink2, marginTop:4, lineHeight:1.45 }}>
                      Клиент написал пост о просроченном товаре. Пост набирает охваты, −8 к репутации за сутки бездействия.
                    </div>
                    <Row gap={8} wrap style={{ marginTop:12 }}>
                      <Btn size="sm" kind="mint"><Icon name="check" size={13} color={K.white}/> Ответить через Эльбу</Btn>
                      <span style={{ fontSize:10, fontWeight:700, color:K.mint, letterSpacing:'0.08em', alignSelf:'center' }}>КОНТУР-ВАРИАНТ</span>
                      <Btn size="sm" kind="ghost">Извиниться лично</Btn>
                      <Btn size="sm" kind="ghost">Игнорировать</Btn>
                    </Row>
                  </div>
                </Row>
              </div>

              <Card pad={16} radius={14}>
                <Row gap={12} align="flex-start">
                  <div style={{ width:44, height:44, borderRadius:11, background:K.bone, display:'grid', placeItems:'center', flex:'0 0 44px' }}>
                    <Icon name="users" size={22}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:15, fontWeight:700 }}>Кассир просит прибавку</div>
                    <div style={{ fontSize:13, color:K.ink2, marginTop:4, lineHeight:1.45 }}>
                      Мария работает у вас 4 недели без ошибок. Хочет +10% к окладу. Отказ снизит лояльность сотрудника.
                    </div>
                    <Row gap={8} wrap style={{ marginTop:12 }}>
                      <Btn size="sm" kind="primary">Поднять на 10%</Btn>
                      <Btn size="sm" kind="ghost">Обсудить через неделю</Btn>
                      <Btn size="sm" kind="ghost">Отказать</Btn>
                    </Row>
                  </div>
                </Row>
              </Card>
            </div>

            <Card pad={14} radius={12}>
              <Row justify="space-between">
                <Row gap={10}>
                  <Icon name="queue" size={18}/>
                  <Label size={10}>Очередь к кассе</Label>
                </Row>
                <Row gap={6}>
                  <span style={{ fontSize:14, fontWeight:700 }}>4 чел.</span>
                  <Pill size="sm" bg={K.bone} fg={K.ink2}>Небольшая</Pill>
                </Row>
              </Row>
              <Row gap={4} style={{ marginTop:10 }}>
                {[1,1,1,1,0,0,0,0,0,0].map((v,i) => (
                  <div key={i} style={{ flex:1, height:8, borderRadius:3, background: v ? K.violet : K.lineSoft }}/>
                ))}
              </Row>
            </Card>
          </Col>

          {/* Right */}
          <Col gap={10}>
            <Label size={10}>KPI дня</Label>
            <MetricKPI label="Доход сегодня" value="18 740 ₽" sub="187 чеков"/>
            <MetricKPI label="Расходы сегодня" value="5 480 ₽" sub="закупка + аренда/день"/>
            <MetricKPI label="Чистая прибыль" value="+13 260 ₽" sub="↑ +12% к среднему" accent={K.good} tone={K.mint} bg={K.mintSoft}/>
            <MetricKPI label="Клиентов обслужено" value="142 / 160" sub="18 ушли — очередь"/>
            <Card pad={14} radius={12}>
              <Label size={10}>Репутация</Label>
              <Row justify="space-between" align="baseline" style={{ marginTop:6 }}>
                <span className="tnum" style={{ fontSize:20, fontWeight:700 }}>72<span style={{ color:K.muted, fontSize:12, fontWeight:500 }}> / 100</span></span>
                <Delta value={-2}/>
              </Row>
              <div style={{ marginTop:8 }}><ProgressBar value={72} color={K.violet}/></div>
            </Card>
            <Card pad={14} radius={12}>
              <Label size={10}>Лояльность</Label>
              <Row justify="space-between" align="baseline" style={{ marginTop:6 }}>
                <span className="tnum" style={{ fontSize:20, fontWeight:700 }}>58<span style={{ color:K.muted, fontSize:12, fontWeight:500 }}> / 100</span></span>
                <Delta value={3}/>
              </Row>
              <div style={{ marginTop:8 }}><ProgressBar value={58} color={K.mint}/></div>
            </Card>
          </Col>
        </div>

        <div style={{ borderTop:`1px solid ${K.line}`, background:K.white, padding:'12px 20px', display:'flex', alignItems:'center', gap:10 }}>
          <Btn kind="soft"><Icon name="plus" size={14}/> Закупить товар</Btn>
          <Btn kind="soft"><Icon name="megaphone" size={14}/> Реклама</Btn>
          <Btn kind="soft"><Icon name="users" size={14}/> Найм</Btn>
          <div style={{ flex:1 }}/>
          <Btn kind="primary" size="lg" disabled sub="Ответьте на событие">
            <Icon name="play" size={14} color={K.white}/> Следующий день
          </Btn>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Dashboard, HeaderBar });
