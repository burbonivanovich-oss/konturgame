// Screen 0: Business Selector + Backstory (combined artboard)
// Accent: orange primary. No Left Rail.

const BusinessCard = ({ icon, title, desc, balance, clients, avg, rent, feature, selected }) => (
  <div style={{
    flex:1, background: selected ? K.white : K.white,
    border: `1.5px solid ${selected ? K.violet : K.line}`,
    borderRadius:18, padding:22, cursor:'pointer',
    boxShadow: selected ? '0 10px 40px -12px rgba(107,63,212,0.35), 0 0 0 4px rgba(107,63,212,0.10)' : '0 2px 8px -4px rgba(0,0,0,0.06)',
    position:'relative', transition:'box-shadow .2s',
  }}>
    {selected && (
      <div style={{ position:'absolute', top:14, right:14, width:24, height:24, borderRadius:999, background:K.violet, color:K.white, display:'grid', placeItems:'center' }}>
        <Icon name="check" size={14} color={K.white}/>
      </div>
    )}
    <div style={{ width:60, height:60, borderRadius:16, background: selected ? K.violetSoft : K.bone, display:'grid', placeItems:'center', marginBottom:16 }}>
      <Icon name={icon} size={30} color={selected ? K.violet : K.ink}/>
    </div>
    <div style={{ fontSize:24, fontWeight:800, letterSpacing:'-0.02em' }}>{title}</div>
    <div style={{ fontSize:13, color:K.muted, marginTop:4, marginBottom:18 }}>{desc}</div>
    <div style={{ borderTop:`1px solid ${K.lineSoft}`, paddingTop:14, display:'flex', flexDirection:'column', gap:9 }}>
      {[['Баланс', balance], ['Клиентов/день', clients], ['Средний чек', avg], ['Аренда/мес', rent], ['Особенность', feature]].map(([l, v]) => (
        <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
          <span style={{ color:K.muted }}>{l}</span>
          <span className="tnum" style={{ fontWeight:600 }}>{v}</span>
        </div>
      ))}
    </div>
  </div>
);

const BusinessSelector = () => (
  <div className="kb" style={{ width:1280, height:820, background:`linear-gradient(180deg, ${K.paper} 0%, ${K.paper2} 100%)`, display:'flex', flexDirection:'column', alignItems:'center', padding:'54px 64px' }}>
    <Row gap={12} style={{ marginBottom:6 }}>
      <Logo size={32}/>
      <div style={{ fontSize:18, fontWeight:700 }}>Бизнес <span style={{ color:K.muted, fontWeight:500 }}>с Контуром</span></div>
    </Row>
    <div style={{ fontSize:48, fontWeight:800, letterSpacing:'-0.03em', marginTop:28, textAlign:'center' }}>Выберите тип бизнеса</div>
    <div style={{ fontSize:15, color:K.muted, marginTop:8, textAlign:'center', maxWidth:520 }}>
      С каждым вариантом идёт своя механика, клиенты и сезон. Сменить бизнес потом можно только через новую игру.
    </div>
    <Row gap={20} align="stretch" style={{ marginTop:40, width:'100%', maxWidth:1080 }}>
      <BusinessCard icon="shop"  title="Магазин"       desc="Товары на полках, клиенты каждый день." balance="80 000 ₽" clients="15" avg="100 ₽" rent="50 000 ₽" feature="Склад, FIFO" selected />
      <BusinessCard icon="cafe"  title="Кафе"          desc="Готовая еда, напитки, утренний поток."  balance="80 000 ₽" clients="18" avg="70 ₽"  rent="60 000 ₽" feature="Сезонность" />
      <BusinessCard icon="salon" title="Салон красоты" desc="Услуги по записи, средний чек выше."    balance="80 000 ₽" clients="6"  avg="400 ₽" rent="55 000 ₽" feature="Нет склада" />
    </Row>
    <div style={{ marginTop:36, display:'flex', gap:16, alignItems:'center' }}>
      <div style={{ fontSize:13, color:K.muted }}>Выбрано: <b style={{ color:K.ink }}>Магазин</b></div>
      <Btn kind="violet" size="lg">Начать <Icon name="arrow" size={16} color={K.white}/></Btn>
    </div>
  </div>
);

