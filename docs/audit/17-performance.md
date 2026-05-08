# Performance Audit — Бизнес с Контуром
**Date:** 2026-05-07 | **Analyst:** performance-analyst | **Build:** konturgame v0.1.0

---

## 1. Render Hotspots (Re-render Storm)

**Severity: Critical**

The god-store pattern is the root cause of the most severe render problem in the codebase. `gameStore.ts` holds a single Zustand store with 50+ fields covering entirely unrelated domains: balance, NPCs, ad campaigns, loans, onboarding state, stock batches, milestone flags, UI phases, and more. Every action that touches any field — including `nextDay()`, `advanceWeek()`, and even `setBalance()` — triggers a state object replacement, which Zustand broadcasts to every subscriber.

`MainScreen.tsx` demonstrates the problem concretely: `DashboardView` calls `const store = useGameStore()` at line 66 with no selector. This subscribes the component to the entire store object. Any state change anywhere — an NPC memory entry appended, a promo code flag flipped, `weeklyEnergyRestored` toggled — forces `DashboardView` to re-render in full, including its derived computations (`getActiveSynergies`, `getTotalThroughput`, `batchesWithInfo` map+sort+slice, `getCurrentTier`, `getNextTier`).

The pre-audit finding of 28 files using `useGameStore()` without selectors means this pattern is pervasive across all views and modals. Each of those 28 call sites re-renders on every state write regardless of whether the component's visible data changed.

Two additional render risks:

- **Inline object literals in JSX style props.** `DashboardView` creates new object references on every render for grid container styles, card backgrounds, and the KPI strip array. React cannot bail out of re-rendering children because the props always appear changed.
- **Derived arrays computed inline.** `batchesWithInfo` (map + sort + slice) and `SERVICE_ACCENT`/`SERVICE_SHORT` record literals are reconstructed on every render with no memoization. With 28 unselectored subscribers, these run far more often than necessary.

**Hypothesis:** Adding granular selectors to the top 5 heaviest components (`DashboardView`, `OperationsView`, `FinanceView`, `StatisticsView`, `WeekResultsOverlay`) should reduce re-render count by 60–75% under normal gameplay.

---

## 2. Bundle Size Risks

**Severity: High**

`date-fns` v3 is listed as a production dependency in `package.json`. The library ships tree-shakeable ESM, but only if imports are granular (e.g., `import { format } from 'date-fns/format'`). A barrel import (`import { format, parseISO, ... } from 'date-fns'`) can pull 70–90 KB gzip into the bundle. Given that the game already has `src/utils/format.ts` as its single money-formatting utility, `date-fns` appears unused or used trivially. If it is dead code, removing it eliminates the dependency entirely. If it is used, imports must be audited for barrel usage.

`vite.config.ts` has no `build.rollupOptions.output.manualChunks` configuration. Vite will produce a single JS chunk containing React 18, Zustand, all 14+ constants files, all 14+ service files, all 30+ components, and all 14 modals. For a browser game launched via a URL, this means the player waits for the entire codebase to parse and execute before the `BusinessSelector` screen renders. A conservative estimate for a project of this scope: 400–600 KB uncompressed JS.

No font preconnect or preload directives are present anywhere in the config. The CLAUDE.md notes "Lab Grotesque K шрифт не существует" — meaning a font request is being fired for a nonexistent typeface, generating a 404 on every page load. Manrope is imported twice, doubling the font payload for that typeface (typically 40–80 KB per weight file).

**Hypothesis:** Code-splitting modals and views into lazy chunks (`React.lazy` + `Suspense`) should cut initial parse time by 35–50%. Removing `date-fns` (if dead) saves 70–90 KB gzip.

---

## 3. localStorage I/O Frequency

**Severity: High**

The store persists to `localStorage` under key `konturgame_state_v7`. The state object has 50+ fields including arrays of arbitrary depth: `stockBatches`, `employees`, `loans`, `campaignROI`, `decisionLog`, `npcs` (8 NPCs each with memory entries and relationship history), `activeChainIds`, `pendingEventsQueue`, and more. A `JSON.stringify` of this object in a mature game session will produce 10–30 KB of JSON.

The pre-audit finding confirms `saveToStorage` fires 30–80 times per day tick. Each game day advances through `advanceDay()` → `processWeek()` → multiple intermediate state mutations, each potentially triggering a persist write if Zustand middleware is configured naively. At 80 writes/day × 10 KB average = 800 KB of serialization work per game day, all synchronous on the main thread.

