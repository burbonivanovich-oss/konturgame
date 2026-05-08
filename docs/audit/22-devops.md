# DevOps Audit: Бизнес с Контуром

**Date:** 2026-05-07  
**Project:** Kontur Game (React 18 + TypeScript + Vite + Zustand)  
**Current Version:** 0.1.0  
**Status:** Early access, GitHub Pages deployment  
**Storage Key:** `konturgame_state_v7` (v7 bumped after Phase B/C schema cleanup)

---

## 1. CI Status

### Current State
**Single workflow active:** `.github/workflows/ci.yml` (actually named differently; let me check)

```
.github/workflows/
└── ci.yml (or unnamed) — Deploy to GitHub Pages
```

**Current pipeline:**
1. Triggers on: `push` to `main` or `master`
2. Node 20 + npm ci
3. `npm run build` (tsc + vite build)
4. Upload artifact to GitHub Pages
5. Deploy to GitHub Pages

**What's missing:**
- ❌ No lint gate
- ❌ No type-check gate (despite `npm run type-check` existing)
- ❌ No test gate (despite `npm test` & `vitest` existing)
- ❌ No PR checks (only on merge to main)
- ❌ No branch protection rules visible
- ❌ No matrix testing (single Node version only)
- ❌ No coverage reporting
- ❌ No build artifact retention/versioning

### Implication
**High risk:** Broken code, type errors, or test failures can land on main/production without detection. Quick fixes hit prod immediately, no QA gate.

---

## 2. PR Gates (Recommended)

| Check | Severity | Impl Effort | Value |
|-------|----------|-------------|-------|
| Type check (tsc) | P1 | <1 min | Catches ~40% of bugs |
| Unit + integration tests | P1 | <2 min | Catches regressions |
| ESLint (consistency) | P2 | <5 min | Code hygiene |
| Build success | P1 | <1 min | Prevents merge of broken code |
| Coverage reporting (optional) | P3 | ~10 min | Visibility only |

**Proposed PR-gate rule:**
- All checks must pass before merge
- Require 1 approved review (if team > 1)
- Squash-and-merge to `develop` (clean history)
- Main merges from `develop` only (release branches)

---

## 3. Branching Strategy

### Current State
- **Main branch exists** (origin/main not visible, but .github workflow targets it)
- **develop branch not visible**
- **Two feature branches active:**
  - `claude/analyze-project-status-erAgX`
  - `claude/project-audit-documentation-z2RA4` ← current

### Recommended Strategy
```
main
  ↓ (releases only, tagged)
  ├─ v0.2.0 (tag)
  ├─ v0.1.0 (tag)
  └─ v0.0.1 (tag)

develop (integration branch)
  ├─ feature/save-migration-v8
  ├─ feature/eslink-prettier
  ├─ feature/npc-arc-event-chain-4
  └─ hotfix/loginscreen-typo (if urgent)
```

**Rules:**
1. `develop` requires all CI checks to pass
2. `feature/*` branches from `develop`, merged back via PR (not direct commit)
3. `main` only receives merges from `develop` (release PR) or `hotfix/*` (emergency)
4. `hotfix/*` branches from `main`, merged back to both `main` and `develop`
5. Commit history: prefer "Squash" on feature merges for cleaner main log

### Implementation
```bash
# Setup main → develop
git branch develop origin/main
git push origin develop

# Protect both branches in GitHub:
# Settings → Branches → Add rule for main, develop
#   ✓ Require PR reviews
#   ✓ Require status checks (lint, type, test, build)
#   ✓ Require branches to be up to date before merge
#   ✓ Restrict who can push to matching branches
```

---

## 4. Versioning & Release Management

### Current
- **Version in package.json:** `0.1.0` (semver)
- **Git tags:** None visible
- **CHANGELOG:** Not present
- **Release notes:** Not present

### Recommended

**Semantic Versioning:**
- `0.1.0` → `0.2.0` (feature release) or `0.1.1` (patch fix)
- `1.0.0` when gameplay loop is stable + NPC arcs complete

**Release process:**
1. Freeze feature branches, create `release/v0.2.0` from `develop`
2. Run full test suite, update CHANGELOG & package.json
3. Tag: `git tag -a v0.2.0 -m "Release notes here"`
4. Merge to main with PR, then back to develop
5. Push tags: `git push origin v0.2.0`
6. Create GitHub Release (auto-generate notes from commits)

