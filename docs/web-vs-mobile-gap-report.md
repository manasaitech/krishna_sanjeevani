# Krishna Sanjeevani — Web vs. Mobile Gap Report

> **Audit Date:** 2026-08-14  
> **Scope:** Complete code-level comparison of `apps/web/` vs `apps/mobile/` against `backend/`  
> **Goal:** Identify every feature present in the Web app but missing / incomplete in the Mobile app

---

## Executive Summary

The Web and Mobile applications share **~75%** of their feature surface. Both apps implement authentication, track browsing, program browsing, HLS streaming with AES-128, favorites, progress sync, pregnancy journey, subscription management, and admin dashboards. However, the Mobile app is missing **14 distinct gaps** across player controls, navigation, notifications, API SDK coverage, admin functionality, error handling, and state management. No gaps exist in the reverse direction — the Mobile app has no unique production features missing from Web.

---

## 1. Route / Screen Comparison Matrix

| Feature / Screen | Web Route | Mobile Screen | Status |
|---|---|---|---|
| Landing / Splash | `index.tsx` | `index.tsx` | ✅ Parity |
| Welcome | `welcome.tsx` | `welcome.tsx` | ✅ Parity |
| Login | `login.tsx` | `login.tsx` | ✅ Parity |
| Register | `register.tsx` | `register.tsx` | ✅ Parity |
| Category Selector | `category.tsx` | `category.tsx` | ✅ Parity |
| Home | `home.tsx` | `(tabs)/home.tsx` | ✅ Parity |
| Search | `search.tsx` | `(tabs)/search.tsx` | ✅ Parity |
| Favorites | `favorites.tsx` | `(tabs)/favorites.tsx` | ✅ Parity |
| Journey (Pregnancy) | `journey.tsx` | `(tabs)/journey.tsx` | ✅ Parity |
| Profile | `profile.tsx` | `(tabs)/profile.tsx` | ✅ Parity |
| Full Player | `player.tsx` | `player.tsx` | ⚠️ Partial — see §3 |
| Session Complete | `session-complete.tsx` | `session-complete.tsx` | ✅ Parity |
| Program Detail | `program.$programId.tsx` | `program/[programId].tsx` | ✅ Parity |
| Programs List | `programs.tsx` | — | ❌ **MISSING** |
| Recently Played | `recent.tsx` | — | ❌ **MISSING** |
| Subscription / Plans | `subscription.tsx` | `subscription.tsx` | ✅ Parity |
| Notifications (page) | (TopBar popover) | `notifications.tsx` | ✅ Parity |
| Admin Dashboard | `admin.tsx` (6,500+ lines) | `admin.tsx` (194 lines) | ❌ **STUB ONLY** |

---

## 2. API SDK Parity (`lib/api.ts`)

### 2.1 Endpoints present in Web SDK but **MISSING** from Mobile SDK

| SDK Namespace | Web Method | Mobile Status |
|---|---|---|
| `api.tracks.listAdmin()` | Lists admin tracks with filters | ❌ Missing |
| `api.tracks.unpublish()` | Unpublish a track | ❌ Missing |
| `api.tracks.getStats()` | Admin track statistics | ❌ Missing |
| `api.tracks.delete()` | Alias for `remove()` | ❌ Missing (minor) |
| `api.programs.listAdmin()` | Lists admin programs with filters | ❌ Missing |
| `api.programs.getStats()` | Admin program statistics | ❌ Missing |
| `api.programs.unpublish()` | Unpublish a program | ❌ Missing |
| `api.programs.getPregnancySchedules()` | Get pregnancy schedules for a program | ❌ Missing |
| `api.storage.*` | Full R2 storage upload/delete SDK (audio, image, multipart) | ❌ **Entirely Missing** |
| `api.admin.*` | Complete admin SDK (overview, users, subscriptions, analytics, health, payments, plans) | ❌ **Entirely Missing** |
| `http.put()` | HTTP PUT helper | ❌ Missing |

### 2.2 Endpoints at Parity

Both SDKs fully implement:
- `api.auth.*` — register, login, loginWithGoogle, logout, me, changePassword
- `api.tracks.list()`, `get()`, `create()`, `update()`, `publish()`, `archive()`, `remove()`, `listTags()`, `createTag()`
- `api.programs.list()`, `get()`, `getTracks()`, `create()`, `update()`, `publish()`, `archive()`, `remove()`, `addTrack()`, `removeTrack()`, `reorderTracks()`, `duplicate()`
- `api.pregnancy.*` — listPrograms, getToday, getByWeek, getByMonth, saveUserInfo, createSchedule, updateSchedule, removeSchedule
- `api.progress.*` — get, completeTrack, update, continueListening, history, getTrackProgress
- `api.favorites.*` — list, add, remove, status
- `api.stream.getTicket()`
- `api.plans.list()`, `api.subscriptions.*`, `api.payments.list()`