`localStorage` writes are synchronous and block the main thread. A 10 KB `JSON.stringify` + `setItem` takes approximately 0.5–2 ms on a mid-range mobile device. At 80 writes/day, that is 40–160 ms of blocking I/O per game day — enough to produce visible jank on the day-advance button press.

**Hypothesis:** Debouncing `saveToStorage` to fire at most once per user interaction (trailing 500 ms debounce) should reduce write frequency by 90%+ and eliminate localStorage-induced jank entirely.

---

## 4. Algorithm Complexity (processWeek, eventGenerator)

**Severity: Medium**

`processWeek()` in `weekCalculator.ts` runs 7 sequential day iterations. Each day invokes `economyEngine`, `painEngine`, `synergyEngine`, `eventGenerator`, `achievementChecker`, and `npcManager`. This is `O(7 × services × events × npcs)` per week advance. With 7 services, ~40 possible events per `eventGenerator`, and 8 NPCs with arc state checks, a single `advanceWeek()` call performs hundreds of conditional evaluations synchronously.

`achievementChecker.ts` iterates all ~17 achievements on every day tick, even achievements that have already been unlocked. There is no early-exit once an achievement is awarded; the checker appears to evaluate the full set each time.

`eventGenerator` must scan `triggeredEventIds` (an ever-growing array) on every call to avoid re-triggering. As the game progresses, this linear scan grows. By week 40+, `triggeredEventIds` could contain 100+ entries, making each event eligibility check `O(n)` per candidate event.

**Hypothesis:** Pre-filtering already-achieved achievements into a `Set` and tracking triggered event IDs as a `Set<string>` instead of `string[]` reduces lookup cost to `O(1)` and eliminates quadratic growth in late-game event generation.

---

## 5. Lists Without Virtualization

**Severity: Medium**

Several views render unbounded lists with no windowing:

- `DecisionLogView` renders every `DecisionLogEntry` in `decisionLog`. This grows by 1+ entries per week; by week 50, it contains 50–150 DOM nodes, each with styled text and timestamps.
- `StatisticsView` renders per-day or per-week history arrays that grow unboundedly.
- `NPCRosterModal` renders all 8 NPCs with their full opinion stacks (memory entries with deltas). Each NPC memory can accumulate dozens of entries.
- `FinanceView` renders transaction or campaign history arrays.

None of these use `react-window`, `react-virtual`, or even a simple `slice(-50)` cap. On mobile, rendering 100+ DOM nodes in a scrollable container is a layout and paint bottleneck, especially combined with the re-render storm from unselected store subscriptions.

**Hypothesis:** Capping rendered history to the most recent 50 entries (with a "load more" trigger) eliminates DOM bloat with zero library additions and reduces paint time by an estimated 40–60% in late-game sessions.

---

## 6. Mobile-Specific Risks

**Severity: Medium**

`ResponsiveLayout.tsx` switches between `MainScreen` and `MobileMainScreen`. The mobile path does not appear to lazy-load — both component trees are imported at the top level, meaning both are parsed and executed on every device type regardless of which layout is shown.

The KPI strip in `DashboardView` uses a CSS grid with `gridTemplateColumns: '1.6fr 1fr 1fr 1fr'`. On viewports under 380 px this will render four cards in a single row at approximately 80 px each, producing illegible text. No `@media` breakpoints are applied to this grid (it uses inline `style` props, not Tailwind classes that would benefit from responsive variants).

The 404 font request for "Lab Grotesque K" fires on every load on every device. On mobile, a failed font request can delay text rendering (FOIT) if the browser waits for the font to resolve before painting text. This is compounded by the double Manrope import: the browser may request the same font file twice, burning mobile bandwidth.

Inline `style` objects throughout `DashboardView` (confirmed in the first 200 lines) prevent the browser from caching style computations across renders, since each render produces new object references. This is more expensive on mobile CPUs where style recalculation is the primary rendering bottleneck.

**Hypothesis:** Fixing the Lab Grotesque 404 and deduplicating Manrope reduces per-load network overhead by 40–80 KB on mobile. Lazy-loading `MobileMainScreen` on desktop (and vice versa) eliminates one full component tree from the parse budget.

---

## 7. Top-7 Wins (by Descending Impact)

