# Code Architecture Audit — Бизнес с Контуром
**Reviewer:** Lead Programmer  
**Date:** 2026-05-07  
**Scope:** gameStore.ts, game.ts, weekCalculator.ts, economyEngine.ts, eventGenerator.ts, synergyEngine.ts, painEngine.ts, qualityManager.ts, npcManager.ts, stockManager.ts, onboardingEngine.ts, format.ts

---

## 1. Service API Cleanliness

### Pure functions vs side effects

The engines follow two incompatible contracts and mix them freely:

- **economyEngine.ts** — mostly pure: `buildModifiers`, `calculateClients`, `calculateRevenue`, etc. take `GameState` and return values without mutation. Good.
- **weekCalculator.ts / npcManager.ts / eventGenerator.ts / stockManager.ts** — mutate `state` in place as a primary side effect. `processWeek`, `applyNPCPassiveEffects`, `applyEventConsequence`, `consumeStock`, `checkExpiry`, and `addStock` all directly modify the passed-in object.

This is an intentional architectural choice (processWeek receives a deep-cloned copy), but the contract is invisible. A caller who passes a live reference instead of a clone gets destructive mutation silently.

### Argument order inconsistency

- `updateNPCRelationship(npcs: NPC[], npcId, delta)` — takes the array, returns a new array.
- `applyRelationshipDeltaToState(state, npcId, delta, memoryEntry)` — takes full state, mutates in place.
- `recordNPCMemory(npcs: NPC[], ...)` — takes array, returns new array.

Three functions covering the same domain have three different shapes. The store dispatches to both `updateNPCRelationship` and `applyRelationshipDeltaToState` depending on context, making it unclear which is canonical.

### advanceDay vs advanceWeek dead code

`gameStore.ts:373` (`advanceDay`) and `gameStore.ts:385` (`advanceWeek`) are **byte-for-byte identical** in implementation — both call `processWeek`. Neither is removed. `MainScreen.tsx:745` imports `advanceDay` but the four-phase cycle (`completeActionsPhase`) is the actual code path used. `advanceWeek` is not called anywhere in the component tree.

---

## 2. Duplication

### calculateSynergyModifiers called 3 times per daily tick

Per daily iteration in `processWeek`:
1. `buildModifiers(state)` at `weekCalculator.ts:115` internally calls `calculateSynergyModifiers` inside `economyEngine.ts:186`.
2. `calculateSynergyModifiers(state)` called again at `weekCalculator.ts:118` to get `synergyMods.revenueBonus`.
3. `calculateCapacity` inside `economyEngine.ts:108` calls `calculateSynergyModifiers` a third time.

Total: 3 calls per day × 7 days = 21 calls per `processWeek` for a function whose output is deterministic for the entire week (service set does not change mid-week). The result should be computed once before the loop and passed down.

### Deep-clone pattern repeated three times

`gameStore.ts:375`, `gameStore.ts:387`, `gameStore.ts:400` each do:
```
JSON.parse(JSON.stringify(extractState(store))) as GameState
```
followed by `processWeek(stateCopy)` and `set({ ...stateCopy })`. The pattern exists in `advanceDay`, `advanceWeek`, and `completeActionsPhase` — the first two are dead paths. Should be extracted to a single helper.

### NPC passive effect logic uses repeated find-then-branch pattern

`npcManager.ts:104–167` repeats `npcs.find(n => n.id === 'X')` for each of 6 NPCs followed by near-identical if/else relationship threshold ladders. A data-driven table of `{ id, highThreshold, midThreshold, highEffect, lowEffect }` would eliminate ~60 lines.

### Loan parameter table inlined in store

`gameStore.ts:1122–1125` contains the loan type parameters (weeks, rates) as a literal object inside `takeLoan`. This is business-logic data that belongs in `constants/` alongside service prices.

---

## 3. Complexity Hotspots

### processWeek (weekCalculator.ts:63–674)

- **611 lines**, single function.
- Cyclomatic complexity estimated at **30+** (7-day loop, energy branches, register branches, assortment branch, bank branch, synergy, pain, loan processing, competitor cycle, achievement checks, NPC passive, chain triggers, diary, micro-events, teaser generation).
- The function owns: revenue calculation, expense accumulation, game-over checks, achievement checks, onboarding advancement, NPC updates, chain event triggers, personal goal tracking, diary entry selection, ad campaign ROI, milestone checks, and weekly balance/rep/loyalty updates.
- Any single domain change requires navigating the entire function.