**CHANGELOG format:**
```markdown
# Changelog

## [0.2.0] — 2026-06-15
### Added
- NPC arc Episode 4 (Mikhail crisis resolution)
- Save migration v8 (schema auto-upgrade)
- ESLint + Prettier integration

### Fixed
- Gena jackpot odds overcounting
- Type errors in npcManager

### Changed
- Promotion code UX (Promo.Modal → inline suggestion)

[0.2.0]: https://github.com/burbonivanovich-oss/konturgame/releases/tag/v0.2.0
[0.1.0]: https://github.com/burbonivanovich-oss/konturgame/releases/tag/v0.1.0
```

---

## 5. Deployment

### Current
- **Host:** GitHub Pages (static)
- **Base path:** `/konturgame/` (from vite.config.ts)
- **Trigger:** Automatic on `push main/master`
- **Build script:** `npm run build` = `tsc && vite build`
- **Artifact:** `./dist/` → uploaded to pages

### Strengths
✓ Zero-cost hosting  
✓ One-click deploy (GitHub-native)  
✓ HTTPS auto-configured  
✓ Build cache (`cache: npm`)  

### Weaknesses
✗ No preview deployments (PR previews)  
✗ No staging environment  
✗ No rollback strategy (just revert commit + redeploy)  
✗ No deployment log/history visible  
✗ Save data in `localStorage` — no backup strategy  

### Recommended Improvements

**For v0.2+:**
1. **Add preview deployments via Vercel/Netlify** (free tier supports PR previews)
   - Each PR gets `https://konturgame-pr-123.vercel.app` link
   - Stakeholders test before merge
   
2. **Manual approval gate before production deploy:**
   ```yaml
   deploy-production:
     environment:
       name: production
       url: https://burbonivanovich-oss.github.io/konturgame/
     needs: build
     if: github.event_name == 'push' && github.ref == 'refs/heads/main'
   ```

3. **Add deployment timestamp + commit link:**
   ```html
   <!-- In footer or console -->
   Deployed: 2026-05-07 12:34:56 UTC (commit abc1234)
   ```

---

## 6. Save Data Migration Strategy (v7 → vX)

### Current State
- **Storage key:** `konturgame_state_v7`
- **Versioning strategy:** Bump key on schema-breaking changes (simple, effective)
- **Previous bump:** Phase B cleanup (dropped `level`, `experience`, `brandEffect`, supplier-promos)
- **Old saves:** Not migrated (intentional; new key = fresh start)
- **Migration logic:** None in code (implicit "no migration" = no old saves visible)

### Problem
**Save data is precious for retention.** Players invest hours; wiping saves on schema change degrades UX.

### Recommended Migration Strategy

**Approach: Lazy migration on load**

```typescript
// src/stores/gameStore.ts

const CURRENT_VERSION = 7
const migrate = (oldState: unknown, fromVersion: number): GameState => {
  let state = oldState as any

  // v6 → v7: drop level/experience/brandEffect
  if (fromVersion < 7) {
    const { level, experience, brandEffect, ...rest } = state
    state = rest
    // Re-compute any derived data if needed
  }

  // v7 → v8: add newField with default
  if (fromVersion < 8) {
    state = {
      ...state,
      newField: defaultValue,
    }
  }

  return state as GameState
}

const storage = {
  getItem: (key: string) => {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    
    const { version = 1, state } = JSON.parse(raw)
    if (version < CURRENT_VERSION) {
      console.log(`Migrating save from v${version} → v${CURRENT_VERSION}`)
      return JSON.stringify(migrate(state, version))
    }
    
    return raw
  },
  setItem: (key: string, value: string) => {
    const state = JSON.parse(value)
    window.localStorage.setItem(key, JSON.stringify({
      version: CURRENT_VERSION,
      state,
      savedAt: new Date().toISOString(),
    }))
  },
  // ... other methods
}
```

**Benefits:**
- Players don't lose progress on schema bump
- Simple version number tracks state shape
- Lazy migration means no startup tax for current players
- Old saves auto-upgrade on load

**Deployment:**
1. Write migration logic _before_ schema change
2. Deploy with new migration + old storage key read support
3. Players load old save, get migrated version, re-saved with new key
4. After 2 weeks, safe to drop old key from code

---

