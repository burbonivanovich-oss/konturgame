# Audit 24 — Localization (i18n)

**Date:** 2026-05-07  
**Auditor:** Localization Lead  
**Scope:** Full source tree under `src/` — constants, services, components, utils

---

## 1. Current State

There is **no i18n infrastructure** in this codebase. The game operates exclusively in Russian. The evidence:

- `package.json` lists no i18n library (no `react-i18next`, `@formatjs/intl`, `lingui`, or equivalents).
- `date-fns` is declared as a dependency but **never imported anywhere** in `src/`. It is dead weight.
- Every player-facing string is hardcoded at its point of use: inside JSX templates, inside `src/constants/*.ts` data structures, and inside service logic (`eventGenerator.ts`).
- `src/utils/format.ts` hardcodes the locale tag `'ru-RU'` in two `toLocaleString` calls, and in `eventGenerator.ts` a third call also passes `'ru-RU'` directly. There is no locale context or abstraction.
- No locale directory, no string table, no key-value file of any kind exists.

The game is a single-language product at present. Everything described in sections 2–8 describes the state that would need to be resolved before a second language could ship.

---

## 2. String Audit Stats

### Volume

| Category | Approx. Cyrillic lines |
|---|---|
| `services/eventGenerator.ts` | 178 |
| `constants/npcArcs.ts` | 131 |
| `constants/dailyMicroEvents.ts` | 92 |
| `constants/business.ts` | 90 |
| `constants/npcEvents.ts` | 72 |
| `constants/achievements.ts` | 70 |
| `components/views/FinanceView.tsx` | 63 |
| `components/views/DevelopmentView.tsx` | 62 |
| `constants/personalEvents.ts` | 53 |
| `components/MainScreen.tsx` | 51 |
| Other files (~25 more) | ~921 |
| **Total** | **~1 908 lines** |

A "line" here means any source line containing at least one Cyrillic character. Lines with both code and string content (e.g., `label: 'Аренда'`) are counted once. This is a conservative floor; the real translatable string count is higher because many lines contain multi-sentence narratives.

### String categories and rough counts

| Category | Approx. distinct strings | Notes |
|---|---|---|
| Narrative / NPC arc text | ~300 | Long prose, 1–6 sentences each |
| Event titles and descriptions | ~200 | Across arcs, micro-events, chains |
| Event option texts | ~250 | Short imperative phrases |
| UI labels, headers, buttons | ~350 | Scattered across all components |
| Achievement names + descriptions | ~60 | Two fields each, 30 achievements |
| Error / status messages | ~80 | Inline in JSX conditionals |
| Game-mechanic tooltips and hints | ~120 | OnboardingPanel, KLeftRail, etc. |
| **Estimated total distinct strings** | **~1 360** | Excluding duplicates |

The largest single extraction effort is the narrative layer: `npcArcs.ts`, `npcEvents.ts`, `eventChains.ts`, `personalEvents.ts`, `diary.ts`, `npcExits.ts`, and `VictoryModal.tsx` together contain several hundred paragraph-length strings that require literary translation, not just term substitution.

### Hardcode patterns found

1. **Object literals in constants files** — `name`, `description`, `title`, `text`, `body` fields are plain Russian strings assigned directly in TypeScript data arrays. Example: `achievements.ts`, `npcArcs.ts`, `dailyMicroEvents.ts`.
2. **Inline JSX string literals** — Labels, section headers, and status text written directly as JSX children. Common in `FinanceView.tsx`, `OperationsView.tsx`, `MainScreen.tsx`, `WeekResultsOverlay.tsx`.
3. **Template literals** — Constructed strings mixing variables and Russian text, e.g.:  
   `\`Осталось ${weeksLeft} нед.\``  
   `\`${totalRegisters} установлено\``  
   These are the hardest to extract because they require parameterized message format.
4. **`confirm()` / `alert()` calls** in `SettingsModal.tsx` — browser-native dialogs with hardcoded Russian strings that cannot be styled or localized via CSS.
5. **Conditional plural logic** — Four instances of manual Russian plural selection by numeric threshold (discussed in section 3).

---

## 3. Plural and Currency Handling

### Currency symbol

`formatRub` appends ` ₽` as a hardcoded suffix. This is correct for Russian but would need to change for any locale using a different currency symbol or placement convention. There is no `Intl.NumberFormat` call with `style: 'currency'`; the ruble sign is concatenated literally.

No pluralization is applied to the currency label itself — Russian does not pluralize the ₽ symbol, so this is not a defect for the current locale.

### Ruble pluralization: the missing piece

Russian requires three forms of every noun based on the last digit of the number: 1 → рубль, 2–4 → рубля, 5–20 and others → рублей. `formatRub` outputs only `₽` and never a word form, so this particular plural is avoided by design. However, the underlying number formatting (`toLocaleString('ru-RU')`) is correct and produces `1 000 ₽`, `23 500 ₽`, etc.