---

## 3. Player Engine & Playback Gaps

### 3.1 State Management Interface Comparison (`AppState` type)

| State Field / Method | Web | Mobile | Gap |
|---|---|---|---|
| `volume` | ✅ `useState(72)` | ❌ Not exposed | **MISSING** |
| `setVolume()` | ✅ Exposed | ❌ Not exposed | **MISSING** |
| `muted` | ✅ `useState(false)` | ❌ Not exposed | **MISSING** |
| `toggleMuted()` | ✅ Exposed | ❌ Not exposed | **MISSING** |
| `queue` | ✅ Computed `useMemo` | ❌ Not exposed | **MISSING** |
| `next()` | ✅ Step forward | ❌ Not implemented | **MISSING** |
| `previous()` | ✅ Step backward | ❌ Not implemented | **MISSING** |
| `close()` | ✅ Full player teardown | ❌ Not exposed | **MISSING** |
| `restoreSession()` | ✅ Explicit function | ⚠️ Inline `useEffect` only | Minor |
| `buffering` | ❌ Not exposed | ✅ Exposed | Mobile-only (intentional) |
| `theme` | ❌ Category themes via CSS vars | ✅ Exposed object | Platform difference (intentional) |
| `notifications` | ✅ `notificationsList` state | ❌ Not in AppState | **MISSING** |
| `markAsRead()` | ✅ Exposed | ❌ Not in AppState | **MISSING** |
| `markAllAsRead()` | ✅ Exposed | ❌ Not in AppState | **MISSING** |

### 3.2 Player Feature Matrix

| Feature | Web (hls.js + HTMLAudioElement) | Mobile (expo-av) | Gap |
|---|---|---|---|
| HLS streaming with ticket | ✅ | ✅ | Parity |
| AES-128 key delivery via ticket | ✅ | ✅ | Parity |
| Resume from saved position (D1) | ✅ | ✅ | Parity |
| Progress sync every 10s | ✅ | ✅ | Parity |
| Playback speed control | ✅ | ✅ | Parity |
| Sleep timer | ✅ | ✅ | Parity |
| Volume slider | ✅ | ❌ **Not implemented** | Gap |
| Mute toggle | ✅ | ❌ **Not implemented** | Gap |
| Queue / Up Next | ✅ Computed list | ❌ **Not implemented** | Gap |
| Next track | ✅ Auto on `ended` event | ❌ **Not implemented** | Gap |
| Previous track | ✅ | ❌ **Not implemented** | Gap |
| Auto-next on track end | ✅ `ended` → `step(1)` | ❌ `didJustFinish` only stops | Gap |
| Ticket auto-renewal on 401/403 | ✅ Full retry logic | ✅ 1-retry in `handlePlaybackError` | Parity |
| Background audio (iOS/Android) | N/A (browser tab) | ✅ `staysActiveInBackground: true` | Mobile-only (expected) |
| Close/dismiss player | ✅ `close()` + cleanup | ❌ No close button/mechanism | Gap |

### 3.3 Player UI Components

| Component | Web | Mobile | Gap |
|---|---|---|---|
| Full-screen player | ✅ `player.tsx` (348 lines) | ✅ `player.tsx` (713 lines) | Parity |
| Mini Player (bottom bar) | ✅ `PlayerBar.tsx` (348 lines) + `MiniPlayer.tsx` | ✅ `MiniPlayer.tsx` | Parity |
| Volume slider in player | ✅ `Slider` + `Volume2`/`VolumeX` icons | ❌ Not present | **Gap** |
| Queue panel in player | ✅ `ListMusic` icon + queue display | ❌ Not present | **Gap** |
| Speed selector popover | ✅ `Popover` with 5 speeds | ✅ Speed options UI | Parity |
| Sleep timer popover | ✅ `Popover` with timer options | ✅ Timer options UI | Parity |

---

## 4. Notification System

| Aspect | Web | Mobile | Gap |
|---|---|---|---|
| Static notifications data | ✅ `content.ts` → `staticNotifications` | ✅ `content.ts` → `notifications` | Parity |
| Notification state in AppState | ✅ `notificationsList`, `markAsRead`, `markAllAsRead` | ❌ Not managed in AppState | **Gap** |
| Notification popup UI | ✅ TopBar bell icon → dropdown popover | ❌ Separate screen, but no state management | **Gap** |
| Mark as read (per-item) | ✅ `markAsRead(id)` | ❌ Not implemented | **Gap** |
| Mark all as read | ✅ `markAllAsRead()` | ❌ Not implemented | **Gap** |
| Unread badge indicator | ✅ Bell icon badge in TopBar | ❌ No badge on tab/header | **Gap** |

