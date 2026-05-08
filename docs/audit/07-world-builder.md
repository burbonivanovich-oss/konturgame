# World-Builder Audit: «Бизнес с Контуром»

**Date:** 2026-05-07
**Auditor:** World-Builder Agent
**Scope:** npcs.ts, npcArcs.ts, npcEvents.ts, cityNewspaper.ts, eventChains.ts,
crisisEvents.ts, dailyMicroEvents.ts, personalEvents.ts, business.ts, promoCodes.ts

---

## 1. Setting Identity

### Current state

The game has no named city, no named district, no named street. All location
references are generic: «районная газета», «соседнее помещение», «торговый центр»,
«соседний квартал». The player chooses a business type but lands in a featureless
locale.

The only geography that exists is the layered hints in Tamara's arc — she mentions
the old «Овощи» and «Хлеб» shops that used to occupy the space, and she refers to
herself as the «эмоциональный барометр района». This is the strongest piece of
place-writing in the entire codebase.

Viktor's business is «через дорогу». Mikhail's daughter studies in Petersburg.
Denis calls from London. These gestures hint at a provincial Russian city
connected to a wider world, but they are never consolidated.

### Missing elements

- No city or district name. The newspaper masthead says nothing — it is simply
  «городская газета». This is a missed anchor. Even a fictional name
  («Привольск», «Озёрный», «Краевой») would raise internal consistency and
  let copy reference it naturally.
- No street or micro-neighbourhood. Without it, Viktor being «через дорогу»
  and Tamara arriving «почти каждый день» are asserted rather than felt.
- No establishment history for the player's space. Tamara implies the building
  has a past; no event or onboarding text capitalises on this.
- The business-type selector does not vary the setting. A beauty salon in a
  Soviet ground-floor flat feels different from a cafe in a converted garage.
  That distinction is currently zero.
- cityNewspaper.ts is the closest thing to a setting voice. Five issues over
  52 weeks is a thin skeleton. The headlines are generic («малый бизнес набирает
  обороты»); no issue names the city, the district, a local figure, or a
  specific event.

### Recommendations

1. Pick one name for the city (can be fictional). Propagate through newspaper
   masthead, Tamara's dialogue, and the onboarding «where you opened» line.
2. Give the street a name. Viktor and Tamara's lines become grounded for free.
3. Add one line in the BusinessSelector onboarding describing the physical
   space the player is moving into (what it was before, which floor, what
   the view is).

---

## 2. NPC Network

### Internal consistency audit

**Katya** is defined as «школьная подруга» in npcs.ts. personalEvents.ts has a
`PERS_FRIEND_*` track that also features a woman named Катя who offers 80 000 ₽
and has a daughter («Дочку взяла с собой»). This is a direct collision: the
npcArcs Katya has no children mentioned anywhere; the personalEvents Katya is
a different character who happens to share the same name. The player with
`personal: 'friend'` will encounter two Katyas simultaneously — one from the
arc, one from personal backstory — with no disambiguation.

**Mikhail** appears in two separate systems:
- `eventChains.ts` (mikhail_crisis, weeks 3-5): wife in hospital, predates the
  NPC arc system.
- `npcArcs.ts` (NPC_MIKHAIL_MEET, weeks 5-10): daughter in Petersburg.
Both can trigger in close proximity. The crisis chain characterises Mikhail as
someone who may flee with money (branch 2b), while the arc characterises him as
a reliable family man who only asks for help under duress. These are compatible
in tone, but the mechanic is contradictory: if mikhail_crisis fires first and
the player chooses the «help» branch, Mikhail returns loyally at week 3-5 — but
then the arc fires NPC_MIKHAIL_MEET at weeks 5-10 as if the player just met him.
The «встретиться» framing is factually wrong for a player who already has a
15-point relationship with him.

**Artem** is a «бывший коллега из корпорации». personalEvents.ts has
`PERS_CORP_EXCOLLEAGUE` — Лёша Виноградов, who also used to sit at the same desk.
No conflict, but no link either. The two could be distinguished or connected.

**Denis** is described as being «из Лондона» on first contact, yet is presented
as a feasible personal friend who can arrive in person for the TEST episode
(weeks 20-25). There is no mention of return travel, visa status, or remote-work
context. This creates mild implausibility for a casual player but is not a
hard contradiction.

**Tamara and Viktor**: Tamara's gossip event (NPC_TAMARA_GOSSIP) explicitly
mentions Viktor — «у Виктора за углом инспекция была». This is the only NPC
cross-reference in the entire codebase. It is good. It should be the template
for more.

