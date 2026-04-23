// Screens: Operations, Warehouse, Reputation

// ───────── OPERATIONS — violet primary
const StageReq = ({ label, value, target, ok, warn }) => {
  const status = ok ? 'ok' : warn ? 'warn' : 'bad';
  const clr = ok ? K.good : warn ? K.warn : K.muted;
  return (
    <Row justify="space-between" style={{ padding:'8px 0' }}>
      <Row gap={8}>
        <div style={{ width:14, height:14, borderRadius:999, border:`1.5px solid ${clr}`, display:'grid', placeItems:'center' }}>
          {ok && <div style={{ width:6, height:6, borderRadius:999, background:K.good }}/>}
        </div>
        <div style={{ fontSize:13 }}>{label}</div>
      </Row>
      <div className="tnum" style={{ fontSize:12, color:K.muted }}>
        <span style={{ color:clr, fontWeight:600 }}>{value}</span> / {target}
      </div>
    </Row>
  );
};

const Operations = () => (
  <div className="kb" style={{ width:1440, height:900, background:K.paper, display:'flex' }}>
    <LeftRail active="ops"/>
    <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
      <HeaderBar phase="actions"/>
      <div style={{ flex:1, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, padding:16 }}>
        {/* Col 1 */}
        <Col gap={12} style={{ overflowY:'auto' }}>
          <div>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.02em' }}>Управление</div>
            <div style={{ fontSize:13, color:K.muted }}>Энергия · стадия · сотрудники · инструменты</div>
          </div>
          <Card pad={16} radius={14}>
            <Label>Энергия владельца</Label>
            <Row justify="space-between" align="flex-end" style={{ marginTop:6 }}>
              <div style={{ fontSize:28, fontWeight:800 }} className="tnum">64%</div>
              <span style={{ fontSize:11, color:K.muted }}>было 71% вчера</span>
            </Row>
            <div style={{ marginTop:10 }}><ProgressBar value={64} color={K.violet} h={8}/></div>
            <div style={{ fontSize:12, color:K.muted, marginTop:10, lineHeight:1.5 }}>
              При падении ниже 40% исчезает «План на день», случайные промахи в днях. Ниже 20% — недельные штрафы.
            </div>
          </Card>
          <Card pad={16} radius={14} tone={K.violet}>
            <Row justify="space-between">
              <Label>Стадия бизнеса</Label>
              <Pill size="sm" bg={K.violetSoft} fg={K.violet}>Малый</Pill>
            </Row>
            <div style={{ fontSize:14, color:K.muted, marginTop:8 }}>До стадии <b style={{ color:K.ink }}>Развивающийся</b></div>
            <div style={{ marginTop:8 }}>
              <StageReq label="Баланс" value="142 350 ₽" target="200 000 ₽" warn/>
              <StageReq label="Сотрудников" value="2" target="3"/>
              <StageReq label="Репутация" value="72" target="60" ok/>
            </div>
            <div style={{ marginTop:10, fontSize:11, color:K.muted }}>Осталось 2 из 3 условий</div>
          </Card>
          <Card pad={16} radius={14}>
            <Row justify="space-between">
              <Label>Инвестиции в себя</Label>
              <span style={{ fontSize:11, color:K.muted }}>2 из 6</span>
            </Row>
            <Col gap={8} style={{ marginTop:10 }}>
              {[
                { n:'Курс по бухучёту', d:true },
                { n:'Коуч по тайм-менеджменту', d:true },
                { n:'MBA для предпринимателей', d:false },
              ].map((i,k) => (
                <Row key={k} gap={8}>
                  <div style={{ width:16, height:16, borderRadius:5, border:`1.5px solid ${i.d ? K.violet : K.line}`, background: i.d ? K.violet : 'transparent', display:'grid', placeItems:'center' }}>
                    {i.d && <Icon name="check" size={10} color={K.white}/>}
                  </div>
                  <div style={{ fontSize:13, color: i.d ? K.muted : K.ink, textDecoration: i.d ? 'line-through' : 'none' }}>{i.n}</div>
                </Row>
              ))}
            </Col>
            <Btn kind="ghost" size="sm" style={{ marginTop:12 }}>Все инвестиции →</Btn>
          </Card>
        </Col>

        {/* Col 2 — employees */}
        <Col gap={12} style={{ overflowY:'auto' }}>
          <Card pad={16} radius={14}>
            <Row justify="space-between" align="center">
              <div>
                <Label>Сотрудники</Label>
                <div style={{ fontSize:22, fontWeight:800, marginTop:4 }} className="tnum">2 / 4</div>
              </div>
              <Btn kind="violet" size="sm"><Icon name="plus" size={13} color={K.white}/> Нанять</Btn>
            </Row>
            <div style={{ fontSize:11, color:K.muted, marginTop:4 }}>Лимит зависит от стадии. На «Развивающийся» лимит вырастет до 6.</div>
          </Card>
          {[
            { pos:'Кассир',    n:'Мария К.', salary:30000, eff:'Снижает очередь на 3 чел.' },
            { pos:'Помощник',  n:'Денис П.', salary:24000, eff:'+2 ед/день приёмки товара' },
          ].map(e => (
            <Card key={e.n} pad={16} radius={14}>
              <Row justify="space-between">
                <div>
                  <div style={{ fontSize:14, fontWeight:700 }}>{e.pos}</div>
                  <div style={{ fontSize:12, color:K.muted }}>{e.n}</div>
                </div>
                <div className="tnum" style={{ fontSize:13, fontWeight:600 }}>{rub(e.salary)} <span style={{ fontSize:11, color:K.muted, fontWeight:500 }}>/мес</span></div>
              </Row>
              <div style={{ marginTop:10, padding:10, borderRadius:8, background:K.bone, fontSize:12 }}>
                <span style={{ color:K.muted }}>Эффект: </span>{e.eff}
              </div>
              <Row gap={8} style={{ marginTop:10 }}>
                <Btn kind="ghost" size="sm">Повысить</Btn>
                <Btn kind="ghost" size="sm">Уволить</Btn>
              </Row>
            </Card>
          ))}
          <div style={{ padding:'14px 16px', border:`1px dashed ${K.line}`, borderRadius:12, fontSize:12, color:K.muted, textAlign:'center' }}>
            Нанят 2 из 4. Попробуйте «Менеджера» — разблокирует рекламные кампании на 14 дней.
          </div>
        </Col>

        {/* Col 3 — tools */}
        <Col gap={12} style={{ overflowY:'auto' }}>
          <Card pad={16} radius={14}>
            <Row justify="space-between">
              <Label>Поставщик</Label>
              <Pill size="sm" bg={K.bone} fg={K.muted}>Standard</Pill>
            </Row>
            <div style={{ fontSize:15, fontWeight:700, marginTop:8 }}>ООО «Молочный путь»</div>
            <Col gap={6} style={{ marginTop:8, fontSize:12 }}>
              <Row justify="space-between"><span style={{ color:K.muted }}>Цена</span><span className="tnum">120 ₽/ед.</span></Row>
              <Row justify="space-between"><span style={{ color:K.muted }}>Срок доставки</span><span>2 дня</span></Row>
              <Row justify="space-between"><span style={{ color:K.muted }}>Брак</span><span>~3%</span></Row>
            </Col>
            <Btn kind="ghost" size="sm" style={{ marginTop:12 }}>Сменить поставщика</Btn>
          </Card>
          <Card pad={16} radius={14}>
            <Row justify="space-between">
              <Label>Касса</Label>
              <Pill size="sm" bg={K.mintSoft} fg={K.mint}>ОФД подключён</Pill>
            </Row>
            <div style={{ fontSize:15, fontWeight:700, marginTop:8 }}>Эвотор 7.2</div>
            <div style={{ fontSize:12, color:K.muted, marginTop:4 }}>Пропускная способность: до 160 чеков/день</div>
            <div style={{ marginTop:10 }}><ProgressBar value={88} color={K.violet}/></div>
            <div style={{ fontSize:11, color:K.warn, marginTop:6 }}>Близки к пределу — 18 клиентов ушли вчера.</div>
            <Btn kind="ghost" size="sm" style={{ marginTop:12 }}>Сменить кассу</Btn>
          </Card>
          <Card pad={16} radius={14}>
            <Row justify="space-between">
              <Label>Улучшения бизнеса</Label>
              <span style={{ fontSize:11, color:K.muted }}>2 из 6</span>
            </Row>
            <Col gap={8} style={{ marginTop:10, fontSize:13 }}>
              <Row gap={8}><Icon name="check" size={14} color={K.good}/>Второй холодильник</Row>
              <Row gap={8}><Icon name="check" size={14} color={K.good}/>Терминал оплаты</Row>
              <Row gap={8} style={{ color:K.muted }}><Icon name="plus" size={14} color={K.muted}/>Витрина у окна</Row>
            </Col>
            <Btn kind="ghost" size="sm" style={{ marginTop:12 }}>Все улучшения →</Btn>
          </Card>
        </Col>
      </div>
    </div>
  </div>
);

