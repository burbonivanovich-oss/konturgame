# Art Director Audit — Бизнес с Контуром
**Date:** 2026-05-07  
**Auditor:** Art Director (AD)  
**Scope:** Design system, token layer, iconography, typography, state system

---

## 1. Visual Identity & Brand Coherence

The project carries two competing palette authorities, and this is the most critical structural problem. `src/components/design-system/tokens.ts` defines a rigorous, named semantic system (K.mint `#14B88A`, K.blue `#3D5BE6`, K.orange `#FF6A2C`) while `tailwind.config.js` declares a parallel `kontour.*` namespace with materially different hex values (`kontour.orange: #FF6B35`, `kontour.green: #4CAF50`, `kontour.blue: #1E88E5`). The green in Tailwind (`#4CAF50`) is a generic Material Design green with no relation to the brand mint (`#14B88A`) in the token file. The blue differs by over 15 points of hue. These are not aliases of the same color — they are competing sources of truth.

The consequence: any component that uses Tailwind utility classes (`text-kontour-green`, `bg-success`) will render different colors than components using inline `K.*` tokens. Without visual inspection of every component, it is impossible to guarantee brand coherence. The "legacy" comment in `tailwind.config.js` acknowledges this, but the dead values are still active and reachable.

The identity aspiration is clear and correct: a clean, professional business-software aesthetic with four brand accent hues (mint, blue, violet, orange). The `tokens.ts` file executes this well. The Tailwind config undermines it.

---

## 2. Game Feel vs Dashboard Aesthetic

The design system leans decisively toward enterprise dashboard — neutral ink-on-paper, controlled accent usage, no expressive background surfaces. This is a conscious and defensible choice for a business-management simulator. The player is meant to feel like they are running a real business, not playing a cartoon game. Kontур's actual product UI is the reference point.

However, the current system has no mechanism to inject game feel at critical emotional moments: a successful week, a crisis event, an NPC arc resolution. There are no defined elevation states, no surface tinting for game states, and no documented dark/highlight mode for moments like week results or victory. The token file has `K.good`, `K.warn`, `K.bad` for semantic states, but nothing for "celebration" or "tension" surfaces — the palette has no emotional range outside of error states.

The risk: players experience a flat emotional register across all game events. The dashboard aesthetic should be the neutral resting state, not the ceiling.

---

## 3. Token System Discipline

`tokens.ts` is well-structured. The ink opacity scale (`ink`, `ink2`, `muted`, `muted2`, `line`, `lineSoft`) follows a disciplined 100/70/50/30/10 progression, which is correct practice for building accessible text hierarchies from a single base color. The soft-color pattern (each brand hue paired with a `*Soft` and `*Ink` variant) gives the system a complete set of chip, badge, and tinted-surface building blocks.

Critical failures:

- **No spacing tokens.** Tailwind extends spacing with only `128: 32rem`. All component spacing relies on bare Tailwind numbers (`p-4`, `gap-3`), meaning there is no semantic spacing vocabulary (e.g., `space-xs`, `space-card-padding`).
- **No shadow/elevation tokens.** There is no defined elevation scale. This matters for modals, tooltips, and overlays — currently each component invents its own shadow.
- **No animation tokens.** No defined duration or easing constants. Microinteraction timing will be inconsistent across components.
- **Tailwind is not wired to tokens.** The `K.*` tokens live only in TypeScript and must be used as inline styles. Tailwind utility classes cannot reference them. This forces a bifurcated authoring pattern: some components use Tailwind, others use inline styles, and the two layers cannot be trivially combined.

---

## 4. Iconography & Typography

**Icons:** `KIcon.tsx` is a hand-rolled inline SVG sprite with 35 icons. The approach is correct for a project of this scope — no external dependency, fully tree-shakeable, consistent `viewBox="0 0 24 24"`. All icons share a single visual language: outline style, `strokeWidth: 1.6`, round caps and joins. This is internally coherent.

Concerns:
- The default stroke width `1.6` at `size=16` renders as a very thin line at 1x display. At 16px icon size, 1.6/24 of the viewport = approximately 1px effective stroke. On non-retina screens this will appear hairline and low-contrast, particularly for secondary icons on `K.paper2` backgrounds.
- The `salon` icon (scissors metaphor via circles and crossing paths) reads ambiguously. At 16px it could be confused with a settings or network icon. At minimum, test at actual render size.
- No icon for `npc`, `loan`, `tax`, or `achievement` is defined — these are core game concepts that will need iconographic representation. The default fallback (a plain circle) will appear in any unconditional use.