**Irina Petrovна (мама)** and the generic «мама» in personalEvents.ts
(PERS_FREE_MOTHER_DROPIN): the NPC is listed as «Ирина Петровна — мама-наставница»
while personalEvents use «мама» without a name. For `personal: 'free'` players,
both can appear. They should either be consolidated (she is the NPC) or
explicitly different characters (his mother vs. a named NPC mentor).

**Gena** has no intersection with any other NPC. Given his comic role as the
recurring bad-idea machine, this is acceptable — but one missed opportunity is
a moment where Katya (the accountant) reacts to one of Gena's schemes. That
cross-reference would reward attentive players.

### Arc structure consistency

All eight arcs use the meet-test-resolve template correctly. Timing windows are
internally consistent (meet: days 35-70, test: 140-175, resolve: 245-315). No
timing conflicts were found between NPC arcs and each other.

However: Gena's arc is declared «not a classical arc» in the source comments but
the file still defines a single meet event. The seven standalone Gena scheme
events in npcEvents.ts use `requiresNpcRevealed: true`, meaning Gena's meet must
fire before any scheme can appear. The meet fires days 21-49; the first scheme
fires from day 70. This gap is fine. The issue: Gena's meet is in npcArcs.ts
(NPC_GENA_MEET) but there is no TEST or RESOLVE for Gena in that file, while
the schema header says «8 characters, each gets a 3-episode arc». The declaration
in the file header is inaccurate and will mislead a developer reading the code.

---

## 3. Calendar / Seasonality

### Year structure

The game runs 52 weeks. The year is implied to start in week 1 (January, given
the promo code year suffix «2026»). No month names are ever mentioned to the
player. No in-game calendar is surfaced.

### Seasonality in business.ts

Seasonality modifiers are defined per month (1-12 keys):

| Business | Months with modifier | Notes |
|----------|---------------------|-------|
| Shop | Jul +5%, Aug +5% | Summer uplift — plausible for district store |
| Cafe | Jan/Feb/Dec -15%, Jun/Jul/Aug +22% | Strong summer, winter dip — coherent |
| Beauty salon | Mar/Apr/May +12% | Spring pre-wedding season — coherent |

These are mechanically sane. The problem: they are invisible to the player.
No event, dialogue, or UI element explains why revenue dropped in January or
spiked in June. Tамара arriving every day is not linked to summer vs. winter.
Viktor's demise in the RESOLVE arc is not seasonally contextualised.

### Holidays and dates

Zero Russian public holidays appear anywhere in the code. This is a major
factual and tonal gap. Russian small business has extremely strong holiday
peaks and troughs:

- New Year (Jan 1-8): highest retail and cafe spend of the year in most cities.
  The shop currently has a 0% modifier for January; cafe has -15%. Both are
  wrong. The correct pattern for most Russian small retail is December peak,
  early January post-holiday trough, not a sustained winter dip starting in
  January.
- February 14 / 23 / March 8: three back-to-back gifting events in six weeks.
  A beauty salon would see +40-60% on the week before March 8. A flower shop
  or gift shop would see similar. Currently invisible.
- May holidays (May 1-9): the longest unofficial holiday stretch; significant
  for cafes (outdoor seating opens) and dacha-related retail.
- September «back to school»: relevant for a neighbourhood shop.

No dailyMicroEvent, npcEvent, or cityNewspaper headline refers to a specific
holiday or month by name. The newspaper's five issues are placed at weeks
10/20/30/40/50, which roughly maps to March/May/July/October/December for a
January start, but none of the headlines acknowledge season.

### Chronological consistency

There is one factual date anchor: promoCode year suffix is 2026. The game's
in-world year is therefore 2026. This is consistent with the today-date
context (2026-05-07). No other dates appear in the lore.

---

## 4. Factual Accuracy on Russian SMB

### 4.1 Kontур.ОФД — 54-ФЗ framing

**Accurate:** The description correctly states ОФД transmits cheques to FNS
under 54-FZ. The onboarding correctly calls out штраф up to 10 000 ₽ per
cheque without ОФД. This is factually correct (Article 14.5 KoAP: 75-100% of
sale amount for first violation, min 30 000 ₽ for legal entities; for sole
proprietors min 10 000 ₽).

**Inaccurate:** The in-game penalty framing says «штраф до 10 000 ₽ за каждый
чек». This is the sole-proprietor minimum, not the per-cheque formula. The
actual formula under 14.5.2 KoAP is a percentage of non-fiskalized revenue
(75-100%), not a flat per-cheque amount. The framing is directionally correct
(you will get fined) but factually imprecise.