// ───────── WAREHOUSE — mint primary
const Warehouse = () => (
  <div className="kb" style={{ width:1440, height:900, background:K.paper, display:'flex' }}>
    <LeftRail active="warehouse"/>
    <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
      <HeaderBar phase="actions"/>
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', padding:16 }}>
        <Row justify="space-between" style={{ marginBottom:16 }}>
          <div>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.02em' }}>Склад</div>
            <div style={{ fontSize:13, color:K.muted }}>Партии по FIFO · истекающие вначале</div>
          </div>
          <Row gap={8}>
            <Btn kind="ghost" size="sm"><Icon name="clipboard" size={14}/> Ассортимент</Btn>
            <Btn kind="mint" size="md"><Icon name="plus" size={14} color={K.white}/> Заказать товар</Btn>
          </Row>
        </Row>
        <div style={{ flex:1, display:'grid', gridTemplateColumns:'280px 1fr', gap:16, minHeight:0 }}>
          <Col gap={12} style={{ overflowY:'auto' }}>
            <Card pad={16} radius={14}>
              <Label>Заполненность</Label>
              <div style={{ fontSize:26, fontWeight:800, marginTop:6 }} className="tnum">384 <span style={{ fontSize:13, color:K.muted, fontWeight:500 }}>/ 500 ед.</span></div>
              <div style={{ marginTop:10 }}><ProgressBar value={76.8} color={K.mint}/></div>
              <div style={{ fontSize:11, color:K.muted, marginTop:8 }}>Нормально — 77% занято</div>
            </Card>
            <Card pad={16} radius={14}>
              <Label>Прогноз</Label>
              <div style={{ fontSize:13, marginTop:8, lineHeight:1.55 }}>
                При текущем спросе: <b>хватит на 6 дней</b>
              </div>
              <div style={{ fontSize:12, color:K.muted, marginTop:8 }}>Рекомендуемый заказ:</div>
              <div style={{ fontSize:18, fontWeight:700, marginTop:2 }} className="tnum">180 – 220 ед.</div>
            </Card>
            <Card pad={16} radius={14} border={K.orange} bg="#fffaf5">
              <Row gap={8}>
                <Icon name="alert" size={16} color={K.orange}/>
                <Label color={K.orange}>Срочно</Label>
              </Row>
              <div style={{ fontSize:13, fontWeight:700, marginTop:8 }}>Товар истекает!</div>
              <Col gap={8} style={{ marginTop:10 }}>
                <div style={{ fontSize:12 }}>
                  <div style={{ fontWeight:600 }}>Творог «Домик» · 18 ед.</div>
                  <div style={{ color:K.orange, marginTop:2 }}>истекает сегодня</div>
                </div>
                <div style={{ fontSize:12 }}>
                  <div style={{ fontWeight:600 }}>Йогурт фруктовый · 22 ед.</div>
                  <div style={{ color:K.orange, marginTop:2 }}>истекает завтра</div>
                </div>
              </Col>
              <Btn kind="orange" size="sm" style={{ marginTop:12 }}>Скидка 30%</Btn>
            </Card>
          </Col>

          <div style={{ overflowY:'auto', paddingRight:4 }}>
            <Label style={{ marginBottom:10 }}>Партии на складе · 6 активных</Label>
            <Col gap={10}>
              {[
                { n:1, name:'Творог «Домик»',  qty:18,  total:40,  days:0, danger:true },
                { n:2, name:'Йогурт фруктовый', qty:22, total:30, days:1, danger:true },
                { n:3, name:'Молоко 3.2%',      qty:58,  total:80,  days:3, warn:true },
                { n:4, name:'Кефир бабушкин',   qty:44,  total:60,  days:5 },
                { n:5, name:'Сметана 20%',      qty:92, total:120, days:8 },
                { n:6, name:'Сыр «Российский»', qty:150, total:170, days:14 },
              ].map(p => (
                <Card key={p.n} pad={14} radius={12} style={{ borderColor: p.danger ? K.orange : K.line, background: p.danger ? '#fffaf5' : K.white }}>
                  <Row gap={14}>
                    <div style={{ width:38, height:38, borderRadius:9, background: p.danger ? K.orangeSoft : p.warn ? '#fff5e8' : K.bone, display:'grid', placeItems:'center', fontSize:11, fontWeight:700, color: p.danger ? K.orange : p.warn ? K.warn : K.muted }} className="tnum">
                      #{p.n}
                    </div>
                    <div style={{ flex:1 }}>
                      <Row justify="space-between">
                        <div>
                          <div style={{ fontSize:14, fontWeight:700 }}>{p.name}</div>
                          <div style={{ fontSize:12, color:K.muted }}><span className="tnum">{p.qty}</span> из <span className="tnum">{p.total}</span> ед. осталось</div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontSize:12, color: p.danger ? K.orange : p.warn ? K.warn : K.muted, fontWeight:600 }}>
                            {p.days === 0 ? 'Истекает сегодня' : p.days === 1 ? 'Истекает завтра' : `через ${p.days} дн.`}
                          </div>
                        </div>
                      </Row>
                      <div style={{ marginTop:8 }}>
                        <ProgressBar
                          value={Math.max(5, (14 - Math.min(14, p.days)) * 7)} max={100}
                          color={p.danger ? K.orange : p.warn ? K.warn : K.mint}
                          h={5}
                        />
                      </div>
                    </div>
                  </Row>
                </Card>
              ))}
            </Col>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ───────── REPUTATION — mint + violet (two-axis)