**Typography:** A custom typeface, Lab Grotesque K, is declared as the primary sans font. This is a deliberate brand alignment choice — it signals that the game's UI is an extension of Kontür's actual product. The fallback chain (`-apple-system`, `BlinkMacSystemFont`) is appropriate for web. No type scale is defined in the token system: no documented size, line-height, weight, or tracking values. Every component invents its own text sizing via bare Tailwind (`text-sm`, `text-xs`, `font-semibold`), which means no guaranteed type hierarchy across screens.

---

## 5. State System (success / warning / error)

The semantic trio `K.good (#14B88A)`, `K.warn (#FFB020)`, `K.bad (#FF5A5A)` is defined and named correctly. Green for positive, amber for warning, red for critical. Hue distance between the three is sufficient for colorblind-safe differentiation (green vs red is problematic for deuteranopia, but the lightness difference is significant enough to preserve distinction in most cases).

However:

- `K.good` and `K.mint` are the same hex value (`#14B88A`). This creates a semantic collision: the brand's primary accent color and the "success" state color are identical. A player who sees green cannot immediately distinguish "this is Kontür branding" from "this is a positive outcome signal." These should be differentiated — either by reserving mint for brand and using a distinct success green, or by deliberately unifying them with documented intent.
- The Tailwind `success: #4CAF50` is a third, different green — a brighter, more saturated value. All three greens will appear simultaneously in the UI if components mix authoring patterns.
- No "neutral/inactive" state token is defined for disabled controls or locked services. `K.bone` and `K.muted` partially serve this role but are not formally assigned.

---

## 6. Animation & Microinteractions

No animation tokens, keyframes, or documented interaction states exist in the design system files reviewed. This is a significant gap for a game: week-end results, NPC events, service unlock moments, and achievement pops all require distinct motion signatures to feel rewarding.

The absence is not yet a production problem — the game can function without animation — but it becomes a debt item the moment a developer implements the first transition, because without a defined system every component will invent its own timing.

Minimum required definitions:
- Duration scale: `instant (0ms)`, `fast (120ms)`, `base (200ms)`, `slow (350ms)`, `dramatic (600ms)`
- Easing vocabulary: `ease-out` for entrances, `ease-in` for exits, `ease-in-out` for state transitions
- Reserved motion patterns for: positive outcome (scale up + fade), negative outcome (horizontal shake), unlock (scale + glow pulse)

These should be added to `tokens.ts` and bridged into Tailwind via the `theme.extend.transitionDuration` and `theme.extend.transitionTimingFunction` keys.

---

## 7. Top-5 Recommendations

**R1 — Unify palette authority (Critical)**  
Delete the `kontour.*` and legacy color keys from `tailwind.config.js`. Add the `K.*` token values to `tailwind.config.js` under a single `k.*` namespace so Tailwind utilities resolve to the same values as inline token references. This single change eliminates the double-palette problem and enforces one source of truth. Priority: do before any UI polish work.

**R2 — Differentiate brand accent from success state (High)**  
`K.mint` and `K.good` must not share the same hex. Shift `K.good` to `#1DBF94` (lighter, more saturated) or shift `K.mint` to a distinct brand teal. Document the distinction explicitly in tokens.ts: "mint = brand identity, good = outcome positive."

**R3 — Define a minimum type scale (High)**  
Add a documented type scale to tokens.ts or a new `typography.ts` file: at minimum `label-xs`, `label-sm`, `body`, `heading-sm`, `heading-md`. Map each to a size, weight, and line-height. Bridge into `tailwind.config.js` via `theme.extend.fontSize`. This gives every developer the same vocabulary and prevents ad-hoc `text-xs font-semibold` combinations diverging across screens.

**R4 — Raise icon stroke weight at small sizes (Medium)**  
For icon instances rendered at 16px or below, increase `strokeWidth` to `2.0`. For 20–24px, keep `1.6`. Add a `size` breakpoint check inside `KIcon` or document the convention. This prevents hairline rendering on 1x displays and improves accessibility for players with lower visual acuity.

**R5 — Add a minimal animation token layer (Medium)**  
Add duration and easing constants to `tokens.ts`. Map them to Tailwind's `transitionDuration` and `transitionTimingFunction` extensions. Define three named motion signatures (positive, negative, unlock) in a design comment. This constrains microinteraction inconsistency before it compounds, and gives the technical artist a vocabulary to implement VFX overlays against.