### Manual plural logic present in components

Four places implement ad-hoc Russian plural selection inline:

| File | Line (approx.) | Pattern |
|---|---|---|
| `OnboardingPanel.tsx` | 376 | `daysToWait === 1 ? 'день' : daysToWait < 5 ? 'дня' : 'дней'` |
| `EventModal.tsx` | 82 | `queueLength === 1 ? 'событие' : 'события'` (missing the third form for 5+) |
| `FinanceView.tsx` | 395 | `'Осталось … нед.'` (no plural, abbreviation avoids the issue) |
| `MobileMainScreen.tsx` | 267 | `'нед. до срока'` (abbreviation) |

The `EventModal.tsx` case is a latent bug: `queueLength === 2` → "ещё 2 события" is correct, but `queueLength === 5` → "ещё 5 события" is grammatically wrong in Russian (should be "событий"). For EN/KZ migration this would need to be replaced with a proper plural rule engine in any case.

ICU MessageFormat (used by both react-i18next and FormatJS) handles Russian plural forms via CLDR rules. Migration of these four sites would resolve the current latent bug simultaneously.

---

## 4. Date, Number, and Time Formats

### Numbers

`toLocaleString('ru-RU')` is called in three places:

- `src/utils/format.ts` lines 6 and 21
- `src/services/eventGenerator.ts` (one inline call)

Russian `ru-RU` uses non-breaking thin space as thousands separator and a comma as decimal separator. Both are correct for the target locale. For English (`en-US`) the output would need to switch to comma separator and period decimal. Because the locale tag is hardcoded as a string literal, adding a second locale requires threading a locale parameter through `formatNumber` and every call site.

### Dates

No date formatting exists. The game tracks time as `currentWeek` (integer 1–52) and `currentDay` (integer 0–6, days within a week). There are no calendar dates rendered anywhere — no "12 марта" or "2024-03-12" style output. The `date-fns` dependency declared in `package.json` is unused. This is actually advantageous: there is no date localisation debt to pay.

### Time

No clock times are rendered. No 12h/24h ambiguity exists.

---

## 5. RTL Readiness

The codebase is **zero percent RTL-ready**. Findings:

- All layout uses `flexDirection: 'row'` without logical CSS properties. Every `justify-content: space-between` with `textAlign: 'right'` assumes LTR reading order.
- No `dir` attribute is set on the root `<html>` or on any container.
- No `margin-inline-start / margin-inline-end`, no `padding-inline-*`, no `inset-inline-*`. All spacing uses physical `margin-left`, `margin-right`, `padding-left`, `padding-right` expressed either in inline style objects or Tailwind physical utilities.
- `KLeftRail` (the main navigation sidebar) is physically positioned on the left with pixel widths. For Arabic/Hebrew it would need to be mirrored to the right.
- Progress bars and the `KStatusBar` indicators flow left-to-right unconditionally.
- The `KHeaderBar` season/week label string is an uninterrupted LTR string.
- Georgian, Arabic and Hebrew scripts would require font assets that are not loaded; the single `@import` in `design.css` loads Manrope (Latin + Cyrillic only).

**Verdict:** Supporting Arabic or Hebrew would require a full layout audit, introduction of CSS logical properties across all components, a `dir="rtl"` toggle on the document root, and an appropriate Arabic/Hebrew font. This is a multi-week engineering effort separate from the string extraction work.

---

## 6. Layout Risks for Variable-Length Text

### Current situation

All container widths in the UI are fixed pixel values or `flex: 1` stretches. Text that overflows is handled in an inconsistent manner:

- `minWidth: 0` is used in several flex children to allow shrinkage (good practice).
- No `text-overflow: ellipsis` or `white-space: nowrap` is applied to string slots that have a fixed-width parent. Text simply wraps.
- Button labels are plain inline strings with no minimum height set. Multi-line button text will increase button height unpredictably.

### Risk by component

| Component | Risk | Notes |
|---|---|---|
| `KHeaderBar` week/day label | Medium | Single line, space constrained on mobile |
| `KLeftRail` nav item labels | High | Fixed-width sidebar; German labels ~30% longer |
| Event option buttons in `EventModal.tsx` | High | Two-column layout at 2 options; German prose option text would overflow columns |
| KPI tiles in `FinanceView.tsx` (3-column grid) | High | `gridTemplateColumns: '1.3fr 1fr 1fr'` — center and right tiles have no overflow protection |
| Achievement name + description in `AchievementsModal.tsx` | Medium | Description line can grow to 2–3 lines |
| Loan option buttons in `FinanceView.tsx` | Low | Short format strings |
| `BusinessSelector.tsx` stat rows | Medium | Fixed label column |