### generateEvent (eventGenerator.ts:849–927)

- Iterates all event templates from 6 concatenated arrays (EVENTS_DATABASE + MORAL_DILEMMA_EVENTS + RECURRING_CUSTOMER_EVENTS + NPC_EVENTS + PERSONAL_BACKSTORY_EVENTS + NPC_ARC_EVENTS) on every call.
- Filter logic is a single monolithic `for` loop with 12 `continue` conditions, estimated cyclomatic complexity ~15.
- The randomChance filter at `eventGenerator.ts:888` eliminates events probabilistically inside the loop — events that fail the chance roll still traverse all preceding checks. Correct, but the `candidates` accumulation pattern means a template first passes all structural filters and *then* fails the random check. This means ordering within the filter matters for correctness but is non-obvious.

### extractState (gameStore.ts:1322–1433)

- ~110-line destructuring with migration defaults for every field version.
- Maintained in parallel with `GameState` type and `createInitialState`. Three sources of truth for what fields exist. Any new field must be added to all three.

---

## 4. Naming and Conventions

### Consistent strengths

- `formatRub` / `formatRubSigned` / `formatNumber` in `format.ts` — single file, clear API.
- Service modifier constant names in `gameBalance.ts` imports (ENERGY_THRESHOLDS, REGISTER_BREAKDOWN_PENALTY_RATE) — well-named.
- NPC arc naming (meet/test/resolve) is consistent across constants and docs.

### Inconsistencies

- `dayNumber` in `DayResult` actually stores `state.currentWeek - 1` (a week number), per `weekCalculator.ts:397`. The field name is wrong.
- `daysBalanceNegative` (`game.ts:118`, `weekCalculator.ts:447`) — the comment says "note: despite the name, this counts weeks, not days". The field is named and typed as a day counter but semantically increments weekly. Should be `weeksBalanceNegative`.
- `daysSinceLastMonthly` is incremented per daily tick inside `processWeek` — correctly named, but its check at line 231 uses `ECONOMY_CONSTANTS.MONTHLY_CYCLE_WEEKS * 7` to convert to days, meaning the constant name (`MONTHLY_CYCLE_WEEKS`) and the usage unit (days) are mixed.
- `completeResultsPhase` (`gameStore.ts:410`) owns energy restoration logic and subscription decrement — the name implies only a phase transition.

### Comment quality

Inline comments are generally high quality. Version-bump annotations (`// v3.0 NPC system`) help archaeology. However, the 47-line comment block in `painEngine.ts:1-15` duplicates what CLAUDE.md already documents as "Phase B cleanup". For code, concise is better.

---

## 5. Testability (Dependency Injection vs Hard-coded Imports)

All service files import constants directly (`BUSINESS_CONFIGS`, `ECONOMY_CONSTANTS`, `UPGRADES_CONFIG`, etc.). None accept these as parameters.

**Consequences for testing:**
- Tests cannot supply alternate configs without mocking the entire `constants/business` module.
- `generateEvent` draws `Math.random()` without an injectable RNG, making probabilistic tests non-deterministic.
- `applyWeeklyMicroEvent` at `weekCalculator.ts:751` uses a deterministic index into `DAILY_MICRO_EVENTS` — testable, but the array is imported directly.
- `generateNextWeekTeaser` at `weekCalculator.ts:676` uses `Math.random()` inline — not injectable.
- `processWeek` mutates state in place and returns `DayResult`. Tests must construct a full `GameState` to test any sub-behavior, even isolated concerns like the energy burnout check.

**Positive note:** the pure functions in `economyEngine.ts` (`buildModifiers`, `calculateClients`, `calculateRevenue`) are straightforward to unit-test because they only require `GameState` slices.

---

## 6. Error Handling and Invariants

### Explicit error: one case

`weekCalculator.ts:65`: `throw new Error('Игра уже завершена')` when `processWeek` is called on a finished game. This is the only `throw` in the entire service layer.

### Silent failures

- `gameStore.ts:550`: `toggleService` silently returns if the service is not in `unlockedServices`. No feedback to the caller.
- `gameStore.ts:649`: `purchaseUpgrade` silently returns if already purchased. No return value.
- `gameStore.ts:1000`: `buyCashRegister` returns `false` on failure, but callers are not guaranteed to check it.
- `eventGenerator.ts:967–1074`: `applyEventConsequence` silently returns if `optionId` is not found (`option` is undefined). An unmatched option ID is a programming error that would go undetected in production.
- `onboardingEngine.ts:53–66`: `isStepActionDone` falls through to `return true` on unrecognized `requiresAction` strings — unknown actions are silently treated as completed.