> **Note:** Both apps use static/local notification data (not fetched from backend). However, the Web app manages this data reactively in AppState while the Mobile app just reads the static array.

---

## 5. Admin Dashboard

This is the **single largest gap** between the two apps.

| Admin Feature | Web (`admin.tsx` — 6,500+ lines) | Mobile (`admin.tsx` — 194 lines) |
|---|---|---|
| Dashboard overview (live API) | ✅ Fetches `/admin/overview` | ❌ Hardcoded static KPIs |
| Track management (CRUD) | ✅ Full list, create, edit, publish, unpublish, archive, delete, search, filter | ❌ Static list display only |
| Audio upload + processing pipeline | ✅ Multipart upload, progress bar, processing status | ❌ Not implemented |
| Program management (CRUD) | ✅ Full list, create, edit, publish, unpublish, archive, track assignment | ❌ Static list display only |
| Program track management | ✅ Add/remove/reorder tracks, drag-and-drop | ❌ Not implemented |
| User management | ✅ List, search, filter, deactivate/reactivate, detail view | ❌ Not implemented |
| Subscription management | ✅ List, search, cancel, extend, detail view, stats | ❌ Not implemented |
| Payment management | ✅ List, search, filter payments | ❌ Not implemented |
| Plan management | ✅ Edit plan pricing, toggle active status | ❌ Not implemented |
| Analytics dashboard | ✅ Charts, time-range filters | ❌ Not implemented |
| System health check | ✅ `/admin/health` endpoint | ❌ Not implemented |
| Recent activity feed | ❌ Not from API (hardcoded) | ❌ Hardcoded |

> **Summary:** The Mobile admin is a placeholder/stub with static data only. The Web admin is a full-featured CMS with CRUD for tracks, programs, users, subscriptions, payments, analytics, and system health — all backed by live API calls.

---

## 6. Navigation & Layout

