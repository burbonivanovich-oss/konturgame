# SFX Design Specification — "Бизнес с Контуром"

**Game:** Business simulator (React 18 + TypeScript + Zustand)  
**Platform:** Browser (desktop + mobile)  
**Audio Style:** Subtle, professional SFX (no background music scope)  
**Created:** 2026-05-07  

---

## Design Philosophy

- **Confirmation feedback**: Every meaningful action (button click, event, transaction) receives audio confirmation
- **Emotional states**: Crisis events, victories, and defeats get distinct tonality
- **Economy clarity**: Cash flows (income/expenses/loans) have distinctive sonic signatures
- **NPC presence**: Character arcs and relationship shifts marked with subtle, remembered moments
- **Mobile-friendly**: All SFX must work at phone speaker volumes; no ear-piercing highs
- **Accessibility**: No single critical action relies solely on audio cue

---

## SFX SPECIFICATION TABLE

| **ID** | **Category** | **Trigger** | **Description** | **Duration (ms)** | **Frequency Range** | **ADSR** | **Priority** | **Ref / Source** |
|--------|-----------|----------|-----------|-----------|-------------|---------|----------|---------|
| UI_CLICK | UI | Button/link tap | Crisp, minimal feedback | 120–180 | 2.2–5 kHz | A:10ms D:60ms S:-∞ R:40ms | HIGH | Freesound: UI button (e.g., search "UI click subtle" #478271) |
| UI_HOVER | UI | Mouse over button/link | Light, barely perceptible | 80–120 | 3–4 kHz | A:5ms D:30ms S:-∞ R:20ms | LOW | Freesound: mouse hover, air whoosh |
| MODAL_OPEN | UI | Modal appears (event, achievement, victory, defeat) | Smooth glide + subtle depth | 200–350 | 300–3 kHz sweep | A:30ms D:100ms S:constant R:100ms | MEDIUM-HIGH | Freesound: "glass" or "whoosh transition" |
| MODAL_CLOSE | UI | Modal dismisses | Reverse of MODAL_OPEN | 150–250 | 3–300 kHz sweep (reverse) | A:0ms D:80ms S:-∞ R:60ms | MEDIUM | Freesound: descending tone, air transition |
| TAB_SWITCH | UI | Navigation tab changes (Finance/Operations/etc) | Plinky single note | 100–150 | 1.8–2.4 kHz | A:15ms D:40ms S:-∞ R:50ms | MEDIUM | Freesound: "bell tap" or "glass ping" |
| TOGGLE_ON | UI | Service subscription activated, register purchased | Ascending minor chord (2-note) | 200–300 | 0.4–0.8 kHz then 0.6–1.2 kHz | A:50ms D:100ms S:100ms R:100ms | HIGH | Freesound: "power on" or "switch" |
| TOGGLE_OFF | UI | Service deactivated | Descending chord (reverse of TOGGLE_ON) | 150–250 | 0.8–0.4 kHz then 1.2–0.6 kHz | A:40ms D:80ms S:50ms R:80ms | MEDIUM | Freesound: "power off" or "switch off" |
| DAY_ADVANCE | Game Flow | Complete Actions button pressed (progresses day) | Short, satisfying tick | 150–200 | 0.8–1.2 kHz with harmonic | A:20ms D:60ms S:-∞ R:60ms | HIGH | Freesound: "metronome tick" or "mechanical clock" |
| WEEK_ADVANCE | Game Flow | Week results overlay appears (end-of-week) | Ascending fanfare, 3–5 notes, brassy | 600–900 | 0.3–2 kHz (bass to mid) | A:40ms D:150ms S:200ms R:200ms | HIGH | Freesound: "fanfare" or "achievement unlock" |
| WEEK_RESULTS_APPEAR | Game Flow | WeekResultsOverlay modal opens | Soft shimmer + settling tone | 400–600 | 2–8 kHz with decay | A:50ms D:100ms S:200ms R:150ms | MEDIUM-HIGH | Freesound: "sparkle" or "glass shimmer" |
| MILESTONE_REACHED | Game Flow | 10-week / 20-week / 30-week milestone (week10/week20/week30) | Triumphant orchestral swell (3–4 notes) | 800–1200 | 0.2–3 kHz (minor key) | A:60ms D:200ms S:300ms R:300ms | HIGH | Freesound: "fanfare" or "victory jingle" (search "orchestral chime") |
| VICTORY | Game Flow | Victory screen appears (year-one or combined win) | Grand ascending fanfare + sustained note | 1200–1800 | 0.2–2 kHz | A:80ms D:200ms S:500ms R:400ms | CRITICAL | Freesound: "success" or "victory theme" (e.g., #485308) |
| DEFEAT | Game Flow | Game-over screen appears (bankruptcy/burnout/reputation/other) | Descending minor chord, muted strings feel | 800–1200 | 0.3–2 kHz | A:100ms D:300ms S:-∞ R:400ms | CRITICAL | Freesound: "sad trombone" or "fail" (search "defeat horn") |
| SAVE_LOADED | Game Flow | Game loads from localStorage (on app init if sane state exists) | Soft ascending 2–3 note sequence | 300–500 | 0.6–1.5 kHz | A:40ms D:100ms S:150ms R:150ms | LOW | Freesound: "chime" or "resume" sound |
| CASH_IN_SMALL | Economy | Daily revenue 100–500₽ | Single short bell chime | 80–120 | 1.8–2.4 kHz | A:10ms D:40ms S:-∞ R:30ms | LOW | Freesound: "ping" or "coin" |
| CASH_IN_MEDIUM | Economy | Daily revenue 500–5000₽ | Double chime, slightly brighter | 150–220 | 2–3 kHz | A:15ms D:50ms S:20ms R:40ms | MEDIUM | Freesound: "cash register" or "bell duo" |
| CASH_IN_LARGE | Economy | Daily revenue >5000₽ or strong week-end profit | Triple ascending chime or brief cash cascade sound | 250–400 | 1.5–4 kHz | A:30ms D:80ms S:100ms R:80ms | MEDIUM-HIGH | Freesound: "cash register" or "coin drop" |
| CASH_OUT | Economy | Subscription cost deducted, rent/salary paid, purchase made | Single descending tone | 150–200 | 2–1 kHz | A:20ms D:60ms S:-∞ R:50ms | MEDIUM | Freesound: "whoosh" or "negative chime" |
| LOAN_TAKEN | Economy | Loan activated (via Kontour.Bank event option) | Descending pair, metallic tone | 200–300 | 0.8–0.5 kHz | A:30ms D:100ms S:100ms R:80ms | MEDIUM-HIGH | Freesound: "door slam" or "metal clank" |
| LOAN_REPAID | Economy | Loan paid off or deadline met | Ascending chord (2–3 notes, major key) | 300–450 | 0.6–1.5 kHz | A:40ms D:120ms S:150ms R:150ms | MEDIUM | Freesound: "success" or "unlock" |
| BANKRUPTCY_WARNING | Economy | Balance approaches ≤0 or enters negative (before full game-over) | Low-frequency alarm pulse | 600–1000 | 0.1–0.4 kHz (sub + bass) | A:50ms D:100ms S:100ms R:100ms (repeating every ~2s) | CRITICAL | Freesound: "alarm" or "warning tone" |
| EVENT_APPEAR_POSITIVE | Events | Positive event modal opens (e.g., "Blogger привёл толпу") | Rising, consonant 3–4 note sequence (major key) | 400–600 | 0.3–2 kHz | A:50ms D:150ms S:200ms R:200ms | MEDIUM-HIGH | Freesound: "notification" or "success chime" |
| EVENT_APPEAR_NEUTRAL | Events | Neutral event modal opens | Single middle-tone chime, balanced | 250–350 | 1–1.5 kHz | A:30ms D:100ms S:100ms R:100ms | MEDIUM | Freesound: "alert" or "neutral ping" |
| EVENT_APPEAR_NEGATIVE | Events | Crisis/negative event modal opens (red banner, "🎭 Событие · Требует решения") | Dissonant low-register tone, slightly harsh | 400–600 | 0.3–0.8 kHz | A:40ms D:150ms S:150ms R:150ms | MEDIUM-HIGH | Freesound: "alarm" or "negative chime" |
| CHOICE_MADE | Events | Player selects event option (button press on option) | Confirmation chime + soft harmonic tail | 200–300 | 1–2 kHz | A:20ms D:80ms S:50ms R:100ms | MEDIUM | Freesound: "beep" or "confirm" |
| ACHIEVEMENT_UNLOCKED | Events | Achievement earned (e.g., "Первый рабочий день", "Мастер склада") | Triumphant chime + ascending tail (2–3 notes) | 500–800 | 0.4–2 kHz | A:60ms D:150ms S:200ms R:250ms | HIGH | Freesound: "achievement" or "unlock" (search #545454) |
| NPC_APPEARS | NPC | NPC introduced (e.g., "Катя приехала с пирогом") | Warm, familiar descending 2–3 note sequence | 350–500 | 0.8–2 kHz | A:50ms D:150ms S:150ms R:150ms | MEDIUM-HIGH | Freesound: "person" or "friendly bell" |
| NPC_ARC_RESOLVED_POSITIVE | NPC | NPC arc resolves with positive outcome (e.g., Katya "зовёт в партнёры") | Ascending major chord, sustained, warm tone | 600–900 | 0.3–1.8 kHz | A:60ms D:180ms S:300ms R:250ms | HIGH | Freesound: "friendship" or "positive chime" |
| NPC_ARC_RESOLVED_NEGATIVE | NPC | NPC arc resolves with negative outcome (rejection, betrayal) | Descending minor chord, muted | 500–800 | 0.4–1 kHz | A:50ms D:200ms S:150ms R:250ms | MEDIUM-HIGH | Freesound: "sad" or "farewell" |
| OPINION_PINNED | NPC | Memory entry anchored in NPCRosterModal (user pins reason) | Soft, memorable single note + harmonic shimmer | 200–300 | 1–2 kHz with 2 kHz harmonic | A:40ms D:100ms S:100ms R:80ms | LOW | Freesound: "notification" or "bookmark" sound |
| INVALID_ACTION | Errors | Action blocked (e.g., "Сначала разрешите событие", insufficient balance) | Short error buzz or descending fail tone | 150–250 | 0.5–0.2 kHz | A:20ms D:80ms S:-∞ R:50ms | MEDIUM | Freesound: "buzzer" or "error" |
| MODAL_ERROR | Errors | Modal action fails (validation, network if applicable) | Double quick buzzer or harsh tone | 200–300 | 0.3–0.1 kHz (descending) | A:15ms D:100ms S:-∞ R:60ms | MEDIUM | Freesound: "fail" or "error buzz" |
| CRISIS_APPEAR | Events | Crisis event trigger (CRISIS_*, rare destabilization) | Low-frequency alarm + dissonant tone burst | 600–1000 | 0.1–1.2 kHz (ominous rumble) | A:40ms D:150ms S:200ms R:150ms | CRITICAL | Freesound: "alarm" or "danger" (search "crisis tone") |
| CRISIS_RESOLVED_SUCCESS | Events | Crisis event resolved with successful mitigation option | Major ascending resolution, hopeful | 700–1000 | 0.4–2 kHz | A:60ms D:180ms S:250ms R:200ms | HIGH | Freesound: "success" or "saved" |
| CRISIS_RESOLVED_LOSS | Events | Crisis resolved but with significant loss (all options have cost) | Minor resolving chord, somber | 600–900 | 0.3–1.2 kHz | A:50ms D:200ms S:200ms R:250ms | MEDIUM-HIGH | Freesound: "loss" or "regret" |
| FIRE_EVENT | Events | Staff departure event (rare) | Sad, lonely single tone | 300–450 | 0.8–0.5 kHz | A:30ms D:150ms S:100ms R:150ms | MEDIUM | Freesound: "sad" or "goodbye" |
| INSPECTOR_EVENT | Events | Tax/regulatory event (e.g., "Налоговая проверка") | Authoritative knock pattern + steady tone | 400–600 | 0.4–1 kHz | A:20ms D:100ms S:150ms R:100ms | MEDIUM-HIGH | Freesound: "official" or "knock" |
| MICRO_EVENT_APPEAR | Events | Daily micro-event appears (e.g., "Плохой сон", "Мотивация на неделю") | Light, contextual chime (varies by mood) | 150–250 | 1–2 kHz | A:25ms D:60ms S:50ms R:60ms | LOW | Freesound: "notification" or "ding" |
| PROMO_CODE_UNLOCK | UI/Events | PromoCodeModal slides in (service subscribed, modal triggers) | Celebratory ascending 3–note sequence | 400–600 | 0.5–2 kHz | A:50ms D:120ms S:150ms R:150ms | MEDIUM-HIGH | Freesound: "unlock" or "bonus" |
| EMPLOYEE_HIRED | Events | Employee successfully hired (HireEmployeeModal close) | Upbeat, brief 2–note chime | 180–280 | 1–1.8 kHz | A:30ms D:80ms S:50ms R:80ms | MEDIUM | Freesound: "welcome" or "positive ping" |
| EMPLOYEE_FIRED | Events | Employee dismissed (due to low energy, cost-cutting) | Descending single tone, regretful | 250–350 | 1.2–0.6 kHz | A:25ms D:100ms S:50ms R:80ms | MEDIUM | Freesound: "sad" or "exit" |
| REGISTER_PURCHASED | Events | Cash register bought (CashRegisterModal confirmation) | Ascending hardware-like chime + click | 300–450 | 0.8–2 kHz with percussive click | A:40ms D:100ms S:100ms R:100ms | MEDIUM-HIGH | Freesound: "cash register" or "machine startup" |
| UPGRADE_PURCHASED | Events | Upgrade / improvement bought (UpgradesModal) | Ascending optimism, mid-tone chime | 250–400 | 1–2 kHz | A:35ms D:100ms S:100ms R:100ms | MEDIUM | Freesound: "success" or "upgrade" |
| STOCK_LOW | UI/Alerts | Stock percentage drops below 25% (stockLow flag in dashboard) | Subtle warning pulse, repeating quietly | 200–300 | 1.2–0.8 kHz | A:40ms D:100ms S:50ms R:80ms (repeats ~every 5s if unresolved) | MEDIUM | Freesound: "warning" or "beep" |
| STOCK_EXPIRED | Events | Goods expire (automatic penalty in economyEngine) | Single mournful tone + decay | 350–500 | 0.6–0.2 kHz | A:40ms D:200ms S:-∞ R:100ms | LOW | Freesound: "sad" or "loss" |
| QUALITY_IMPROVED | Economy | Quality level increases (via investment) | Ascending minor-to-major transition | 350–500 | 0.8–1.8 kHz | A:40ms D:120ms S:150ms R:150ms | MEDIUM | Freesound: "positive" or "improvement" |
| QUALITY_DECLINED | Economy | Quality level decreases (due to neglect or event) | Descending tone, downward curve | 250–400 | 1.5–0.8 kHz | A:30ms D:100ms S:100ms R:100ms | MEDIUM | Freesound: "decline" or "negative shift" |
| CAMPAIGN_STARTED | UI/Events | Advertising campaign launched (CampaignModal) | Upbeat, promotional 2–3 note chime | 300–450 | 1–2 kHz | A:40ms D:100ms S:100ms R:100ms | MEDIUM | Freesound: "success" or "start" |
| CAMPAIGN_ENDED | UI/Events | Advertising campaign expires | Descending simple tone | 200–300 | 1.8–0.8 kHz | A:30ms D:80ms S:50ms R:80ms | LOW | Freesound: "end" or "close" |
| BUSINESS_TIER_UP | Economy | Business progresses to next tier (tier 1 → 2 → 3) | Celebratory ascending fanfare (3–4 notes) | 600–900 | 0.3–2 kHz | A:60ms D:180ms S:200ms R:250ms | HIGH | Freesound: "fanfare" or "promotion" |
| SERVICE_UNLOCKED | UI | Service becomes available (via onboarding progression) | Ascending unlock chime, satisfying | 300–450 | 0.6–2 kHz | A:40ms D:100ms S:150ms R:150ms | MEDIUM-HIGH | Freesound: "unlock" or "power-up" |
| DECISION_LOG_ENTRY | UI | Decision recorded in DecisionLogView (passive, non-intrusive) | Subtle, barely-there note | 100–150 | 1.5–2 kHz | A:20ms D:40ms S:20ms R:50ms | LOW | Freesound: "pen scratch" or minimal click |
| SYNERGY_ACTIVE | Economy | Bundle tier synergy activates (3+/5+/7+ services = +10/20/30%) | Ascending trio of notes, harmonic chime | 350–550 | 0.8–2.2 kHz | A:50ms D:120ms S:150ms R:150ms | MEDIUM | Freesound: "bonus" or "synergy" |
| PAIN_LOSS_INCURRED | Economy | Pain loss deducted during week (service not active) | Single descending note, melancholic | 200–300 | 1.5–0.8 kHz | A:25ms D:100ms S:50ms R:80ms | LOW | Freesound: "loss" or "regret" |
| OWNER_INVESTMENT_PURCHASED | Events | Owner buys quality-of-life upgrade (laptop, chair, gym) | Brief, pleasant confirmation chime | 200–300 | 1.2–2 kHz | A:30ms D:80ms S:80ms R:80ms | MEDIUM | Freesound: "success" or "personal" |
| TUTORIAL_MOMENT | UI | Onboarding TutorialMoments component triggers | Soft, guiding tone | 250–350 | 1–1.5 kHz | A:40ms D:100ms S:100ms R:100ms | LOW-MEDIUM | Freesound: "help" or "gentle notification" |

---

## Audio Implementation Notes

### 1. UI Layer (Clicks, Tabs, Toggles)
- **Audio context**: Initialize on first user interaction (due to browser autoplay policies)
- **Volume**: UI clicks at ~-18 dB relative to master, hover at -25 dB
- **Spatial**: Mono; no positional panning needed
- **Caching**: Pre-load all UI SFX on app init to avoid latency on first button press

### 2. Event Modal Choreography
- **EVENT_APPEAR_* + MODAL_OPEN**: Stagger by 100–150 ms for perceived clarity
  - MODAL_OPEN plays first (0 ms)
  - EVENT_APPEAR_* plays at +80 ms
- **CHOICE_MADE**: Play on button press, before state update so feedback is immediate
- **Event queue indicator**: If queueLength > 0, optional quiet pulse every 2–3s (frequency 0.8 kHz, amplitude -30 dB)

### 3. Economy Sounds
- **Cash flows**: Stack CASH_IN_* / CASH_OUT in sequence if multiple transactions occur same day
  - Limit concurrent instances to 2 max (to prevent cacophony)
  - Stagger by 50–100 ms
- **BANKRUPTCY_WARNING**: Begin repeating once balance enters danger (≤ 10% of tier-1 startup capital)
  - Each pulse 600–1000 ms apart, fade volume over 4–5 repeats if balance recovers
  - Stop immediately on recovery or game-over

### 4. NPC & Arc Events
- **NPC_APPEARS**: Play when event modal shows (NOT at reveal time in roster—too early)
- **Arc resolutions**: Play when modal opens, not on backend state change
- **OPINION_PINNED**: Play only if user explicitly pins (👌 button in NPCRosterModal), not on auto-eviction

### 5. Crisis & Defeat
- **CRISIS_APPEAR + EVENT_APPEAR_NEGATIVE**: Slightly compressed timing (~30 ms gap) to feel urgent
- **DEFEAT** (bankruptcy/burnout/reputation/other): Must not be surprising—BANKRUPTCY_WARNING will have played for weeks
  - Play DEFEAT sound at 0 ms of VictoryModal mount
- **VICTORY**: Play immediately on mount, sustained so player savors moment

### 6. Mobile Considerations
- **No 3D spatialization**: All sounds mono
- **Speaker safety**: Maximum peak at -6 dB (phone speakers distort at 0 dB)
- **Touch vs. pointer**: Treat both as button press (no hover sound on mobile)
- **Bandwidth**: Total SFX library ≈ 1.2–1.8 MB (compressed MP3/AAC at 128 kbps)

### 7. Accessibility & Clarity
- **Never rely solely on audio** for game-critical information:
  - All modals have visual indicators (title, banner color, emoji)
  - All state changes have UI feedback (color, animation, text)
  - Error messages always display text
- **VCA (Volume Control Automation)**:
  - "UI" bus: -18 dB default
  - "Economy" bus: -15 dB default
  - "Events" bus: -12 dB default (slightly louder than UI)
  - "Master": -6 dB ceiling

### 8. Silence/Muting
- **Mute button in SettingsModal**: Toggle `audioMuted` flag in gameStore
  - When true, all sounds suppress (no audio context or silent nodes)
- **Volume slider** (future): Range 0–100%, exponential curve (-60 dB to -6 dB)

---

## Event Trigger Map

### Modals (14 total)
1. **EventModal** → EVENT_APPEAR_POSITIVE/NEUTRAL/NEGATIVE + MODAL_OPEN
2. **AchievementsModal** → MODAL_OPEN; interior achievement items: none (just visual)
3. **NPCRosterModal** → MODAL_OPEN; on pin: OPINION_PINNED
4. **CashRegisterModal** → MODAL_OPEN; on confirm: REGISTER_PURCHASED
5. **PromoCodeModal** → PROMO_CODE_UNLOCK (fires on modal mount)
6. **HireEmployeeModal** → MODAL_OPEN; on confirm: EMPLOYEE_HIRED
7. **OwnerInvestmentsModal** → MODAL_OPEN; on confirm: OWNER_INVESTMENT_PURCHASED
8. **SettingsModal** → MODAL_OPEN; on mute toggle: TOGGLE_OFF/TOGGLE_ON
9. **HelpModal** → MODAL_OPEN
10. **VictoryModal** (victory=true) → VICTORY sound on mount
11. **VictoryModal** (victory=false) → DEFEAT sound on mount
12. **AssortmentModal** → MODAL_OPEN
13. **CampaignModal** → MODAL_OPEN; on launch: CAMPAIGN_STARTED
14. **UpgradesModal** → MODAL_OPEN; on purchase: UPGRADE_PURCHASED

### Game Flow (via weekCalculator.ts & eventGenerator.ts)
- **DAY_ADVANCE**: NextDayButton → completeActionsPhase()
- **WEEK_ADVANCE**: processWeek() completes → WeekResultsOverlay mounts → WEEK_ADVANCE + WEEK_RESULTS_APPEAR
- **MILESTONE_REACHED**: pendingMilestoneCelebration != null → MILESTONE_REACHED sound
- **VICTORY**: victoryChecker passes → VictoryModal mount → VICTORY
- **DEFEAT**: gameOverReason set → VictoryModal mount → DEFEAT
- **SAVE_LOADED**: gameStore init with valid localStorage state → SAVE_LOADED (once per session)
- **BANKRUPTCY_WARNING**: balance ≤ 0 → begins repeating, stops on recovery or DEFEAT

### Economy Events
- **CASH_IN_SMALL/MEDIUM/LARGE**: lastDayResult.revenue > 0 during day end
  - Tier based on: if revenue > 5000: LARGE, elif > 500: MEDIUM, else: SMALL
- **CASH_OUT**: subscriptionCost, operatingCosts, taxCost deducted → CASH_OUT (1 sound per day, not per line item)
- **LOAN_TAKEN**: Loan activated via event option with requiredService:'bank' → LOAN_TAKEN
- **LOAN_REPAID**: Loan.daysRemaining ≤ 0 in next processWeek() → LOAN_REPAID

### Event-Specific Sounds
- **CHOICE_MADE**: eventModal option button click
- **ACHIEVEMENT_UNLOCKED**: achievementChecker returns new achievement → ACHIEVEMENT_UNLOCKED on modal open
- **NPC_APPEARS**: EventModal opens with npcId field → NPC_APPEARS if not yet revealed
- **NPC_ARC_RESOLVED_POSITIVE/NEGATIVE**: EventModal opens with event in NPC_ARC_EVENTS, outcome determined by option consequences
- **CRISIS_APPEAR**: EventModal opens with event.id matching CRISIS_* pattern
- **CRISIS_RESOLVED_SUCCESS/LOSS**: Determined post-choice (SUCCESS if loss < major; LOSS if major damage)
- **QUALITY_IMPROVED/DECLINED**: qualityLevel changes in economyEngine
- **STOCK_LOW**: stockPct < 25 in DashboardView render (non-modal; optional ambient alert)
- **SYNERGY_ACTIVE**: getActiveSynergies() returns non-empty → SYNERGY_ACTIVE on first activation per week

---

## Freesound Reference Tags

For sound design team: Start searches on **freesound.org** with these terms:

| Sound | Search Term | Example IDs | Notes |
|-------|-----------|-----------|-------|
| UI Click | "ui click" OR "button click" OR "beep" | #478271, #521147 | Avoid harsh/loud; 80–180 ms sweet spot |
| Hover | "mouse hover" OR "whoosh" OR "air" | #185235 | Very subtle, –25 dB mix level |
| Modal Open | "glass" OR "whoosh" OR "transition" OR "slide" | #455878, #521360 | Smooth, no jarring discontinuities |
| Fanfare | "fanfare" OR "victory" OR "success" | #485308, #462119 | Orchestral, minor-key preferred |
| Chime | "chime" OR "bell" OR "notification" | #327373 | Bright, clear, ~1–2 kHz |
| Cash Register | "cash register" OR "coin drop" | #463421 | Metallic, percussive |
| Alarm | "alarm" OR "warning" OR "buzzer" | #188570 | Sub-bass (0.1–0.4 kHz), pulsing |
| Sad/Fail | "sad trombone" OR "fail" OR "sad horn" | #189848 | Minor key, descending, muted tone |
| Unlock | "unlock" OR "power-up" OR "positive" | #517261 | Ascending, celebratory, major key |
| Knock | "knock" OR "door knock" OR "official" | #315247 | Pattern-based (3 short + 1 long), steady |
| Explosion | "metal hit" OR "impact" (for stakes events) | [Use sparingly] | Only for true crisis moments |

---

## Testing Checklist

- [ ] All SFX load within 3 seconds of app init
- [ ] UI clicks audible on phone speaker (at 50% volume)
- [ ] No clipping/distortion at master -6 dB
- [ ] Event modals produce audio feedback within 100 ms of user action
- [ ] Victory/defeat sounds play correctly on both desktop and mobile
- [ ] Mute toggle silences all future sounds (not retroactively)
- [ ] NPC arc sounds distinguish positive vs. negative outcomes aurally
- [ ] Crisis alarm repeats do not become irritating over 30+ days of danger
- [ ] CHOICE_MADE sound is distinct from MODAL_OPEN (no overlap)
- [ ] Concurrent sounds (e.g., WEEK_ADVANCE + MILESTONE_REACHED) do not clip
- [ ] Mobile touch events do not trigger multiple clicks (deduplicate within 200 ms)

---

## Future Enhancements (Out of Scope)

- Background music (ambient, context-aware)
- Voice lines (character dialogue)
- Spatial audio (for multi-room audio or VR variants)
- Real-time music ducking (volume reduction during crisis events)
- Procedural sound generation (client-side synthesis for variety)
- Haptic feedback mapping (vibration on mobile)

---

## Notes for Audio Director

1. **Sonic Palette**: Target a "professional SaaS" tone—clean, trustworthy, with subtle warmth. Avoid cartoon-like or overly gamified sounds.
2. **Emotional Arc**: Game progression mirrors economic climb. SFX should feel increasingly triumphant early-game, more tense mid-game (crises), and either euphoric (victory) or regretful (defeat) at end.
3. **Kontour Brand Presence**: When a Kontour service option is chosen, consider a subtle branding signature (e.g., a faint "Kontour" chime or warmth in tone). Not required—keep it optional.
4. **Silence as Tool**: Strategic silence (especially before DEFEAT or VICTORY) amplifies impact. Don't fill every moment with sound.
5. **Mobile-First Testing**: Always A/B test on actual phones (iOS & Android) before finalizing. Headphones can mask speaker limitations.

---

**Total SFX Count: 47 distinct cues**  
**Estimated Library Size: 1.2–1.8 MB (compressed)**  
**Recommended Format: MP3 (128 kbps) or AAC (96 kbps) for web**