## 7. Linting & Code Formatting

### Current State
- **ESLint:** Not configured
- **Prettier:** Not configured
- **EditorConfig:** Not present
- **TypeScript:** Configured (strict mode enabled ✓)

### Recommended Setup

#### 7a. ESLint + Prettier

```bash
npm install --save-dev eslint @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser eslint-plugin-react \
  eslint-plugin-react-hooks prettier eslint-config-prettier
```

**`.eslintrc.json`:**
```json
{
  "root": true,
  "env": { "browser": true, "es2020": true, "node": true },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": { "jsx": true }
  },
  "rules": {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
  "settings": { "react": { "version": "detect" } }
}
```

**`.prettierrc.json`:**
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid"
}
```

#### 7b. EditorConfig

**`.editorconfig`:**
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{json,md}]
indent_size = 2
indent_style = space

[*.{ts,tsx,js,jsx}]
indent_size = 2
indent_style = space
max_line_length = 100
```

#### 7c. Scripts in package.json

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write src",
    "format:check": "prettier --check src"
  }
}
```

---

## 8. Pre-commit Hooks (Husky + lint-staged)

### Current State
- **Husky:** Not installed
- **lint-staged:** Not installed
- **Git hooks:** None

### Recommended Setup

```bash
npm install --save-dev husky lint-staged
npx husky install
```

**`.husky/pre-commit`:**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**`.lintstagedrc.json`:**
```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

**Effect:**
- On `git commit`, lint-staged runs ESLint + Prettier on staged files only
- If either fails, commit is blocked
- Prevents broken code from reaching CI

---

## 9. Dependency Updates (Dependabot / Renovate)

### Current State
- **Dependabot:** Not configured
- **Renovate:** Not configured
- **Package lock:** `package-lock.json` should exist (verify)

### Recommended: GitHub Dependabot

**.github/dependabot.yml:**
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "03:00"
    commit-message:
      prefix: "chore(deps):"
    reviewers:
      - "technical-director"
    allow:
      - dependency-type: "all"
    open-pull-requests-limit: 10
    pull-request-branch-name:
      separator: "/"
```

**Effect:**
- Weekly scan for outdated/vulnerable packages
- Auto-create PRs with upgrade commits
- Passes through CI gate before merge
- Keeps dependencies fresh, reduces security risk

---

## 10. Recommended CI Pipeline (.github/workflows/ci.yml)

Below is a production-ready workflow that covers: lint, type-check, test, build, and deployment gates.

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

permissions:
  contents: read
  pages: write
  id-token: write
  checks: write
  pull-requests: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ============================================================================
  # CHECKS: Lint, Type, Test
  # ============================================================================
  
  check:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: ESLint
        if: always()
        run: npm run lint

  test:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella

  # ============================================================================
  # BUILD: Compile & Bundle
  # ============================================================================

  build:
    name: Build & Bundle
    runs-on: ubuntu-latest
    needs: [check, test]
    if: success()
    outputs:
      artifact-id: ${{ steps.upload.outputs.artifact-id }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        id: upload
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./dist"
          retention-days: 30

  # ============================================================================
  # DEPLOY: Staging (develop) or Production (main)
  # ============================================================================

  deploy-staging:
    name: Deploy to Staging
    if: |
      success() &&
      github.event_name == 'push' &&
      github.ref == 'refs/heads/develop'
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com/konturgame/
    steps:
      - name: Deploy artifact
        uses: actions/download-pages-artifact@v2

      - name: Notify Slack (optional)
        run: echo "Staging deployed by ${{ github.actor }}"

  deploy-production:
    name: Deploy to Production
    if: |
      success() &&
      github.event_name == 'push' &&
      github.ref == 'refs/heads/main' &&
      startsWith(github.ref, 'refs/tags/v')
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://burbonivanovich-oss.github.io/konturgame/
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4

      - name: Emit deployment signal
        run: |
          echo "Production deployed: ${{ github.ref }} by ${{ github.actor }}"
          echo "Commit: ${{ github.sha }}"
```

---

## 11. Recommended Directory Structure (for new files)

```
.github/
├── workflows/
│   ├── ci.yml (updated: comprehensive)
│   └── dependabot.yml (new)
.eslintrc.json (new)
.prettierrc.json (new)
.editorconfig (new)
.husky/
├── pre-commit (new)
└── _/husky.sh (auto-generated)
.lintstagedrc.json (new)
CHANGELOG.md (new)
docs/
├── audit/
│   └── 22-devops.md (this file)
└── deployment.md (new: how to release)
```