// Backstory — 3 vertical cards, violet accent
const StoryCard = ({ icon, title, desc, bonus, selected }) => (
  <div style={{
    background:K.white, border:`1.5px solid ${selected ? K.violet : K.line}`, borderRadius:14,
    padding:'18px 20px', display:'flex', gap:16, alignItems:'flex-start',
    boxShadow: selected ? '0 0 0 4px rgba(107,63,212,0.10)' : 'none',
    cursor:'pointer',
  }}>
    <div style={{ width:44, height:44, borderRadius:12, background: selected ? K.violetSoft : K.bone, display:'grid', placeItems:'center', flex:'0 0 44px' }}>
      <Icon name={icon} size={22} color={selected ? K.violet : K.ink}/>
    </div>
    <div style={{ flex:1 }}>
      <div style={{ fontSize:16, fontWeight:700 }}>{title}</div>
      <div style={{ fontSize:13, color:K.muted, marginTop:4, lineHeight:1.45 }}>{desc}</div>
      <div style={{ fontSize:12, fontWeight:600, marginTop:8, color: selected ? K.violet : K.muted }}>→ {bonus}</div>
    </div>
    {selected && (
      <div style={{ width:22, height:22, borderRadius:999, background:K.violet, color:K.white, display:'grid', placeItems:'center', flex:'0 0 22px' }}>
        <Icon name="check" size={14} color={K.white}/>
      </div>
    )}
  </div>
);

const Backstory = () => (
  <div className="kb" style={{ width:1280, height:820, background:K.paper, display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 64px' }}>
    {/* Stepper */}
    <Row gap={10} style={{ marginBottom:4 }}>
      <Logo size={24}/>
      <div style={{ fontSize:13, color:K.muted }}>Предыстория · Шаг 1 из 2</div>
    </Row>
    <Row gap={6} style={{ marginTop:14, marginBottom:28 }}>
      <div style={{ width:48, height:4, background:K.violet, borderRadius:2 }}/>
      <div style={{ width:48, height:4, background:K.line, borderRadius:2 }}/>
    </Row>
    <div style={{ fontSize:34, fontWeight:800, letterSpacing:'-0.03em', textAlign:'center' }}>Как вы оказались здесь?</div>
    <div style={{ fontSize:14, color:K.muted, marginTop:8, textAlign:'center', maxWidth:520, marginBottom:28 }}>
      Ваш старт влияет на начальные ресурсы и пару ранних событий. Выбор не навсегда — репутация наберётся игрой.
    </div>
    <Col gap={12} style={{ width:'100%', maxWidth:720 }}>
      <StoryCard icon="bolt"  title="Надоела корпорация" desc="Десять лет в большом офисе. Вы знаете процессы наизусть — и устали от согласований. Пора строить своё." bonus="+10 репутации на старте" selected />
      <StoryCard icon="gift"  title="Выиграл грант"     desc="Неожиданный рывок. Стартовый капитал выше, но ожидания и отчётность — тоже." bonus="+40 000 ₽ к балансу, −5 энергии" />
      <StoryCard icon="spark" title="Так получилось"    desc="Классический путь. Минимум подушки, максимум мотивации не закрыться в первом квартале." bonus="−10 000 ₽ к балансу, +10 лояльности" />
    </Col>
    <Row gap={10} style={{ marginTop:28 }}>
      <Btn kind="ghost">Назад</Btn>
      <Btn kind="violet" size="lg">Далее <Icon name="arrow" size={16} color={K.white}/></Btn>
    </Row>
  </div>
);

Object.assign(window, { BusinessSelector, Backstory });