const Reputation = () => (
  <div className="kb" style={{ width:1440, height:900, background:K.paper, display:'flex' }}>
    <LeftRail active="rep"/>
    <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
      <HeaderBar phase="actions"/>
      <div style={{ flex:1, overflow:'hidden', display:'grid', gridTemplateColumns:'300px 1fr', gap:16, padding:16 }}>
        <Col gap={12} style={{ overflowY:'auto' }}>
          <div>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.02em' }}>Репутация</div>
            <div style={{ fontSize:13, color:K.muted }}>Как вас видят клиенты</div>
          </div>
          <Card pad={18} radius={14} tone={K.mint}>
            <Label>Репутация</Label>
            <Row justify="space-between" align="flex-end" style={{ marginTop:6 }}>
              <div style={{ fontSize:40, fontWeight:800, letterSpacing:'-0.03em' }} className="tnum">72<span style={{ fontSize:16, color:K.muted, fontWeight:500 }}> / 100</span></div>
              <Delta value={-2}/>
            </Row>
            <div style={{ marginTop:10 }}><ProgressBar value={72} color={K.mint} h={7}/></div>
            <div style={{ marginTop:10, padding:10, borderRadius:8, background:K.mintSoft, fontSize:11, color:K.mintInk }}>
              При 0 три дня подряд — Game Over. Сейчас далеко.
            </div>
          </Card>
          <Card pad={18} radius={14} tone={K.violet}>
            <Label>Лояльность</Label>
            <Row justify="space-between" align="flex-end" style={{ marginTop:6 }}>
              <div style={{ fontSize:40, fontWeight:800, letterSpacing:'-0.03em' }} className="tnum">58<span style={{ fontSize:16, color:K.muted, fontWeight:500 }}> / 100</span></div>
              <Delta value={3}/>
            </Row>
            <div style={{ marginTop:10 }}><ProgressBar value={58} color={K.violet} h={7}/></div>
            <div style={{ fontSize:11, color:K.muted, marginTop:8 }}>+12% к среднему чеку от постоянных клиентов</div>
          </Card>
          <Card pad={18} radius={14}>
            <Label>Тренд, 7 дней</Label>
            <div style={{ marginTop:10 }}><Sparkline data={[68, 71, 74, 76, 77, 74, 72]} w={256} h={46} color={K.mint} fill="rgba(0,200,150,0.12)"/></div>
            <Row justify="space-between" style={{ marginTop:6, fontSize:10, color:K.muted }}>
              {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => <span key={d}>{d}</span>)}
            </Row>
          </Card>
        </Col>

        <div style={{ overflowY:'auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, gridAutoRows:'min-content' }}>
          <Card pad={18} radius={14}>
            <Row gap={8}><div style={{ width:4, height:14, background:K.good, borderRadius:2 }}/><Label>Что повышает</Label></Row>
            <Col gap={10} style={{ marginTop:12 }}>
              {[
                ['Ответ в соцсетях за 24 ч', '+2/событие'],
                ['Свежий товар (нет просрочки)', '+1/день'],
                ['Короткая очередь', '+1/день'],
                ['Позитивный отзыв', '+3/отзыв'],
              ].map(([f, e], i) => (
                <Row key={i} justify="space-between" style={{ fontSize:13 }}>
                  <span>{f}</span>
                  <span className="tnum" style={{ color:K.good, fontWeight:600 }}>{e}</span>
                </Row>
              ))}
            </Col>
          </Card>
          <Card pad={18} radius={14}>
            <Row gap={8}><div style={{ width:4, height:14, background:K.bad, borderRadius:2 }}/><Label>Что снижает</Label></Row>
            <Col gap={10} style={{ marginTop:12 }}>
              {[
                ['Просрочка на полке', '−2/день'],
                ['Очередь > 8 чел.', '−3/день'],
                ['Неотвеченный негатив', '−8/сутки'],
                ['Товар закончился', '−1/эпизод'],
              ].map(([f, e], i) => (
                <Row key={i} justify="space-between" style={{ fontSize:13 }}>
                  <span>{f}</span>
                  <span className="tnum" style={{ color:K.bad, fontWeight:600 }}>{e}</span>
                </Row>
              ))}
            </Col>
          </Card>
          <Card pad={18} radius={14} style={{ gridColumn:'span 2', background:K.bone, borderColor:K.line }}>
            <Label>Что сейчас влияет сильнее всего</Label>
            <Row gap={10} wrap style={{ marginTop:10 }}>
              {[
                ['Очередь у кассы', -3, K.bad],
                ['Свежий ассортимент', +2, K.good],
                ['Реклама ВК', +1, K.good],
                ['Нет ответа на пост в ВК', -8, K.bad],
              ].map(([n, v, c], i) => (
                <div key={i} style={{ padding:'8px 12px', background:K.white, border:`1px solid ${K.line}`, borderRadius:999, fontSize:12 }}>
                  <span>{n}</span> <span className="tnum" style={{ color: c, fontWeight:700, marginLeft:6 }}>{v > 0 ? '+' : ''}{v}</span>
                </div>
              ))}
            </Row>
          </Card>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { Operations, Warehouse, Reputation });