### Invariant drift

- `processWeek` initializes `state.employees`, `state.qualityLevel`, etc. if missing (`weekCalculator.ts:71–84`). This save-compatibility shim means the function has dual responsibilities: migration and simulation. Migration logic belongs in `loadGame`.
- `ensureNPCsInitialized` (`npcManager.ts:197`) is called every tick. Initialization guards should fire once at load, not on every `processWeek` call.

---

## 7. Magic Numbers

### In gameStore.ts (not in constants)

| Location | Value | Missing constant |
|---|---|---|
| `gameStore.ts:988` | `15000` (emergency grant) | `EMERGENCY_GRANT_AMOUNT` |
| `gameStore.ts:1080` | `0.5` (severance = 50% of salary) | `SEVERANCE_RATE` |
| `gameStore.ts:1091` | `20` (training energy cost) | `ENERGY_COST_TRAINING` |
| `gameStore.ts:1098` | `1.6` (max employee efficiency) | `MAX_EMPLOYEE_EFFICIENCY` |
| `gameStore.ts:1098` | `0.1` (training efficiency gain) | `TRAINING_EFFICIENCY_GAIN` |
| `gameStore.ts:1122–1125` | loan weeks and rates | Should be in `constants/` |
| `gameStore.ts:1004` | `REGISTER_COMBO_DISCOUNTS[3]`, `REGISTER_COMBO_DISCOUNTS[2]` — index 2 and 3 are accessed without defined semantics in the constant key |

### In weekCalculator.ts

| Location | Value | Missing constant |
|---|---|---|
| `weekCalculator.ts:382` | `40` (weekly energy restore) | `WEEKLY_ENERGY_RESTORE` |
| `weekCalculator.ts:382` | `95` (loyalty word-of-mouth threshold) | Present in logic only |
| `weekCalculator.ts:383` | `0.10` / `14` (word-of-mouth client mod + days) | Should be named |
| `weekCalculator.ts:546`, `553`, `560` | `100000`, `250000`, `500000`, `1000`, `5000`, `10000` (milestone thresholds) | Should be in `constants/` |
| `weekCalculator.ts:635` | `[10, 20, 30, 40]` (crisis weeks) | Should be `CRISIS_WEEKS` constant |

### In economyEngine.ts

| Location | Value | Issue |
|---|---|---|
| `economyEngine.ts:197` | `0.15` (market check bonus) | Duplicates `SERVICES_CONFIG.market.effects.checkBonus` — two sources of truth |

### In qualityManager.ts

| Location | Value | Issue |
|---|---|---|
| `qualityManager.ts:18` | `3` (grace weeks) | Local constant `QUALITY_GRACE_WEEKS` — acceptable, but undocumented scope |
| `qualityManager.ts:46–51` | `40`, `70`, `80` quality thresholds | Should align with a named set |

---

## 8. Type Safety

### `any` usage

- `gameStore.ts:1322`: `function extractState(state: any)` — the function signature accepts any object to handle migration from old saves. The `as any` casts on lines 1383, 1420–1424 are a direct consequence. The correct fix is to type the migration input as `Partial<GameState> & Record<string, unknown>`.
- `gameStore.ts:788`: `set((state: GameState) => ...)` and `set((state: GameState) => ...)` on several setters — redundant explicit type annotation since Zustand infers the callback type.

### Optional field sprawl

`GameState` has 30+ optional fields (`?:`) accumulated across versions. Many are only optional for save migration purposes — they are always present in a live running game. This means the entire codebase defensively null-coalesces everywhere (`state.loans ?? []`, `state.npcs ?? []`, `state.campaignROI ?? []`). Consider:
- Splitting into `CoreGameState` (required, always present) and `MigrationGameState` (partial, only used in `loadGame`).
- Or at minimum, tightening the optional/required split so the engine functions can rely on present fields without null guards.

### Missing return type annotations

- `generateNextWeekTeaser` — returns `string | null`, not annotated (TypeScript infers it, but explicit annotation is better documentation).
- `accumulateServiceSavings` — returns `void`, not annotated.
- `applyWeeklyMicroEvent` — returns `void`, not annotated.
- All private helper functions in `weekCalculator.ts` lack return type annotations.

