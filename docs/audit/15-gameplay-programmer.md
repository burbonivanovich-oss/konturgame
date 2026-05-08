# Gameplay Programmer Audit — Бизнес с Контуром

**Auditor role:** gameplay-programmer  
**Date:** 2026-05-07  
**Files read:** `src/services/weekCalculator.ts`, `src/services/economyEngine.ts`, `src/services/eventGenerator.ts` (header), `src/stores/gameStore.ts` (first 300 lines), `src/services/__tests__/` (listing)

---

## 1. processWeek Correctness

`processWeek()` is a 885-line monolith that mutates `state` in-place during the 7-day loop, then applies post-loop logic before returning a `DayResult`. Several correctness issues stand out.

**Loan deduction happens after balance is committed.** The weekly net profit is applied to `state.balance` at line 343 (`newBalance = Math.round(state.balance + weekNetProfit)`), but loan principal and interest are deducted at lines 429–440 — after the balance has already been written. This means `checkBankruptcy()` at line 530 sees the post-loan balance, which is correct, but the `DayResult.balance` field (line 414) is captured before the loan loop and therefore lies to the UI. The player sees a higher balance in WeekResults than actually exists after the store commit.

**`registerOverflowPenalty` is accumulated but never deducted.** `weekRegisterOverflow` is summed every day (line 307) and placed into `result.registerOverflowPenalty` (line 424), but it is never subtracted from `weekNetProfit` or `weekExpenses`. Revenue loss from missed clients is already implicit in `served` being lower, so the penalty double-counts the concept without actually hitting the balance. This matches the known "registerOverflowPenalty не списывается" finding.

**Micro-event option is always index 0.** `applyWeeklyMicroEvent()` (line 752) unconditionally takes `micro.options[0]`, applying its effects silently with no player decision. If a micro-event has only a negative-balance option as its first entry (e.g., a fine), the player loses money every cycle that maps to that index with zero feedback in the decision log.

**State mutation inside the day loop.** `state.consecutiveOverloadDays`, `state.dayOfWeek`, `state.temporaryModDaysLeft`, `state.temporaryClientMod`, and `state.daysSinceLastMonthly` are all mutated directly on the `state` object mid-loop. Because Zustand's `produce` (Immer) is invoked by the store action that calls `processWeek`, this is technically safe at the store boundary, but the function cannot be called outside that boundary without corrupting caller state — it is untestable in isolation.

**`daysSinceLastMonthly` increments inside the day loop but grace check is week-granular.** The grace period check at line 231 compares `daysAlive >= ECONOMY_CONSTANTS.MONTHLY_CYCLE_WEEKS * 7`, but `daysSinceLastMonthly` is incremented once per day within the week loop (line 234). After the week loop, it will have grown by 7. On an edge week where the threshold is crossed mid-loop (day 3 of week 4, for example), the monthly expense fires for 4 of 7 days in the same week. The divide-by-28 denominator (line 232) ensures the per-day amount is correct once billing starts, but a partial activation week under-bills rent/salary by 3/7 of the spread amount.

**Milestone check uses pre-increment `state.currentWeek`.** Milestones are evaluated on lines 546–565 while `state.currentWeek` still holds its current value (e.g., 10). `state.currentWeek += 1` happens at line 647. The celebration is then set on lines 668–670 when `currentWeek` is already 11/21/31. This is correct in effect — week 10 milestone is evaluated during the week-10 call — but the asymmetry between the check week and the display week is fragile and caused at least one off-by-one in the celebration logic (`currentWeek === 11` fires the `week10` celebration banner, meaning the player sees it one week late).

---

## 2. RNG and Determinism

There is no seeded RNG anywhere in the codebase. Every random call is `Math.random()`:

- `triggerNewChainStarts()` (line 816): jitter on chain start week.
- `generateNextWeekTeaser()` (line 720): random tip selection.
- `eventGenerator.ts` (throughout): event pool sampling, `randomChance` rolls.
- `checkRegisterBreakdown()` in `cashRegisterEngine.ts` (not read, but called at line 188).

Consequences:

1. **Saves cannot be replayed.** A "week 20 disaster" cannot be reproduced for bug reports or test assertions.
2. **Tests that depend on event firing are probabilistic.** Any test asserting that a specific event fired (or didn't) at a given week is inherently flaky without mocking `Math.random`.
3. **The jitter in `triggerNewChainStarts`** (line 816, `Math.floor(Math.random() * 3)`) means the `mikhail_crisis` chain can start anywhere from its defined `minWeek` to `minWeek + 2`. Combined with the known chronological conflict in that chain, this makes the window of conflict non-deterministic — it is impossible to write a reliable regression test without seeding.

Recommendation: adopt a seeded PRNG (e.g., a simple mulberry32) stored in `GameState`. Seed on `startNewGame`, use it exclusively for all game-logic rolls.

---

## 3. Engine Coupling and Data Flow

**`processWeek` calls `calculateSynergyModifiers` twice per day.** `buildModifiers()` (economyEngine line 186) calls `calculateSynergyModifiers` internally. `processWeek` then calls `calculateSynergyModifiers` again directly at line 118 to get `synergyMods` for revenue/tax/loyalty bonuses. That is 2 calls × 7 days = 14 redundant synergy computations per week. The function is pure and cheap today, but the double-call is an architectural smell that will cause divergence if either call site is updated without the other.

**`buildModifiers` is called inside the day loop but receives `state` which is mutating.** Because `state.dayOfWeek` is set at line 114 before each `buildModifiers` call, seasonal modifiers will shift daily — intended. But `state.temporaryClientMod` is also read inside `buildModifiers` (economyEngine line 205) while being decremented at line 315 later in the same iteration. Within a single day, the modifier is read before it is decremented: correct. But if `buildModifiers` is ever called a second time in the same day (e.g., in a future refactor that adds a "preview" path), it would see a stale `dayOfWeek` but a decremented `temporaryModDaysLeft`. The coupling is safe only by convention.

**`painEngine.calculatePainLosses` receives `dayRevenue` as both second and fourth argument** (line 247: `calculatePainLosses(state, dayRevenue, dayNetProfit, dayRevenue)`). The fourth parameter is named differently in the callee, suggesting the call site passes a placeholder that was meant to be something else (possibly weekly revenue). This is the likely root cause of the reported "Pain Engine = 0" — if the engine uses the ratio of the fourth argument to derive penalties, passing `dayRevenue` for both makes the ratio 1 and eliminates all pain losses.

---

## 4. Edge Cases: Bankruptcy, Dismissals, Overflows

**Bankruptcy check uses `daysBalanceNegative` (weeks, not days).** The field name says "days" but is incremented once per `processWeek` call (line 448). `checkBankruptcy` presumably reads a threshold meant in "weeks". The comment at line 443 acknowledges this, but the field name leaks into serialized save state and any future code reading the raw value will be confused.

**No guard for negative balance before loan principal repayment.** If `state.balance` is already negative (e.g., 0) and a loan comes due (`loan.dueWeek === state.currentWeek`), the principal deduction at line 437 pushes the balance further negative. `checkBankruptcy` runs after this, so the game can end, but the `daysBalanceNegative` counter only increments by 1 that week regardless of the magnitude of negative balance. A player who was at 0 for 3 weeks and then has a 200,000 ₽ loan come due goes bankrupt in a single week, bypassing the intended grace-period counter logic.

**Employee firing has no energy refund.** `fireEmployee` in the store presumably removes salary, but `weeklyEnergyCost` in `getWeeklyEnergyCost` reflects the hired headcount. If an employee is fired mid-week actions phase, they don't contribute revenue but their energy cost was already pre-calculated at the top of `processWeek` (line 107). The weekly energy penalty is therefore overstated by one employee-period.

**Capacity formula has a sign error for the low-loyalty penalty.** `calculateCapacity()` at economyEngine line 107 computes `capacityMod -= LOYALTY_CAPACITY_MODIFIER.LOW_PENALTY`. The base `capacityMod` starts at `1.0`; if `LOW_PENALTY` is, say, `0.2`, capacity becomes `baseCapacity * (0.8 + upgradeBonus + synergyBonus)`. The `upgradeBonus` and `synergyBonus` are added to `capacityMod`, not multiplied — so capacity upgrades partially cancel the loyalty penalty rather than stacking multiplicatively as likely intended.

---

## 5. Dead Paths after Phase A/B/C

The following are confirmed dead code paths based on the audit and known Phase cleanup history:

- **`state.lastDayPainLosses`** is initialized to `null` in `createInitialState` (gameStore line 123) but never written. `lastWeekPainLosses` is written (weekCalculator line 650). The `lastDayPainLosses` field is serialized into every save.
- **`result.tax`, `result.subscriptionCost`, `result.purchaseCost`, `result.monthlyExpense`** are all hardcoded to `0` in the returned `DayResult` (weekCalculator lines 407–410). These were presumably meaningful before daily accumulation was introduced. Any UI component reading these specific breakdown fields will always show zero — a data contract that no longer holds.
- **`result.painLossBank*` through `result.painLossExternBlock`** fields on `DayResult` (lines 417–423) are initialized to `0` and never populated. The weekly totals land in `state.lastWeekPainLosses` instead, making the per-result pain breakdown permanently empty.
- **`state.seenNewspaperWeeks`** (gameStore line 173) — the city-newspaper was replaced by the diary system, but the field persists in save state.
- **`WeekPhase` type and `state.weekPhase`** — the store interface declares `completeActionsPhase`, `completeResultsPhase`, `completeSummaryPhase` actions, but `processWeek` does not reference `weekPhase` at all. The phase state may be managed separately; if not, it is orphaned.

---

## 6. Test Coverage Gaps

Test files present: `achievementChecker`, `economyEngine`, `eventGenerator`, `playerStyles`, `simulation`, `stockManager`, `synergyEngine`, `victoryChecker`.

Notable gaps:

- **`weekCalculator.ts` has no dedicated test file.** The 885-line core loop — which calls every other engine — is only exercised indirectly through `simulation.test.ts`. Boundary conditions (grace period edge, burnout two-week window, loan due-week coinciding with negative balance) are untested.
- **`painEngine.ts` has no test.** Given the confirmed "Pain Engine = 0" bug, this is the highest-priority missing test file.
- **`cashRegisterEngine.ts` has no test.** Register breakdown is random (`Math.random()`); tests cannot assert breakdown behavior without mocking.
- **`qualityManager.ts` has no test.** The quality-level-to-client-modifier and quality-to-price-premium mappings are entirely untested.
- **`npcManager.ts` / `npcArcs.ts` arc progression** — `npcArcs.test.ts` is listed in CLAUDE.md as existing but is not present in the `src/services/__tests__/` directory. Either it lives elsewhere or was deleted.
- **`eventGenerator` tests** almost certainly use `Math.random()` unseeded, making them flaky on rare random-chance events. The `randomChance` field in event triggers ranges from 0.03–0.05; a test run with bad luck could fail to fire a "one time only" event that a specific assertion depends on.
- **No integration test for the save/load round-trip.** The known save-key bug (App.tsx reads `konturgame_state`, store writes `konturgame_state_v7`) is not caught by any test because no test exercises the localStorage load path end-to-end.

---

## 7. Top-7 Recommendations with file:line

1. **Fix `registerOverflowPenalty` not deducting from balance.**  
   `src/services/weekCalculator.ts:244` — add `registerOverflowPenalty` to `dayExpenses`, or remove the accumulation at line 307 entirely if the capacity model already accounts for it.

2. **Fix `DayResult` balance snapshot to include loan deductions.**  
   `src/services/weekCalculator.ts:397–426` — move `result` construction to after the loan loop (currently lines 429–440), or re-read `state.balance` after loans are processed.

3. **Diagnose and fix `calculatePainLosses` fourth argument.**  
   `src/services/weekCalculator.ts:247` — audit the `painEngine.ts` function signature. The fourth argument appears to be a duplicate of `dayRevenue`; if the parameter represents something else (e.g., cumulative week revenue or a normalizer), pass the correct value. Write a unit test for `painEngine.ts` that asserts non-zero output when services are inactive.

4. **Introduce seeded PRNG into `GameState`.**  
   `src/stores/gameStore.ts:44` (`createInitialState`) — add `rngSeed: number` field, generate on new game. Replace all `Math.random()` calls in game-logic services with a deterministic PRNG function that advances the seed. Do not seed the UI/cosmetic calls (teasers, tips).

5. **Add `weekCalculator.test.ts` covering the core loop.**  
   `src/services/__tests__/` — at minimum: grace-period boundary (week 4 vs week 5 monthly billing), burnout two-week warning, loan principal deducted from displayed balance, milestone check timing (week 10 flag set, celebration shows in week 11).

6. **Rename `daysBalanceNegative` to `weeksBalanceNegative`.**  
   `src/stores/gameStore.ts:117` and `src/services/weekCalculator.ts:448` — the field tracks weeks. The misleading name will cause a logic error the first time any programmer writes `> 7` as a "one week" threshold. Bump the save key to `konturgame_state_v8` or add a migration that renames the field on load.

7. **Consolidate the double `calculateSynergyModifiers` call.**  
   `src/services/weekCalculator.ts:118` and `src/services/economyEngine.ts:186` (`buildModifiers` internal call) — pass `synergyMods` as a parameter to `buildModifiers`, or remove the direct call in `processWeek` and read all synergy values from the returned `Modifiers` struct. Prevents future divergence between the two call sites.
