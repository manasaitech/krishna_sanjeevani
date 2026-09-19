# Mode Architecture — Developer Guide

## 1. What Are the Two Modes?

This project can operate as **two completely different products** controlled by a single configuration value:

| Mode | Value | Product |
|---|---|---|
| **Surawali** | `surawali` | Krishna Sanjeevani — therapeutic raga streaming with 3 Sanjeevani themes (Krishna, Arogya, Garbh) |
| **Emotion Remediation** | `emotion_remediation` | Emotion Remediation — emotional wellness platform with a single unified theme |

A user of one mode must **never know the other mode exists**.

---

## 2. How the Active Mode Is Configured

### Frontend (Vite)

The mode is set via the `VITE_APP_MODE` environment variable:

```env
# .env.surawali
VITE_APP_MODE=surawali

# .env.emotion-remediation
VITE_APP_MODE=emotion_remediation
```

This is read at build time via `import.meta.env.VITE_APP_MODE` in `src/core/mode/config.ts`.

### Backend (Cloudflare Worker)

Set `APP_MODE` in `backend/wrangler.jsonc` under `vars`:

```jsonc
"vars": {
  "APP_MODE": "surawali"
}
```

Or use Cloudflare secrets for production:
```bash
wrangler secret put APP_MODE
```

---

## 3. Folder Structure

```
src/
├── core/                          # Shared infrastructure
│   ├── mode/                      # Mode abstraction layer
│   │   ├── types.ts               # Type definitions (AppMode, ModeConfig, etc.)
│   │   ├── config.ts              # getActiveMode(), getModeConfig()
│   │   ├── context.tsx            # ModeProvider, useMode() hook
│   │   ├── features.ts            # Feature flags per mode
│   │   └── index.ts               # Barrel export
│   └── services/
│       └── usage-tracking.ts      # Centralised usage tracking service
│
├── modes/
│   ├── surawali/                  # Surawali-specific code
│   │   ├── config.ts              # ModeConfig assembly
│   │   ├── theme.ts               # 3 Sanjeevani themes
│   │   ├── routes.ts              # Route definitions
│   │   ├── content-provider.ts    # Content mapping
│   │   ├── search-provider.ts     # Search implementation
│   │   └── subscription-config.ts # Pricing & business rules
│   │
│   └── emotion-remediation/       # Emotion-specific code
│       ├── config.ts              # ModeConfig assembly
│       ├── theme.ts               # Single unified theme
│       ├── routes.ts              # Route definitions
│       ├── content-provider.ts    # Placeholder content mapping
│       ├── search-provider.ts     # Placeholder search
│       ├── subscription-config.ts # Placeholder pricing
│       └── pages/                 # Emotion-specific pages
│           └── EmotionHome.tsx
│
├── components/                    # Shared UI components
├── hooks/                         # Shared React hooks
├── lib/                           # Shared utilities (api, content types, state)
├── routes/                        # TanStack file-based routes (shared shell)
└── assets/                        # Shared + Surawali assets

backend/
├── src/
│   ├── shared/
│   │   ├── config/
│   │   │   ├── env.ts             # Env interface with APP_MODE
│   │   │   └── mode.ts            # getAppMode(), getPaymentCredentials()
│   │   └── db/schema/             # Shared DB schema
│   └── modules/                   # Feature modules (auth, tracks, etc.)
└── wrangler.jsonc                 # APP_MODE in vars
```

---

## 4. Shared vs Mode-Specific Code

### Shared (`src/core/`, `src/lib/`, `src/components/ui/`)
- Authentication, API client, HTTP handling
- User management, session handling
- Player infrastructure, audio streaming
- Payment interface (provider pattern)
- Usage tracking, analytics
- Error handling, logging
- Common UI primitives (buttons, modals, cards)

### Surawali-specific (`src/modes/surawali/`)
- Krishna/Arogya/Garbh Sanjeevani themes
- Surawali content mapping & catalog
- Raga/purpose-based search
- 3/6/12 month subscriptions, installments
- Vedic science, inspiration, pregnancy journey pages

### Emotion Remediation-specific (`src/modes/emotion-remediation/`)
- Single emotion theme
- Emotion-category content mapping
- Emotion-aware search
- Emotion-specific subscription rules
- Emotion home & dashboard pages

> **Rule: Never put mode-specific business logic inside shared core.**

---