### `DayResult` fields that are always 0

`DayResult` (game.ts:219–249) has fields `tax`, `subscriptionCost`, `purchaseCost`, `monthlyExpense`, and all seven `painLoss*` fields. In `processWeek`, these are always written as `0` in the result object (`weekCalculator.ts:407–426`). The type advertises a richer contract than the implementation delivers. Either populate these with actual per-day aggregates or remove the fields from the public type.

---

## 9. Refactor Priorities (Top 7)

### P1 — Extract processWeek into sub-functions  
**File:** `src/services/weekCalculator.ts:63`  
The 611-line function should be decomposed into at least: `processDailyEconomics(state, day)`, `processWeeklySystemUpdates(state)`, `processWeeklyNarrativeEvents(state)`, `processEndOfWeekChecks(state)`. This is the single highest-risk file for regressions — any bug hunt requires reading the entire function.

### P2 — Hoist synergyModifiers out of the day loop  
**File:** `src/services/weekCalculator.ts:115–118` and `src/services/economyEngine.ts:108`  
`calculateSynergyModifiers` is called 21 times per `processWeek` and returns identical results for the whole week (services cannot change mid-loop). Compute once before the loop and pass as a parameter to `buildModifiers` and `calculateCapacity`. This also eliminates the implicit coupling between `economyEngine` and `synergyEngine`.

### P3 — Delete advanceDay / advanceWeek dead code  
**File:** `src/stores/gameStore.ts:373–395`  
`advanceDay` and `advanceWeek` are identical to each other and serve no production purpose — `completeActionsPhase` is the live path. The one reference in `MainScreen.tsx:745` imports `advanceDay` but `completeActionsPhase` is what is actually called at line 839. Removing these dead routes reduces the surface area of the store's public API.

### P4 — Fix extractState type signature  
**File:** `src/stores/gameStore.ts:1322`  
Change `function extractState(state: any)` to `function extractState(state: Partial<GameState> & Record<string, unknown>)`. This removes the `as any` escape hatches on lines 1383, 1420–1424 and brings migration fields into the type system. The `GameState` optional-field sprawl should be audited to distinguish "optional for migration" from "genuinely absent at runtime".

### P5 — Move magic numbers to constants  
**Files:** `src/stores/gameStore.ts:988,1080,1091,1098,1122–1125`; `src/services/weekCalculator.ts:382,546,553,560,635`  
At minimum: `EMERGENCY_GRANT_AMOUNT`, `SEVERANCE_RATE`, `ENERGY_COST_TRAINING`, `MAX_EMPLOYEE_EFFICIENCY`, `TRAINING_EFFICIENCY_GAIN`, `WEEKLY_ENERGY_RESTORE`, `CRISIS_WEEKS`, milestone threshold constants, and loan parameters should all live in `constants/`. The loan parameters are particularly important as they are business-critical and currently duplicated implicitly with no way to reference them from tests or UI.

### P6 — Fix the market check bonus double-source  
**File:** `src/services/economyEngine.ts:197`  
The hardcoded `0.15` for market's check bonus bypasses `SERVICES_CONFIG.market.effects.checkBonus`. If someone changes the service config, the modifier will be inconsistent. Replace with `SERVICES_CONFIG.market.effects.checkBonus ?? 0`.

### P7 — Remove dead exports from qualityManager.ts  
**File:** `src/services/qualityManager.ts:64,86`  
`getSeasonalityModifier` and `checkQualityEvent` are exported but have zero callers anywhere in the codebase. `getSeasonalityModifier` duplicates logic already in `economyEngine.getSeasonalModifier`. Dead exports obscure the actual API surface and mislead future programmers into thinking these functions are part of a live contract. Remove or consolidate.

---

## Appendix: Violation Summary by Rule

| Rule | Status |
|------|--------|
| All public methods have doc comments | Fail — most service functions have no doc comments |
| Max cyclomatic complexity 10 | Fail — processWeek ~30+, generateEvent ~15 |
| No method longer than 40 lines | Fail — processWeek 611 lines, extractState 110 lines, generateEvent 78 lines of filter logic |
| All dependencies injected | Partial — constants imported directly; no injectable config or RNG |
| Config from data files, never hardcoded | Partial — most in constants, but see magic numbers section |
| Every system exposes a clear interface | Partial — mutation vs pure function contract is inconsistent |