| Feature | Web | Mobile | Gap |
|---|---|---|---|
| Sidebar navigation | ✅ `AppSidebar.tsx` with collapsible sections | N/A (tab navigation instead) | Platform difference |
| Bottom tab bar | ✅ `BottomNav.tsx` (mobile viewport only) | ✅ `(tabs)/_layout.tsx` | Parity |
| Top bar (header) | ✅ `TopBar.tsx` with notification bell, category switcher, search | ✅ `AppShell.tsx` with back nav | ⚠️ Mobile TopBar has no notification badge or category switcher in-header |
| Status bar styling | ✅ `StatusBar.tsx` (custom) | ✅ `expo-status-bar` | Parity |
| Route guard (auth redirect) | ✅ `RouteGuard` in `__root.tsx` | ✅ `index.tsx` redirects to `/welcome` or `/(tabs)/home` | Parity |
| 404 Not Found page | ✅ `NotFoundComponent` | ❌ No equivalent | **Gap** |
| Error boundary | ✅ `ErrorComponent` with retry + Lovable error reporting | ❌ No error boundary | **Gap** |
| Programs list page | ✅ `/programs` dedicated page | ❌ No dedicated programs browse page | **Gap** |
| Recently played page | ✅ `/recent` page | ❌ No equivalent (history is in home's "Continue Listening") | **Gap** |

---

## 7. Error Handling & Observability

| Feature | Web | Mobile | Gap |
|---|---|---|---|
| Global error boundary | ✅ TanStack Router `errorComponent` | ❌ None | **Gap** |
| Error reporting to Lovable | ✅ `lovable-error-reporting.ts` | ❌ None | **Gap** |
| Console error interception | ✅ `error-capture.ts` wraps `console.error` | ❌ None | **Gap** |
| Server-side error page | ✅ `error-page.ts` | N/A (no SSR) | Platform difference |

---

## 8. Token Storage

| Aspect | Web | Mobile | Gap |
|---|---|---|---|
| Storage mechanism | `localStorage` | In-memory variables (`_accessToken`, `_refreshToken`) | ⚠️ **Tokens lost on app restart** |
| Token refresh (auto) | ✅ On 401, attempts refresh | ✅ On 401, attempts refresh | Parity |
| Persist across sessions | ✅ `localStorage` survives tab close | ❌ Tokens lost on app kill/restart | **Gap** — needs `SecureStore` or `AsyncStorage` |

> **Impact:** Users must re-login every time the Mobile app is force-closed or device is restarted. This is a significant UX gap.

---

## 9. Shared Packages & Configuration

| Aspect | Web | Mobile | Notes |
|---|---|---|---|
| Shared packages (`packages/`) | Not used | Not used | `packages/` dir exists but empty |
| Database schema | Shared backend (`backend/src/shared/db/schema/`) | Same backend | Parity |
| CSS approach | Vanilla CSS (`styles.css`) | NativeWind (Tailwind for RN) | Platform difference |
| Framework | TanStack Start (Vite-based SSR/CSR) | Expo Router (React Native) | Platform difference |
| UI component library | 46 shadcn/ui components | 5 custom components | Expected — RN doesn't use shadcn |

---

## 10. Summary of All Gaps (Prioritized)

### 🔴 Critical (Blocking UX / Data Loss)

| # | Gap | Impact |
|---|---|---|
| 1 | **Token persistence** — in-memory tokens lost on app restart | Users forced to re-login every session |
| 2 | **No auto-next track** — playback stops after each track | Broken listening experience |
| 3 | **No next/previous controls** — no queue navigation | Cannot browse through track list during playback |

### 🟠 High (Major Feature Gap)

| # | Gap | Impact |
|---|---|---|
| 4 | **Admin dashboard is a stub** — no live API integration | Cannot manage content from mobile |
| 5 | **No storage/upload SDK** — cannot upload audio or images | Admin content creation blocked on mobile |
| 6 | **No volume/mute control** — mobile player has no volume slider | Reduced player functionality |
| 7 | **Notification state not managed** — no read/unread tracking | Static notifications only |
| 8 | **No close/dismiss player** — no way to fully close the mini player | Must navigate away or stop playback |

### 🟡 Medium (Missing Screens / Features)

| # | Gap | Impact |
|---|---|---|
| 9 | **No `/programs` list page** — no dedicated program browsing | Programs only shown in home sections |
| 10 | **No `/recent` page** — no listening history screen | History only through Continue Listening widget |
| 11 | **No error boundary** — unhandled errors crash the app | Poor reliability UX |
| 12 | **No 404 / Not Found screen** — invalid deep links have no fallback | Navigation edge case |

### 🟢 Low (Polish / Minor)

| # | Gap | Impact |
|---|---|---|
| 13 | **No error reporting** — no equivalent of Lovable error capture | Reduced observability |
| 14 | **Missing `http.put()` helper** — no PUT method in mobile SDK | Cannot call PUT endpoints from mobile SDK |

---

## 11. Intentional Platform Differences (NOT Gaps)

These are *expected* differences and should **not** be treated as gaps:

| Feature | Web | Mobile | Reason |
|---|---|---|---|
| HLS player engine | `hls.js` | `expo-av` | Platform-native audio |
| Background playback | Browser tab | `staysActiveInBackground: true` | Mobile-native |
| Theme handling | CSS custom properties | `categoryThemes` object | Platform-native styling |
| Navigation paradigm | Sidebar + TopBar | Tab bar + Stack | Platform convention |
| UI components | shadcn/ui (46 components) | Custom RN components (5) | Platform-native |
| `buffering` state | Not exposed (browser handles) | Exposed in AppState | Mobile UX need |
| Google Auth | Real Google OAuth button | Mock `mock_google_id_token` | Mobile native auth not yet integrated |
| Asset loading | Vite `import` | `require()` | Platform convention |

---

## 12. Top 10 Prioritized Tasks for Mobile Roadmap

| Priority | Task | Effort | Dependency |
|---|---|---|---|
| **P0** | Implement persistent token storage (`expo-secure-store`) | Small (1 day) | None |
| **P0** | Add `next()` / `previous()` + auto-next on track end | Small (1 day) | None |
| **P1** | Add `queue` state + queue UI in player screen | Medium (2 days) | P0 #2 |
| **P1** | Add volume control + mute toggle to player | Small (1 day) | None |
| **P1** | Add `close()` method + dismiss button in MiniPlayer | Small (0.5 day) | None |
| **P2** | Add notification state management (markAsRead, unread badge) | Small (1 day) | None |
| **P2** | Create dedicated Programs list screen | Medium (1 day) | None |
| **P2** | Create Recently Played / History screen | Medium (1 day) | None |
| **P3** | Add global error boundary (React Native) | Small (0.5 day) | None |
| **P3** | Add admin SDK + connect admin dashboard to live APIs | Large (5+ days) | Admin API SDK |

---

*End of Report*