The `EventModal.tsx` two-column option layout is the highest single risk. Russian option texts already run to 50–70 characters. German equivalents at +35% would be 68–95 characters in the same horizontal space. The `useHorizontal` flag (activated when there are 2+ options) would need a character-count threshold or auto-sizing to avoid visual breakage.

### Fixed-width pixel containers

The `DesktopKontur` wrapper and `KLeftRail` use explicit pixel widths (found in `design-system/` tokens and layout components). These will need to be expressed as `min-width` / `max-width` pairs or replaced with relative units to give longer translations room.

---

## 7. Unicode Considerations

### Ё (yo)

The codebase uses both `ё` and `е` in narrative text. Examples found:
- `'Поставщик задерживает доставку на день.'` — no ё
- NPC arc descriptions use `ё` correctly in many places

There is no automated check enforcing consistent ё usage. For Russian translation quality this is a known friction point: inconsistent ё/е is the most common Russian localisation complaint. A linting pass or style guide note is warranted.

### Non-breaking space

`formatRub` inserts a regular space between the number and ₽ symbol. Russian typographic convention calls for a non-breaking thin space (U+202F) between a number and its unit symbol to prevent line breaks at that point. The current space (U+0020) can cause a line break between "23 500" and "₽" on narrow containers. This is a minor cosmetic defect visible on the mobile layout.

Recommended fix: change `return \`${formatNumber(n)} ₽\`` to `return \`${formatNumber(n)} ₽\`` in `format.ts`.

### Typographic quotation marks

Narrative strings consistently use Russian «guillemets» («…»). This is correct for Russian but would need to change to "curly quotes" for English and to the appropriate convention for Kazakh. Because the marks are embedded in translatable string content (not applied by CSS), translators would need to apply them manually or a post-processing step would need to normalise them per locale.

### Em dash

Em dashes (—) appear frequently in narrative text, used correctly in Russian. English convention uses em dash without spaces; Russian uses em dash with spaces on both sides. The embedded spacing must be handled per locale.

---

## 8. Stack Recommendation

Three candidates are relevant to this stack (React 18, Vite, TypeScript):

### Option A: react-i18next (recommended)

**Why:** Largest ecosystem, best TypeScript support via `i18next-resources-to-backend` and the `I18nextProvider`. The `Trans` component handles JSX with interpolated variables cleanly. Plural rules are handled by i18next's built-in CLDR-backed plural resolver — supports Russian (three forms) and Kazakh out of the box. Excellent Vite integration. Active maintenance, wide adoption in game UIs.

**Trade-offs:** Adds two packages (`i18next` + `react-i18next`, ~35 KB gzipped). Requires wrapping the app in `I18nextProvider`. ICU MessageFormat is available via `i18next-icu` plugin if needed.

### Option B: FormatJS / react-intl

**Why:** The industry standard for ICU MessageFormat, which handles plural rules, gender agreement, and number/date formatting in a single consistent syntax. Used by large-scale production applications.

**Trade-offs:** Heavier than i18next (~55 KB). The `defineMessages` + `intl.formatMessage` API is more verbose than i18next's `t()`. Better fit if ICU's full feature set (select, plural, number skeletons) is needed from day one. For a game with primarily narrative content, this level of formalism may be premature.

### Option C: Lingui

**Why:** Compile-time extraction — the `t` macro is stripped and strings are collected at build time with no runtime overhead. Excellent TypeScript integration. ICU MessageFormat support.

**Trade-offs:** Requires a Babel or SWC macro plugin in the Vite config. Adds build complexity. The compile-time extraction model is harder to retrofit onto existing hardcoded strings than a runtime library.

**Recommendation: react-i18next.** It has the lowest adoption barrier for this stack, its `t('key')` migration pattern is the most mechanical to apply to existing hardcoded strings, and its plural resolver already handles Russian three-form plurals correctly without custom code. The `nsCombined` namespace pattern aligns naturally with the existing file structure (`constants/npcArcs.ts` → `locales/ru/npc_arcs.json`).

---

## 9. Migration Plan

This plan assumes the team decides to add English as a second language. The plan scales proportionally for Kazakh.

### Phase 0 — Prerequisites (0.5 days, tools-programmer)

1. Install `i18next` + `react-i18next`. Configure in `main.tsx` with `I18nextProvider`.
2. Create locale directory structure: `public/locales/ru/` and `public/locales/en/`.
3. Configure Vite to serve `public/locales/` as static assets.
4. Agree on namespace split: `ui`, `events`, `npc`, `achievements`, `finance`, `onboarding`.

### Phase 1 — String extraction from constants (3–4 days, localization lead + tools-programmer)

Extract all translatable strings from `src/constants/*.ts` into JSON locale files under `public/locales/ru/`. This is the largest single block:

- `npcArcs.ts`, `npcEvents.ts` → `locales/ru/npc.json` (~115 keys for arcs alone, ~80 for standalone events)
- `dailyMicroEvents.ts` → `locales/ru/events.json` (~90 keys)
- `achievements.ts` → `locales/ru/achievements.json` (~60 keys)
- `business.ts`, `businessTiers.ts`, `employees.ts`, `cashRegisters.ts`, `onboarding.ts` → `locales/ru/ui.json` (~200 keys)
- `npcExits.ts`, `diary.ts`, `personalEvents.ts`, `eventChains.ts` → `locales/ru/npc.json` additions (~120 keys)

The TypeScript data structures in constants files can remain in place during this phase but their string fields become key lookups at render time.

**Estimated total keys in Phase 1:** ~700

### Phase 2 — Component extraction (2–3 days, ui-programmer + localization lead)

Replace hardcoded strings in `src/components/` with `t('namespace:key')` calls:

- `MainScreen.tsx`, `MobileMainScreen.tsx` (~50 lines each)
- `WeekResultsOverlay.tsx`, `WeekSummaryOverlay.tsx`
- All 14 modals in `src/components/modals/`
- All 6 views in `src/components/views/`
- Design system components: `KHeaderBar`, `KLeftRail`, `KStatusBar`

Replace all four manual plural sites with `i18next` plural key conventions (key `_one`, `_few`, `_many` for Russian; `_one`, `_other` for English). Fix the latent bug in `EventModal.tsx` (missing third form).

**Estimated additional keys in Phase 2:** ~350

### Phase 3 — Format.ts locale-awareness (0.5 days)

- Replace hardcoded `'ru-RU'` in `format.ts` with a locale parameter sourced from the i18next language state.
- Consider switching to `Intl.NumberFormat` for currency, which handles symbol placement, decimal, and grouping per locale without manual string construction.
- Fix the non-breaking thin space defect (U+202F before ₽).
- Remove unused `date-fns` dependency from `package.json`.

### Phase 4 — English translation (external, 3–5 days translator time)

Send the ~1 050 extracted keys (with context comments and character limits) to a native English-speaking translator familiar with SaaS/business game vocabulary. The glossary must be established before this phase:

- Контур product names stay as-is (branded terms)
- Business domain terms: аренда → rent, выручка → revenue, чек → order value, etc.
- NPC names: stay as-is (Russian names are part of the game's identity)

### Phase 5 — Layout validation (1–2 days, ux-designer + localization lead)

- Run pseudolocalization (artificially 35% longer strings) across all UI states.
- Fix overflow in `EventModal.tsx` two-column option buttons.
- Fix `KLeftRail` nav label overflow.
- Fix KPI tile overflow in `FinanceView.tsx`.
- Validate `MainScreen.tsx` header bar on mobile viewport widths.

### Phase 6 — Kazakh (if scoped)

Kazakh uses Cyrillic script (same font coverage as Russian), left-to-right layout, and different plural rules (two forms: one and other). Migration cost after Phase 1–5 is roughly: translation effort + 2 days for format differences (Kazakh uses period as decimal separator vs Russian comma, and currency display conventions differ for KZT).

### Total engineering estimate (EN only, no RTL)

| Phase | Effort |
|---|---|
| Phase 0: tooling setup | 0.5 days |
| Phase 1: constants extraction | 3–4 days |
| Phase 2: component extraction | 2–3 days |
| Phase 3: format.ts | 0.5 days |
| Phase 4: EN translation | 3–5 days (external) |
| Phase 5: layout validation | 1–2 days |
| **Total** | **10–15 engineering days + translator time** |

RTL (Arabic/Hebrew) would add a separate 2–3 week layout engineering effort and is not recommended to scope until the LTR second language is stable.

---

## Summary of Critical Findings

1. **No i18n infrastructure exists.** Zero abstraction between source code and Russian text.
2. **~1 908 lines of Cyrillic content** are hardcoded across ~40 source files. Narrative strings in `npcArcs.ts` and `npcEvents.ts` are the deepest extraction challenge because they carry authorial voice that demands literary translation, not term substitution.
3. **`formatNumber` is locale-locked** to `'ru-RU'`. A locale context thread must be introduced before any second language can format numbers correctly.
4. **One active plural bug:** `EventModal.tsx` line 82 — `queueLength === 5` produces "5 события" (wrong; should be "5 событий").
5. **Non-breaking thin space** between number and ₽ is missing. Minor cosmetic defect, one-line fix.
6. **RTL is zero-effort-invested.** Arabic/Hebrew would require a separate layout engineering project.
7. **`date-fns` is a dead dependency** — declared in `package.json`, never imported in production code. Remove it.
8. **`confirm()` / `alert()` in SettingsModal** use browser-native dialogs. These bypass any i18n layer and cannot be styled. They should be replaced with in-game modal dialogs during the migration.