### Win 1 — Granular Zustand Selectors (Impact: Critical)
Replace `const store = useGameStore()` with field-specific selectors in all 28 affected files. Example: `const balance = useGameStore(s => s.balance)`. Start with the 5 heaviest components (DashboardView, WeekResultsOverlay, OperationsView, FinanceView, StatisticsView).
**Measurable hypothesis:** Re-render count on day-advance drops from ~28 component re-renders per state write to 2–4 targeted re-renders. Frame time for button press drops from 16–32 ms to under 8 ms on mid-range devices.
**Cost:** Medium — mechanical find-replace across 28 files, no architecture change.

### Win 2 — Debounce localStorage Writes (Impact: High)
Wrap the Zustand persist middleware's `onRehydrateStorage` or the manual `saveToStorage` call in a 500 ms trailing debounce. Batch all state mutations from a single `advanceWeek()` call into one write.
**Measurable hypothesis:** localStorage writes drop from 30–80 per game-day to 1 per game-day. Main-thread blocking I/O per day-advance drops from 40–160 ms to under 2 ms.
**Cost:** Low — single change in store middleware configuration.

### Win 3 — Code-Split Modals and Views (Impact: High)
Wrap all 14 modals and 6 views in `React.lazy(() => import(...))` with a `Suspense` boundary. Vite will emit separate chunks for each, loaded on first open.
**Measurable hypothesis:** Initial JS parse budget drops by 35–50%. Time-to-interactive on first load improves by 0.5–1.5 s on a 4G mobile connection.
**Cost:** Low — mechanical wrapping, no logic changes.

### Win 4 — Fix Font Loading (Impact: Medium-High)
Remove the "Lab Grotesque K" font reference (it generates a 404 on every load). Deduplicate the double Manrope import. Add `<link rel="preconnect">` for the font CDN origin.
**Measurable hypothesis:** Eliminates one 404 network error per load. Reduces font payload by 40–80 KB (one Manrope import). Removes potential FOIT delay on text rendering.
**Cost:** Low — CSS/HTML-level changes only.

### Win 5 — Remove or Audit date-fns (Impact: Medium)
Audit all `import` statements for `date-fns` usage. If dead code, remove the dependency. If used, convert to granular subpath imports.
**Measurable hypothesis:** If dead: bundle shrinks by 70–90 KB gzip. If used via barrel: switching to subpath imports shrinks that contribution by 80%.
**Cost:** Low — search-and-replace or `npm remove date-fns`.

### Win 6 — Cap Unbounded Lists (Impact: Medium)
In `DecisionLogView`, `StatisticsView`, `NPCRosterModal`, and `FinanceView`, render only the most recent 50 entries. Add a "show earlier" expansion trigger if needed.
**Measurable hypothesis:** DOM node count in late-game (week 40+) drops by 50–75% for history views. Scroll paint performance on mobile improves by an estimated 40–60%.
**Cost:** Low — single `.slice(-50)` per list, no dependencies.

### Win 7 — Convert triggeredEventIds and achievements to Sets (Impact: Low-Medium)
Change `triggeredEventIds: string[]` to `triggeredEventIds: Set<string>` in game state (or maintain a derived Set at runtime). Pre-filter already-unlocked achievements before iterating in `achievementChecker`.
**Measurable hypothesis:** Event eligibility lookup in `eventGenerator` drops from `O(n)` linear scan to `O(1)` per candidate. In week 40+ sessions with 100+ triggered events, this eliminates ~100 string comparisons per day tick.
**Cost:** Low-Medium — requires schema awareness; if the Set is kept in derived/runtime state (not persisted), the persisted shape stays a plain array.

---

## Summary Table

| Win | Category | Effort | Est. Impact |
|-----|----------|--------|-------------|
| 1 — Granular selectors | Render | Medium | Re-renders -70% |
| 2 — Debounce saves | I/O | Low | Write ops -95% |
| 3 — Code-split modals | Bundle | Low | TTI -0.5–1.5 s |
| 4 — Fix fonts | Network | Low | Payload -40–80 KB |
| 5 — Remove date-fns | Bundle | Low | Bundle -70–90 KB |
| 6 — Cap lists | DOM | Low | Paint -40–60% |
| 7 — Set for event IDs | CPU | Low | Late-game CPU -minor |

**Assigned to:** engine-programmer (Wins 1, 2, 7), technical-artist (Win 4), devops-engineer (Win 3, 5, 6 audit).
**Escalate budget changes to:** technical-director.