**Missing:** The game does not model the obligation to re-register the cash
register (ФН — фискальный накопитель). ФН must be replaced every 13-36 months
depending on tax regime. This creates an asset cost the game ignores.

### 4.2 Kontур.Эльба — УСН framing

**Accurate:** Elba is correctly described as an online accounting tool for
sole proprietors (ИП) on the simplified tax system (УСН). The energy reduction
effect is conceptually sound.

**Inaccurate:** The game applies a flat 6% tax rate (ECONOMY_CONSTANTS.TAX_RATE).
УСН has two variants: 6% on revenue (доходы) or 15% on profit (доходы минус
расходы). For a small retail shop or salon buying goods for resale, 15% on profit
is often lower than 6% on revenue. The game defaulting to 6% is a simplification
that actively disadvantages the player relative to real SMB practice, and may
mislead players who pick up the game as an educational tool.

The game does not model страховые взносы (fixed mandatory insurance contributions
for ИП: approximately 50 000 ₽/year in 2026). These can be offset against УСН
доходы (up to 100% of налог for ИП without employees). This is one of the most
practically important tax facts for a new ИП.

**Inaccurate:** The Elba description says «кадровый учёт». Elba does not do full
payroll HR (kadrovoe) — it handles simplified payroll for small ИП. Actual kadrovoe
requires 1C or specialist software. This is a minor overstatement but relevant
since Artem's arc involves him as a hired employee with official compensation.

### 4.3 Контур.Диадок — ЭДО framing

**Accurate:** Diadic is correctly described as electronic document interchange
(ЭДО) for supplier contracts. The energy reduction is a reasonable proxy for the
time saved on paper flow.

**Questionable:** The description claims Diadoc «снижает налоговую нагрузку на
0.5% … ускорение оборота расходов». This reasoning is opaque. In reality ЭДО
does not by itself reduce tax burden; what it does is ensure закрывающие
documents arrive in the correct tax period so expenses are not deferred. The
game's effect (taxSaving: 0.005) is acceptable as a gameplay simplification but
the explanatory copy is misleading.

**Missing:** The game does not model that Diadic requires the supplier to also
be registered in ЭДО. A supplier like Mikhail — а small individual supplier —
is unlikely to be on Diadoc. This is a factual gap that contradicts the supplier
relationship design.

### 4.4 Контур.Банк — эквайринг framing

**Mostly accurate:** The claim that ~40% of customers leave without a card
terminal is directionally supported by Russian retail data (Sberbank data shows
cashless payments exceeded 70% of transactions in urban Russia by 2024; refusal
to accept cards drives churn). The 40% churn figure is reasonable for a
mid-sized city setting.

**Factual gap:** The acquiring commission (acquiringRate: 0.015 = 1.5%) is
currently not applied as a cost in the economy — it is listed as an effect but
the CLAUDE.md notes «creditRate удалён — займы используют свои ставки, эффект
был декларативным». This appears to be a dead value. In reality, a 1.5%
acquiring commission on all card sales is a real cost (ТСБ for small business
is 1.2-2.0%). If it is not modelled, the Bank service is effectively free
beyond its subscription cost, understating the real trade-off.

**Factual gap:** Контур.Банк in reality is an internet-bank service integrated
with Kontour's ecosystem, not a standalone acquiring service. The game correctly
treats it as «расчётный счёт + эквайринг» but the promo code offers «бесплатное
открытие расчётного счёта» — opening an account is always free (by law,
banks cannot charge for account opening). The promo should reference something
banks actually charge for, e.g., transaction fees or first-year SMS service.

### 4.5 ЕГАИС — alcohol licensing framing

The game's upgrade `liquor-cabinet` description says «открывает алкогольную
лицензию (нужен ОФД+Экстерн)». ЕГАИС is correctly modelled as a Маркет module.

**Factual gap:** A sole proprietor (ИП) is categorically prohibited from
selling alcohol at retail under Russian law (Federal Law 171-FZ). Only legal
entities (ООО) can obtain a retail alcohol licence. Since the game models the
player as an ИП (Elba is the tool for ИП on УСН), the alcohol category is
legally impossible for the player's entity type. This is a significant
factual error with reputational risk for Kontour as the publisher.

The correct approach: either the player entity should be an ООО (which changes
the tax framing), or alcohol should be removed from the shop upgrade tree with
a note that it requires reorganisation as an ООО.

### 4.6 Tax audit event (crisisEvents.ts)