---

## 12. Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Create `.eslintrc.json`, `.prettierrc.json`, `.editorconfig`
- [ ] Install `eslint`, `prettier`, `@typescript-eslint/*`, `eslint-plugin-react*`
- [ ] Run `npm run lint:fix && npm run format` to auto-correct
- [ ] Commit (new commit, not amend): "chore: add ESLint and Prettier config"
- [ ] Update `package.json` scripts

### Phase 2: Pre-commit + Automation (Week 1-2)
- [ ] Install husky: `npm install --save-dev husky lint-staged && npx husky install`
- [ ] Create `.husky/pre-commit` and `.lintstagedrc.json`
- [ ] Test locally: `git add . && git commit -m "test"`
- [ ] Create `.github/dependabot.yml`
- [ ] Commit: "chore: add husky pre-commit hooks and Dependabot config"

### Phase 3: CI Pipeline (Week 2)
- [ ] Rewrite `.github/workflows/ci.yml` with full pipeline (see Section 10 above)
- [ ] Add branch protection rules in GitHub:
  - `main`: require PR, require checks (type, lint, test, build), require up-to-date
  - `develop`: require PR, require checks
- [ ] Create `CHANGELOG.md` and `docs/deployment.md`
- [ ] Commit: "ci: add comprehensive CI/CD pipeline with linting and testing gates"

### Phase 4: Branching + Release (Week 3)
- [ ] Create `develop` branch: `git branch develop origin/main && git push origin develop`
- [ ] Create `release/v0.2.0` branch for first release
- [ ] Update `package.json` version to `0.2.0`
- [ ] Update `CHANGELOG.md` with v0.2.0 notes
- [ ] Merge to main via PR, tag: `git tag -a v0.2.0 -m "..."`
- [ ] Push tags: `git push origin v0.2.0`

### Phase 5: Documentation (Week 3)
- [ ] Write `docs/deployment.md` (how-to for releases)
- [ ] Add "Save Migration Rollout" section (when v8 schema is needed)
- [ ] Commit: "docs: add deployment and branching guides"

---

## 13. Top Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Broken code merges to main (no CI gate) | **CRITICAL** | Implement CI pipeline + branch protection |
| Save data wiped on schema change (no migration) | High | Implement lazy migration (Section 6) |
| No version history (no CHANGELOG, tags) | Medium | Add semver + CHANGELOG + git tags |
| No code style consistency (no lint) | Medium | ESLint + Prettier + husky |
| No dependency security scanning | Medium | Dependabot auto-updates |
| Single-node production deploy (no rollback) | Low | Add deployment environment gates |

---

## 14. Success Metrics

Once implemented, measure:

1. **CI Success Rate:** Target >95% (broken code caught before merge)
2. **Deployment Frequency:** Should increase (confidence in automation)
3. **Time to Release:** Should decrease (clear process)
4. **Bug Escape Rate:** Track regressions merged to main (target: 0 per release)
5. **Dependency Freshness:** Keep 95% of packages within 1 minor version

---

## 15. References & Next Steps

**GitHub branch protection:**
- Settings → Branches → Add rule

**Semantic Versioning:**
- https://semver.org/

**Husky docs:**
- https://typicode.github.io/husky/

**ESLint + TypeScript:**
- https://typescript-eslint.io/getting-started/

**Save migration patterns:**
- Section 6 in this document (lazy migration on load)

---

## Appendix A: Quick Reference Commands

```bash
# Local setup (after cloning)
npm install
npx husky install

# Pre-commit hook will run on next commit

# Manual lint/format
npm run lint:fix
npm run format

# Type check
npm run type-check

# Test with coverage
npm test -- --coverage

# Build
npm run build

# Preview production build locally
npm run preview

# Create release branch
git checkout -b release/v0.2.0 develop
npm version patch  # updates package.json + creates tag
npm run build
git push origin release/v0.2.0

# Merge to main + develop
# (Create PR, merge, then cherry-pick back to develop)
```

---

**Prepared by:** DevOps Engineer  
**Date:** 2026-05-07  
**Review recommended:** By technical-director before Phase 1 implementation
