// Screens: Ecosystem, Finance, Marketing, Operations.

// ───────────── ECOSYSTEM — mint primary + blue supporting
const ServiceRow = ({ icon, name, tag, badge, badgeColor, body, right }) => (
  <Card pad={16} radius={14}>
    <Row gap={14} align="flex-start">
      <div style={{ width:44, height:44, borderRadius:10, background: badge === 'АКТИВНА' ? K.mintSoft : K.bone, display:'grid', placeItems:'center', flex:'0 0 44px' }}>
        <Icon name={icon} size={22} color={badge === 'АКТИВНА' ? K.mint : K.ink}/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <Row gap={8}>
          <div style={{ fontSize:15, fontWeight:700 }}>{name}</div>
          <span style={{ fontSize:11, color:K.muted }}>{tag}</span>
          {badge && <Pill size="sm" bg={badgeColor || K.mint} fg={K.white}>{badge}</Pill>}
        </Row>
        {body}
      </div>
      {right}
    </Row>
  </Card>
);

const Ecosystem = () => (
  <div className="kb" style={{ width:1440, height:900, background:K.paper, display:'flex' }}>
    <LeftRail active="eco"/>
    <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
      <HeaderBar phase="actions"/>
      <div style={{ flex:1, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 320px', gap:16, padding:16 }}>
        {/* Left */}
        <div style={{ overflowY:'auto', paddingRight:4 }}>
          {/* Hero */}
          <Card pad={24} radius={16} bg={K.ink} border={K.ink} style={{ color:K.white, marginBottom:16 }}>
            <div className="caps" style={{ fontSize:10, color:'rgba(255,255,255,0.55)' }}>Экосистема Контура</div>
            <div style={{ fontSize:32, fontWeight:800, letterSpacing:'-0.02em', marginTop:6 }}>Вы используете <span style={{ color:K.mint }}>3 из 7</span> сервисов</div>
            <Row gap={24} style={{ marginTop:16 }}>
              <div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)' }} className="caps">Накопленная экономия</div>
                <div style={{ fontSize:22, fontWeight:700, marginTop:2 }} className="tnum">127 500 ₽</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)' }}>за 5 недель</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)' }} className="caps">Синергии активны</div>
                <div style={{ fontSize:22, fontWeight:700, marginTop:2 }}>2 из 6</div>
              </div>
            </Row>
          </Card>

          <Label style={{ marginBottom:10 }}>Активные сервисы · 3</Label>
          <Col gap={10} style={{ marginBottom:20 }}>
            <ServiceRow icon="cart" name="Маркет" tag="Закупки и ассортимент" badge="АКТИВНА"
              body={<Row gap={24} style={{ marginTop:10 }}>
                <div><div style={{ fontSize:11, color:K.muted }} className="caps">Потрачено</div><div className="tnum" style={{ fontWeight:700 }}>18 000 ₽</div></div>
                <div><div style={{ fontSize:11, color:K.muted }} className="caps">Сэкономлено</div><div className="tnum" style={{ fontWeight:700, color:K.good }}>42 300 ₽</div></div>
                <div><div style={{ fontSize:11, color:K.muted }} className="caps">ROI</div><div className="tnum" style={{ fontWeight:700 }}>+135%</div></div>
              </Row>}
              right={<Btn kind="ghost" size="sm">Настроить</Btn>}
            />
            <ServiceRow icon="wallet" name="Банк" tag="Расчётный счёт" badge="АКТИВНА"
              body={<>
                <Row gap={24} style={{ marginTop:10 }}>
                  <div><div style={{ fontSize:11, color:K.muted }} className="caps">Потрачено</div><div className="tnum" style={{ fontWeight:700 }}>0 ₽</div></div>
                  <div><div style={{ fontSize:11, color:K.muted }} className="caps">Сэкономлено</div><div className="tnum" style={{ fontWeight:700, color:K.good }}>38 000 ₽</div></div>
                  <div><div style={{ fontSize:11, color:K.muted }} className="caps">ROI</div><div className="tnum" style={{ fontWeight:700 }}>∞</div></div>
                </Row>
                <div style={{ marginTop:12, padding:10, borderRadius:10, background:K.mintSoft }}>
                  <div className="caps" style={{ fontSize:10, color:K.mint, marginBottom:4 }}>Синергии</div>
                  <div style={{ fontSize:12 }}>• С ОФД — автопроводка выручки, −1 ч/день</div>
                  <div style={{ fontSize:12 }}>• С Эльбой — налог рассчитывается сам</div>
                </div>
              </>}
            />
            <ServiceRow icon="doc" name="ОФД" tag="Онлайн-касса" badge="АКТИВНА"
              body={<Row gap={24} style={{ marginTop:10 }}>
                <div><div style={{ fontSize:11, color:K.muted }} className="caps">Потрачено</div><div className="tnum" style={{ fontWeight:700 }}>3 000 ₽</div></div>
                <div><div style={{ fontSize:11, color:K.muted }} className="caps">Сэкономлено</div><div className="tnum" style={{ fontWeight:700, color:K.good }}>47 200 ₽</div></div>
                <div><div style={{ fontSize:11, color:K.muted }} className="caps">ROI</div><div className="tnum" style={{ fontWeight:700 }}>+1473%</div></div>
              </Row>}
            />
          </Col>

          <Label style={{ marginBottom:10 }}>Доступно к подключению · 2</Label>
          <Col gap={10} style={{ marginBottom:20 }}>
            <Card pad={16} radius={14}>
              <Row gap={14} align="flex-start">
                <div style={{ width:44, height:44, borderRadius:10, background:K.bone, display:'grid', placeItems:'center', flex:'0 0 44px' }}>
                  <Icon name="book" size={22}/>
                </div>
                <div style={{ flex:1 }}>
                  <Row gap={8}>
                    <div style={{ fontSize:15, fontWeight:700 }}>Эльба</div>
                    <span style={{ fontSize:11, color:K.muted }}>Бухгалтерия и налоги</span>
                  </Row>
                  <div style={{ fontSize:13, color:K.ink2, marginTop:6 }}>Рассчитывает налог УСН, готовит отчёты, платит за вас.</div>
                  <div style={{ fontSize:12, color:K.muted, marginTop:4 }}>Потенциал: ~<b style={{ color:K.ink }}>64 000 ₽/год</b></div>
                  <div style={{ marginTop:10, padding:'8px 10px', borderRadius:8, background:'#fff5f3', border:`1px solid ${K.orangeSoft}` }}>
                    <span style={{ fontSize:11, color:K.orange, fontWeight:700 }}>БЕЗ НЕГО:</span>
                    <span style={{ fontSize:12, color:K.ink2 }}> тратите 6 ч/нед на отчётность · потери ~18 000 ₽/год на штрафах</span>
                  </div>
                </div>
                <Col gap={8} align="flex-end">
                  <div className="tnum" style={{ fontSize:15, fontWeight:700 }}>12 000 ₽<span style={{ fontSize:11, color:K.muted, fontWeight:500 }}> / год</span></div>
                  <Btn kind="mint" size="sm">Подключить</Btn>
                </Col>
              </Row>
            </Card>
            <Card pad={16} radius={14}>
              <Row gap={14} align="flex-start">
                <div style={{ width:44, height:44, borderRadius:10, background:K.bone, display:'grid', placeItems:'center', flex:'0 0 44px' }}>
                  <Icon name="search" size={22}/>
                </div>
                <div style={{ flex:1 }}>
                  <Row gap={8}>
                    <div style={{ fontSize:15, fontWeight:700 }}>Фокус</div>
                    <span style={{ fontSize:11, color:K.muted }}>Проверка контрагентов</span>
                  </Row>
                  <div style={{ fontSize:13, color:K.ink2, marginTop:6 }}>Проверяет поставщиков на риски до заключения сделки.</div>
                  <div style={{ fontSize:12, color:K.muted, marginTop:4 }}>Потенциал: ~<b style={{ color:K.ink }}>28 000 ₽/год</b></div>
                </div>
                <Col gap={8} align="flex-end">
                  <div className="tnum" style={{ fontSize:15, fontWeight:700 }}>6 000 ₽<span style={{ fontSize:11, color:K.muted, fontWeight:500 }}> / год</span></div>
                  <Btn kind="ghost" size="sm">Подключить</Btn>
                </Col>
              </Row>
            </Card>
          </Col>

          <Label style={{ marginBottom:10 }}>Заблокировано · 2</Label>
          <Col gap={8}>
            {[
              { name:'Диадок · ЭДО',   week:8 },
              { name:'Экстерн · Отчётность', week:14 },
            ].map(s => (
              <div key={s.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:10, background:K.bone, border:`1px dashed ${K.line}` }}>
                <Icon name="lock" size={16} color={K.muted}/>
                <div style={{ flex:1, fontSize:13, color:K.muted }}>{s.name}</div>
                <div style={{ fontSize:11, color:K.muted }}>Разблокируется на неделе {s.week}</div>
              </div>
            ))}
          </Col>
        </div>

        {/* Right panel */}
        <Col gap={12} style={{ overflowY:'auto' }}>
          <Card pad={16} radius={14}>
            <Label>Активные синергии</Label>
            <Col gap={10} style={{ marginTop:10 }}>
              <div>
                <div style={{ fontSize:12, fontWeight:600 }}>Банк + ОФД</div>
                <div style={{ fontSize:11, color:K.muted, marginTop:2 }}>Автопроводка выручки · −1 ч/день</div>
              </div>
              <div style={{ borderTop:`1px solid ${K.lineSoft}`, paddingTop:10 }}>
                <div style={{ fontSize:12, fontWeight:600 }}>Маркет + ОФД</div>
                <div style={{ fontSize:11, color:K.muted, marginTop:2 }}>Точный прогноз закупок · −15% списаний</div>
              </div>
              <div style={{ borderTop:`1px solid ${K.lineSoft}`, paddingTop:10, opacity:0.5 }}>
                <div style={{ fontSize:12, fontWeight:600 }}>Эльба + Банк</div>
                <div style={{ fontSize:11, color:K.muted, marginTop:2 }}>Нужен Эльба</div>
              </div>
            </Col>
          </Card>
          <Card pad={16} radius={14} border={K.orangeSoft} bg="#fffaf5">
            <Label color={K.orange}>Потери без сервисов</Label>
            <Col gap={10} style={{ marginTop:10 }}>
              {[
                { name:'Эльба',  loss:5400 },
                { name:'Фокус',  loss:2300 },
                { name:'Диадок', loss:1200 },
              ].map(r => (
                <Row key={r.name} justify="space-between">
                  <div style={{ fontSize:12 }}>
                    <div style={{ fontWeight:600 }}>{r.name}</div>
                    <div style={{ color:K.muted, fontSize:11 }}>−{rub(r.loss)} / мес</div>
                  </div>
                  <Btn kind="ghost" size="sm">Подключить</Btn>
                </Row>
              ))}
            </Col>
          </Card>
        </Col>
      </div>
    </div>
  </div>
);