The crisis event «Внеплановая налоговая проверка» describes a «камеральная
проверка по декларации». Камеральная проверка is a desk audit conducted without
visiting the premises; it is not «внеплановая» in the normal sense (it happens
automatically for every filed return). The actual unexpected/unplanned audit is
a «выездная налоговая проверка» (field audit), which requires a formal decision
and is conducted at the taxpayer's premises. The game conflates the two.

The Kontур.Экстерн option says «отчёт уже готов — отправить за час». For a
камеральная проверка, the issue is responding to the tax authority's request for
clarification documents, not re-filing. For a выездная, having Extern helps
with pre-filed correctness but does not resolve the visit itself. The framing is
imprecise.

### 4.7 Контур.Маркет — цена (annualPrice)

business.ts shows Маркет at 24 000 ₽/year. The CLAUDE.md table at the top
shows 48 000 ₽/year. This is a direct internal contradiction between the source-
of-truth file (business.ts) and the documentation. The audit cannot resolve
which is the intended price; the discrepancy should be flagged to the narrative
director.

### 4.8 Сезонность кафе в зимние месяцы

Cafe seasonality: January -15%, February -15%, December -15%. In Russian reality,
December is typically a cafe's strongest month (New Year corporate dinners,
Christmas gifts, holiday meals). January 1-8 is slow (people recover at home),
but from January 9 the urban cafe business recovers. The sustained -15% from
January through February before a zero-modifier March does not match the
real seasonal curve.

---

## 5. Antagonists and Pressure Systems

### Competitive pressure

Viktor is the only named competitor. He is a full NPC with a 3-arc trajectory
that ends in his closure. This is dramatically satisfying but leaves the player's
world feeling thin after week 35. The «конкурент открылся рядом» micro-event
(wed_competitor) references an unnamed new competitor who is never developed.

The crisis event CRISIS_STAFF_POACHING names «торговый центр» as the poaching
actor, without ever being developed. A shopping mall is an abstracted antagonist
— a missed opportunity for setting depth.

Mikhail's chain has an antagonist named «Анна Козлова» who appears in branches
2a and 2c. She is described as a competitor who uses Mikhail after the player
refuses him. She never appears again anywhere in the codebase. This is an
introduced-but-abandoned character — either she should have a presence elsewhere
or her name should be removed (an unnamed competitor has less whiplash).

### Regulatory pressure

Three events model regulatory contact:
1. «Письмо из налоговой» (fri_tax_letter, micro-event) — very lightweight,
   only energy and reputation effect.
2. «Внеплановая налоговая проверка» (crisis event) — mechanically significant.
3. «Тамара принесла слух» (NPC_TAMARA_GOSSIP) — indirectly references an
   inspection at Viktor's.

Missing: Роспотребнадзор (sanitary inspection — highly relevant for cafes and
beauty salons), пожарная инспекция (fire safety — can close premises), СЭС
(sanitary epidemiological station — mandatory for food service), labour
inspectors (трудовая инспекция — relevant when Artem is officially hired). These
are a daily reality for Russian SMB and their total absence leaves the regulatory
landscape feeling underpopulated.

### Supply chain pressure

Mikhail's crisis chain is the only supply disruption mechanic beyond micro-events.
The logistics crisis event (CRISIS_LOGISTICS_OVERREACH) creates one supply
emergency. No event models seasonal supply shortages, import substitution
pressures, or currency-linked input price spikes — all of which are lived
experience for Russian SMB owners in 2024-2026.

---

## 6. Recommendations (Prioritised)

### P1 — Fix factual errors (pre-ship blockers)

**R1.1 — Remove or gate the alcohol category for ИП.**
An ИП cannot legally retail alcohol in Russia. Either add a note in the UI
that alcohol requires restructuring to ООО, or remove the liquor-cabinet
upgrade from the shop tree entirely. The current state is a legal factual
error attributable to Kontour.

**R1.2 — Reconcile Контур.Маркет price.**
business.ts says 24 000 ₽/year; CLAUDE.md says 48 000 ₽/year. One is wrong.
Confirm with product and fix both files to match.

**R1.3 — Disambiguate the two Katyas.**
personalEvents.ts `PERS_FRIEND_*` uses «Катя» for a separate character who
has a daughter. The NPC Катя Михеева has no daughter. Either rename the
personal-track Katya, or declare them the same character in both files and
resolve the narrative tension (the NPC arc presupposes Katya doesn't offer
money; the personal event does exactly that).

**R1.4 — Fix December/January cafe seasonality.**
December should be a positive or neutral modifier for a cafe (not -15%).
The real-world Russian pattern for urban cafes: December +10-15%, January
1-8 slow, January 9+ recovery. Suggested: Dec 0 or +0.10, Jan -0.10.