## 5. How to Run Each Mode

### Surawali (default)
```bash
npm run dev                # Uses default mode (surawali)
npm run dev:surawali       # Explicitly uses .env.surawali
```

### Emotion Remediation
```bash
npm run dev:emotion        # Uses .env.emotion-remediation
```

### Backend
Edit `backend/wrangler.jsonc` → `vars.APP_MODE` to match.

---

## 6. Payment Credentials

Payment credentials are **mode-aware** and **backend-only**:

```
SURAWALI_PAYMENT_KEY     → used when APP_MODE=surawali
SURAWALI_PAYMENT_SECRET  → used when APP_MODE=surawali

EMOTION_PAYMENT_KEY      → used when APP_MODE=emotion_remediation
EMOTION_PAYMENT_SECRET   → used when APP_MODE=emotion_remediation
```

Set via Cloudflare secrets:
```bash
wrangler secret put SURAWALI_PAYMENT_KEY
wrangler secret put EMOTION_PAYMENT_KEY
```

**Never expose payment secrets to the frontend** — they exist only in `backend/src/shared/config/env.ts`.

---

## 7. Adding Features to Only One Mode

1. Create the feature code inside the appropriate `modes/` directory
2. Add the feature flag to `src/core/mode/features.ts`
3. In the mode's `config.ts`, set the flag to `true`
4. In components, use `const { hasFeature } = useMode()` to conditionally render

Example:
```tsx
const { hasFeature } = useMode();
if (hasFeature("hasPregnancyJourney")) {
  return <JourneyPage />;
}
```

---

## 8. Replacing Emotion Content Later

1. Implement `EmotionRemediationContentMappingProvider.getContent()` in  
   `src/modes/emotion-remediation/content-provider.ts`
2. Add the corresponding backend API endpoints in a new module  
   `backend/src/modules/emotion-content/`
3. Add DB tables for emotion categories/mappings
4. The architecture is already wired — just replace the placeholder

---

## 9. Replacing Emotion Search Later

1. Implement `EmotionRemediationSearchProvider.search()` in  
   `src/modes/emotion-remediation/search-provider.ts`
2. Can be client-side or call a backend search API
3. No changes needed to the mode infrastructure

---

## 10. Building/Deploying Each Mode

### Build
```bash
npm run build:surawali     # Production build for Surawali
npm run build:emotion      # Production build for Emotion Remediation
```

### Deploy (Cloudflare)
```bash
# Surawali backend
cd backend && wrangler deploy  # APP_MODE=surawali in wrangler.jsonc

# Emotion backend (separate wrangler config or env override)
cd backend && APP_MODE=emotion_remediation wrangler deploy
```

---

## 11. Future Repository Separation

The architecture is designed for clean extraction:

```
SURAWALI REPOSITORY          EMOTION REMEDIATION REPOSITORY
├── src/core/                ├── src/core/
├── src/modes/surawali/      ├── src/modes/emotion-remediation/
├── src/lib/                 ├── src/lib/
├── src/components/          ├── src/components/
├── backend/src/shared/      ├── backend/src/shared/
└── backend/src/modules/     └── backend/src/modules/
```

Steps:
1. Copy the `core/` and shared `lib/`/`components/` to both repos
2. Copy only the relevant `modes/` directory to each repo
3. Remove the other mode's config from `MODE_CONFIGS`
4. Each repo is now independent

**This works because modes never import from each other.**

---

## 12. Key Interfaces

### ModeConfig
```ts
interface ModeConfig {
  mode: AppMode;
  branding: ModeBranding;
  features: ModeFeatures;
  routes: ModeRouteConfig;
  subscriptions: ModeSubscriptionConfig;
  navigation: { sidebar: NavItem[]; bottomNav: NavItem[] };
  contentProvider: ContentMappingProvider;
  searchProvider: ContentSearchProvider;
}
```

### useMode() Hook
```tsx
const {
  mode,           // "surawali" | "emotion_remediation"
  branding,       // { appName, tagline, primaryColor, ... }
  features,       // { hasSanjeevaniSelection, hasEmotionRemediation, ... }
  hasFeature,     // (key) => boolean
  searchProvider, // ContentSearchProvider instance
  contentProvider,// ContentMappingProvider instance
  subscriptions,  // ModeSubscriptionConfig
  navigation,     // { sidebar, bottomNav }
} = useMode();
```