// ───────────── FINANCE — blue primary
const FinanceRow = ({ label, value, muted, sub }) => (
  <Row justify="space-between" style={{ padding:'10px 0', borderBottom:`1px solid ${K.lineSoft}` }}>
    <div>
      <div style={{ fontSize:13, fontWeight: muted ? 500 : 600, color: muted ? K.muted : K.ink }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:K.muted, marginTop:2 }}>{sub}</div>}
    </div>
    <div className="tnum" style={{ fontSize:14, fontWeight:600, color: muted ? K.muted : K.ink }}>{value}</div>
  </Row>
);

const Finance = () => (
  <div className="kb" style={{ width:1440, height:900, background:K.paper, display:'flex' }}>
    <LeftRail active="finance"/>
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <HeaderBar phase="actions"/>
      <div style={{ flex:1, overflowY:'auto', padding:'24px 40px' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.02em', marginBottom:4 }}>Финансы</div>
          <div style={{ fontSize:13, color:K.muted, marginBottom:20 }}>Где сейчас деньги, куда утекают, что делать</div>

          {/* KPI header */}
          <Row gap={12} align="stretch" style={{ marginBottom:16 }}>
            <Card pad={16} radius={14} style={{ flex:1.3 }}>
              <Label size={10}>Баланс</Label>
              <div style={{ fontSize:30, fontWeight:800, marginTop:6, letterSpacing:'-0.03em' }} className="tnum">142 350 ₽</div>
              <div style={{ marginTop:10 }}>
                <ProgressBar value={28} color={K.blue}/>
                <div style={{ fontSize:11, color:K.muted, marginTop:6 }}>28% до цели 500 000 ₽</div>
              </div>
            </Card>
            <Card pad={16} radius={14} style={{ flex:1 }}>
              <Label size={10}>Прибыль за неделю</Label>
              <div style={{ fontSize:24, fontWeight:800, marginTop:6, color:K.good }} className="tnum">+42 800 ₽</div>
              <Delta value={12} fmt={v => `+${v}% к неделе 4`}/>
            </Card>
            <Card pad={16} radius={14} style={{ flex:1 }}>
              <Label size={10}>Подписки Контур</Label>
              <div style={{ fontSize:24, fontWeight:800, marginTop:6 }} className="tnum">21 000 ₽<span style={{ fontSize:12, color:K.muted, fontWeight:500 }}> / год</span></div>
              <div style={{ fontSize:11, color:K.muted, marginTop:4 }}>3 активных сервиса</div>
            </Card>
          </Row>

          {/* Breakdown */}
          <Row gap={12} align="stretch" style={{ marginBottom:16 }}>
            <Card pad={18} radius={14} style={{ flex:1 }}>
              <Label>Доходы</Label>
              <div style={{ marginTop:10 }}>
                <FinanceRow label="Выручка от продаж" value="+86 400 ₽"/>
                <Row justify="space-between" style={{ padding:'14px 0 2px' }}>
                  <div style={{ fontSize:13, fontWeight:700 }}>Итого доходов</div>
                  <div className="tnum" style={{ fontSize:16, fontWeight:700, color:K.good }}>+86 400 ₽</div>
                </Row>
              </div>
            </Card>
            <Card pad={18} radius={14} style={{ flex:1 }}>
              <Label>Расходы</Label>
              <div style={{ marginTop:10 }}>
                <FinanceRow label="Закупки / ассортимент" value="−24 000 ₽"/>
                <FinanceRow label="Налог УСН 6%" value="−5 184 ₽"/>
                <FinanceRow label="Аренда и зарплата" value="−12 500 ₽"/>
                <FinanceRow label="Подписки Контур" value="−1 750 ₽" muted/>
                <FinanceRow label="Списание просрочки" value="−220 ₽" muted sub="партия #3 истекла"/>
                <Row justify="space-between" style={{ padding:'14px 0 2px' }}>
                  <div style={{ fontSize:13, fontWeight:700 }}>Итого расходов</div>
                  <div className="tnum" style={{ fontSize:16, fontWeight:700, color:K.bad }}>−43 654 ₽</div>
                </Row>
              </div>
            </Card>
          </Row>

          <Card pad={18} radius={14} border={K.orangeSoft} bg="#fffaf5" style={{ marginBottom:16 }}>
            <Label color={K.orange}>Потери от отсутствия сервисов</Label>
            <Col gap={10} style={{ marginTop:10 }}>
              <Row justify="space-between">
                <div style={{ fontSize:13 }}>Штрафы ФНС (без Эльбы)<div style={{ fontSize:11, color:K.muted }}>пропущен срок авансового платежа</div></div>
                <Row gap={12}><div className="tnum" style={{ fontWeight:700, color:K.bad }}>−3 500 ₽</div><Btn size="sm" kind="ghost">Подключить</Btn></Row>
              </Row>
              <Row justify="space-between">
                <div style={{ fontSize:13 }}>Плохой поставщик (без Фокуса)<div style={{ fontSize:11, color:K.muted }}>брак партии творога</div></div>
                <Row gap={12}><div className="tnum" style={{ fontWeight:700, color:K.bad }}>−2 300 ₽</div><Btn size="sm" kind="ghost">Подключить</Btn></Row>
              </Row>
            </Col>
          </Card>

          {/* Trend */}
          <Card pad={18} radius={14} style={{ marginBottom:16 }}>
            <Row justify="space-between">
              <Label>Динамика — последние 8 недель</Label>
              <span style={{ fontSize:11, color:K.muted }}>прибыль, ₽</span>
            </Row>
            <div style={{ marginTop:14 }}>
              <Sparkline data={[6200, 8400, 7100, 12800, 18200, 24400, 31000, 42800]} w={740} h={92} color={K.blue} fill="rgba(43,91,255,0.08)"/>
            </div>
            <Row justify="space-between" style={{ marginTop:10, fontSize:11, color:K.muted }} className="tnum">
              {['Н1','Н2','Н3','Н4','Н5','Н6','Н7','Н8'].map(w => <span key={w}>{w}</span>)}
            </Row>
          </Card>

          <Row gap={12} align="stretch" style={{ marginBottom:16 }}>
            <Card pad={18} radius={14} style={{ flex:1 }}>
              <Label>Прогноз</Label>
              <Col gap={10} style={{ marginTop:10 }}>
                {[
                  { p:'через 2 недели', v:'+ 62 000 ₽', s:'Хорошо',    c:K.good },
                  { p:'через 1 месяц',  v:'+ 98 400 ₽', s:'Хорошо',    c:K.good },
                  { p:'через 3 месяца', v:'+ 245 000 ₽', s:'Осторожно', c:K.warn, hint:'Добавьте Эльбу чтобы удержать темп' },
                ].map(r => (
                  <Row key={r.p} justify="space-between" align="flex-start">
                    <div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{r.p}</div>
                      {r.hint && <div style={{ fontSize:11, color:K.orange, marginTop:2 }}>→ {r.hint}</div>}
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div className="tnum" style={{ fontWeight:700 }}>{r.v}</div>
                      <div style={{ fontSize:11, color:r.c }}>{r.s}</div>
                    </div>
                  </Row>
                ))}
              </Col>
            </Card>
            <Card pad={18} radius={14} style={{ flex:1 }}>
              <Row justify="space-between"><Label>Займы</Label><Pill size="sm" bg={K.bone} fg={K.muted}>1 активный</Pill></Row>
              <Col gap={10} style={{ marginTop:10 }}>
                <div style={{ padding:12, borderRadius:10, border:`1px solid ${K.line}` }}>
                  <Row justify="space-between">
                    <div style={{ fontSize:13, fontWeight:600 }}>Стандартный · 100 000 ₽</div>
                    <div className="tnum" style={{ fontSize:12, color:K.muted }}>к неделе 9</div>
                  </Row>
                  <div style={{ fontSize:12, color:K.muted, marginTop:4 }}>К выплате: <b className="tnum" style={{ color:K.ink }}>115 000 ₽</b></div>
                  <div style={{ marginTop:8 }}><ProgressBar value={60} color={K.blue}/></div>
                  <Row gap={8} style={{ marginTop:10 }}>
                    <Btn kind="ghost" size="sm">Выплатить досрочно</Btn>
                    <span style={{ fontSize:11, color:K.warn, fontWeight:600 }}>⚠ Осталось 4 дня</span>
                  </Row>
                </div>
                <div style={{ fontSize:11, color:K.muted }}>Ещё доступно: микрозайм 50к · долгосрочный 200к</div>
              </Col>
            </Card>
          </Row>
        </div>
      </div>
    </div>
  </div>
);

// ───────────── MARKETING — mint primary with violet accent for active
const CampaignCard = ({ title, duration, price, clients, check, roi, status }) => {
  const disabled = status === 'disabled';
  const active = status === 'active';
  return (
    <Card pad={16} radius={14} style={{ opacity: disabled ? 0.7 : 1 }}>
      <div style={{ fontSize:15, fontWeight:700 }}>{title}</div>
      <Row gap={10} style={{ marginTop:4, fontSize:12, color:K.muted }}>
        <span>{duration} дней</span><span>·</span>
        <span className="tnum">{price}</span>
      </Row>
      <Col gap={4} style={{ marginTop:12, padding:10, background:K.bone, borderRadius:10 }}>
        <div style={{ fontSize:12 }}>+{clients}% клиентов</div>
        <div style={{ fontSize:12 }}>{check >= 0 ? '+' : ''}{check}% к среднему чеку</div>
      </Col>
      <Row justify="space-between" style={{ marginTop:12 }}>
        <div>
          <div className="caps" style={{ fontSize:10, color:K.muted }}>Ожид. ROI</div>
          <div className="tnum" style={{ fontSize:15, fontWeight:700, color: roi > 0 ? K.good : K.bad }}>
            {roi > 0 ? '+' : ''}{roi}%
          </div>
        </div>
        {active ? (
          <div style={{ width:120 }}>
            <div style={{ fontSize:11, color:K.violet, fontWeight:600, marginBottom:4 }}>День 3/5</div>
            <ProgressBar value={60} color={K.violet}/>
          </div>
        ) : (
          <Btn kind={disabled ? 'soft' : 'mint'} size="sm" disabled={disabled} sub={disabled ? 'Нужно ещё 4 200 ₽' : null}>
            Запустить
          </Btn>
        )}
      </Row>
    </Card>
  );
};

const Marketing = () => (
  <div className="kb" style={{ width:1440, height:900, background:K.paper, display:'flex' }}>
    <LeftRail active="mkt"/>
    <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
      <HeaderBar phase="actions"/>
      <div style={{ flex:1, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 320px', gap:16, padding:16 }}>
        <div style={{ overflowY:'auto', paddingRight:4 }}>
          <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.02em' }}>Маркетинг</div>
          <div style={{ fontSize:13, color:K.muted, marginBottom:16 }}>Каталог кампаний · 10 доступно</div>

          <Label style={{ marginBottom:10 }}>Активные · 1</Label>
          <Card pad={16} radius={14} style={{ marginBottom:20, background:K.violetSoft, borderColor:'transparent' }}>
            <Row justify="space-between" align="flex-start">
              <div>
                <Row gap={8}><div style={{ fontSize:15, fontWeight:700 }}>Акция выходного дня</div><Pill size="sm" bg={K.violet} fg={K.white}>АКТИВНА</Pill></Row>
                <div style={{ fontSize:12, color:K.violetInk, marginTop:4 }}>Осталось 2 из 5 дней</div>
                <div style={{ marginTop:10, width:320 }}><ProgressBar value={60} color={K.violet} track="rgba(255,255,255,0.6)"/></div>
              </div>
              <Btn kind="ghost" size="sm">Остановить</Btn>
            </Row>
          </Card>

          <Label style={{ marginBottom:10 }}>Каталог кампаний</Label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <CampaignCard title="Листовки у входа" duration={3} price="3 000 ₽" clients={12} check={0} roi={24}/>
            <CampaignCard title="Таргет ВК"        duration={5} price="8 000 ₽" clients={28} check={-3} roi={58}/>
            <CampaignCard title="Блогер-обзор"     duration={7} price="18 000 ₽" clients={62} check={5} roi={-15}/>
            <CampaignCard title="Скидка 20%"       duration={4} price="2 000 ₽" clients={34} check={-18} roi={8}/>
            <CampaignCard title="Программа лояльности" duration={14} price="12 000 ₽" clients={8} check={22} roi={112} status="disabled"/>
            <CampaignCard title="Яндекс Директ"    duration={7} price="15 000 ₽" clients={45} check={-2} roi={42}/>
          </div>
        </div>

        <Col gap={12} style={{ overflowY:'auto' }}>
          <Card pad={16} radius={14}>
            <Label>Последние кампании</Label>
            <Col gap={10} style={{ marginTop:10 }}>
              {[
                { n:'Таргет ВК',     r:58,  w:4 },
                { n:'Листовки',      r:24,  w:3 },
                { n:'Блогер-обзор',  r:-15, w:2 },
              ].map(c => (
                <Row key={c.n} justify="space-between">
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{c.n}</div>
                    <div style={{ fontSize:11, color:K.muted }}>Неделя {c.w}</div>
                  </div>
                  <div className="tnum" style={{ fontWeight:700, color: c.r > 0 ? K.good : K.bad }}>{c.r > 0 ? '+' : ''}{c.r}%</div>
                </Row>
              ))}
            </Col>
          </Card>
          <Card pad={16} radius={14} bg={K.mintSoft} border="transparent">
            <Label color={K.mintInk}>Совет · Лето</Label>
            <div style={{ fontSize:13, marginTop:8, lineHeight:1.5 }}>
              Летом средний чек в магазине падает, но объём растёт. Выбирайте кампании с упором на охват, а не на скидку.
            </div>
          </Card>
          <Card pad={16} radius={14}>
            <Label>Синергии</Label>
            <div style={{ fontSize:12, color:K.muted, marginTop:8, lineHeight:1.5 }}>
              С подключённым <b style={{ color:K.ink }}>ОФД</b> кампании точнее считают ROI — реальная выручка, а не самооценка.
            </div>
          </Card>
        </Col>
      </div>
    </div>
  </div>
);

Object.assign(window, { Ecosystem, Finance, Marketing, FinanceRow });