### P2 — Lore coherence (recommended for launch)

**R2.1 — Name the city and street.**
Add a fictional city name and street name. Propagate to: newspaper masthead,
Tamara's references to the old «Овощи», Viktor's «через дорогу» line, and
the BusinessSelector onboarding. This is one hour of copy work with
disproportionate world-coherence payoff.

**R2.2 — Fix the Mikhail double-meet problem.**
The mikhail_crisis chain (weeks 3-5) and NPC_MIKHAIL_MEET (weeks 5-10) can
both fire with overlapping characterisation. If the crisis chain fires first
and relationship is established, the MEET event should either be suppressed or
its language adjusted to reflect prior acquaintance.

**R2.3 — Add 3-4 holiday-anchored events.**
At minimum: a New Year week event (week 52 or week 1), a March 8 event for
the salon, and a May holiday event for the cafe. These can be simple micro-
events (3 lines, 2 choices) but they ground the game's year in Russian lived
time. Tamara's calendar gift in her RESOLVE arc is a perfect model.

**R2.4 — Clarify the Irina Petrovna / «мама» collision.**
Either declare that Ирина Петровна is always the player's mother (and remove
the generic «мама» language from personalEvents.ts PERS_FREE_MOTHER_DROPIN),
or make them explicitly different characters. Current state is ambiguous.

### P3 — Depth (backlog / nice-to-have)

**R3.1 — Develop or retire Анна Козлова.**
She is named as a competitor in the mikhail_crisis chain but appears nowhere
else. Name her in one more event or replace her with «unnamed competitor» to
avoid the dangling reference.

**R3.2 — Add one sanitary/fire inspection event.**
A Роспотребнадзор visit for the cafe or salon, with a Контур product option
for resolving documentation, would be factually authentic and mechanically
consistent with the existing crisis format. One event is sufficient.

**R3.3 — Add страховые взносы as a visible fixed cost.**
Currently the game models only 6% УСН. The fixed ИП insurance payments
(~50 000 ₽/year) are invisible. Surfacing them — even as a single annual
event — would teach players about one of the most important but frequently
missed ИП obligations.

**R3.4 — One Gena/Katya cross-reference.**
A single Katya line reacting to Gena's latest scheme (discoverable if both
are revealed) would be the highest-payoff NPC cross-reference addition in
the game, costs one event entry, and reinforces both characters.

---

## Contradictions Check Summary

| Item | Status | Severity |
|------|--------|----------|
| Two Katyas (NPC vs personalEvents) | Contradiction | P1 |
| Mikhail double-meet (chain + arc) | Contradiction | P2 |
| Alcohol legal status for ИП | Factual error | P1 |
| Маркет price mismatch (24K vs 48K) | Contradiction | P1 |
| December cafe seasonality | Factual error | P1 |
| Камеральная vs выездная audit framing | Imprecision | P3 |
| ОФД штраф formula (per-cheque vs %) | Imprecision | P3 |
| Bank promo «бесплатное открытие» | Factual imprecision | P2 |
| Irina / generic «мама» collision | Ambiguity | P2 |
| Анна Козлова (dangling character) | Lore gap | P3 |
| Gena arc declared 3-episode in header | Documentation error | P3 |
| Denis in London vs in-person visits | Mild implausibility | P3 |
| Страховые взносы not modelled | Factual omission | P3 |
| ЭДО requires supplier participation | Factual omission | P3 |
| No holiday calendar | World gap | P2 |
| No city/district name | World gap | P2 |

---

## Source Files Audited

- `/home/user/konturgame/src/constants/npcs.ts` (version: Phase C, 8 NPCs)
- `/home/user/konturgame/src/constants/npcArcs.ts` (24 arc events)
- `/home/user/konturgame/src/constants/npcEvents.ts` (8 standalone + 7 Gena schemes)
- `/home/user/konturgame/src/constants/cityNewspaper.ts` (5 issues)
- `/home/user/konturgame/src/constants/eventChains.ts` (2 chains)
- `/home/user/konturgame/src/constants/crisisEvents.ts` (3 events)
- `/home/user/konturgame/src/constants/dailyMicroEvents.ts` (21 events)
- `/home/user/konturgame/src/constants/personalEvents.ts` (8 backstory events)
- `/home/user/konturgame/src/constants/business.ts` (configs, economy constants)
- `/home/user/konturgame/src/constants/promoCodes.ts` (3 codes)
- `/home/user/konturgame/src/constants/onboarding.ts` (cross-reference)
