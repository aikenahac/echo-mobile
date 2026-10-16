# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Echo is a mobile reading tracker application built with React Native and Expo (SDK 57). It allows users to track their reading progress, manage their book library, and connect with other readers. The app uses Clerk for authentication and connects to a backend API for data persistence.

## Common Commands

### Development
- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

### Building
- `npm run build` - Interactive build script (prompts for platform, profile, and location)
  - Profiles: `development`, `ios-simulator`, `preview`, `production`
  - Platforms: iOS or Android
  - Build locations: local or EAS (cloud)

## Architecture

The UI follows the approved redesign in `design/redesign/` (spec: `shots/r6/*.png`; rules: `HANDOFF.md`,
`DIRECTION.md`; data: `API.md`). The pink **field** means "in progress / now" only; everything else sits on
**paper**. Display type is Archivo Condensed; UI and body text are the system font.

### Routing & Navigation
- **Expo Router** with file-based routing in `src/app/`
- `(auth)` — signed out: `welcome` (first screen), `sign-in`, `sign-up`, `verify`, `forgot-password`, `reset-password`
- `(app)` — signed in, a Stack (`src/app/(app)/_layout.tsx`) that also blocks the app with `UsernameOnboarding` while the profile has no username
  - `(tabs)` — native tabs (`expo-router/unstable-native-tabs`): Library · Friends · You, plus Search as the search-role tab; each tab is its own Stack
  - Pushed: `book/[bookId]` (catalog id), `collection/[id]`, `settings`, `user/[userId]`
  - Sheets (`formSheet`): `review/[bookId]`, `edit-profile`, `collection-editor`, `add-to-collection/[userBookId]`
  - `premium` — full-screen modal paywall
- Under the UIScene life cycle iOS ignores app-wide status bar styling: every Stack sets `statusBarStyle` (`useStatusBarStyle()` from `src/lib/theme.ts`)

### Authentication
- **Clerk** (`@clerk/clerk-expo`); token cache via `@clerk/clerk-expo/token-cache`
- All API requests include the Bearer token via `useFetch()`
- Clerk errors map to inline field errors with `authError()` (`src/lib/clerk-errors.ts`) — never toasts
- Apple/Google through `OAuthButton` (`src/components/oauth-button.tsx`)

### Data Layer
- **React Query** for server state; query keys and `invalidateLibrary()` in `src/hooks/query-keys.ts`
- API modules in `src/lib/api/` (`library`, `catalog`, `collections`, `search`, `feed`, `profile`, `user`), endpoints in `endpoints.ts`
- Hooks in `src/hooks/api/{resource}/`
- Zod schemas and inferred types in `src/lib/schemas/index.ts` (the single source of types); other users are `PublicUser`
- Book IDs: `userBook.id` is the library entry (`/books/{id}/…`, collections); `book.id` / `userBook.bookId` is the catalog book (`/catalog/{id}`, reviews)
- Page total everywhere: `bookTotal(userBook, book)` in `src/lib/books.ts`
- Library mutations are optimistic and mirror the server's status rules (`src/lib/library-cache.ts`); page changes go through `useProgressCommitter` (optimistic, 600ms debounce, coalescing, rollback)
- "+N today" is device-local (`src/lib/daily-pages.ts`); the server keeps no reading history
- **MMKV** via `src/lib/storage.ts` (`STORAGE_KEYS`); `useLibraryLayout()` is the reactive grid/list setting

### API Integration
- Base URL: `process.env.EXPO_PUBLIC_API_URL` (fallback: `https://echoreads.app/api`); paths are relative to `/api` and start with `/v1`
- `useFetch()` in `src/lib/api/fetch-wrapper.ts` (`react-native-nitro-fetch`, adds the Clerk token)
- Validate responses with `handleApiResponse(response, schema)`; show errors with `getErrorMessage()` (`src/lib/api/errors.ts`)
- Collections are Premium: gate actions with `usePremiumGate().guard(...)`; treat a 403 as "open the paywall" (`isPaywallError`)
- Buying Premium lives only in `src/components/premium-cta.tsx` (web link for now; swap for IAP there)

### Styling & Design System
- Tokens: `src/global.css` (Uniwind CSS variables: `paper`, `field`, `ink`, `ink-2`, `ink-3`, `rule`, `tint`, `pink-ink`, `on-field`, `plate`, `surface`, …, light and dark) mirrored in `src/lib/theme.ts` (`useColors()`, `spacing`, `radius`, `fonts`, `type`, `motion`). Never hard-code colours, sizes or radii in screens
- Dark mode is designed, not inverted; `ThemeProvider` (`src/lib/theme-context.tsx`) calls `Uniwind.setTheme()`
- Shared primitives in `src/components/echo/`: `Cover`, `Stamp`, `PlateNumber`, `DisplayText`, `FieldBand`, `Avatar`, `Stars`, `ProgressBar`, `CapsuleButton`, `CircleButton`, `TextField`, `Hairline`, `SFIcon`, `CollectionTile`, `NativeMenu`, `NativeSwitch`
- Feature components by area: `components/{library,book,search,feed,profile,settings,auth}`
- Native controls come from **`@expo/ui`** (BottomSheet, Switch, segmented control, SwiftUI `Menu`/`Form`/`Picker`). Do not add React Native Reusables or `@rn-primitives`
- Icons: SF Symbols via `expo-symbols` (`SFIcon`); `lucide-react-native` only for user-chosen collection icons (`src/lib/collection-icons.ts`)
- Covers are the only things with a shadow; group content with space and 0.5pt hairlines, not cards
- Display font: Archivo Condensed Black/ExtraBold static cuts in `src/lib/assets/fonts/` (embedded by the `expo-font` plugin; word spacing is baked into the space glyph)
- Motion: Reanimated + Gesture Handler; the numbering stamp is `components/library/page-dial.tsx` + `page-wheels.tsx`; haptics via `expo-haptics`
- Navigation theme `NAV_THEME` in `src/lib/theme.ts` (import from `expo-router`, never `@react-navigation/*`)

### Internationalization
- **react-i18next**; English in `src/locales/en.json`, configured in `src/lib/i18n.ts`
- All user-visible strings go through `t()`; plurals use `_one` / `_other`

### Native configuration
- `plugins/with-ios-scene-lifecycle.js` adopts the UIScene life cycle (the iOS 27 SDK requires it; remove after upgrading to SDK 58)
- `UIViewControllerBasedStatusBarAppearance` is on (`app.json`)
- Splash: field pink with `assets/images/splash-mark.png`

## Project Structure

```
src/
├── app/
│   ├── (auth)/                 # welcome, sign-in, sign-up, verify, forgot/reset password
│   ├── (app)/
│   │   ├── (tabs)/             # library, friends, you, search
│   │   ├── book/ collection/ user/ review/ add-to-collection/
│   │   ├── settings.tsx edit-profile.tsx collection-editor.tsx premium.tsx
│   │   └── _layout.tsx         # signed-in Stack + username gate
│   ├── _layout.tsx             # providers
│   └── index.tsx               # redirect
├── components/
│   ├── echo/                   # design-system primitives
│   └── {library,book,search,feed,profile,settings,auth}/
├── hooks/                      # api/{resource}/, query-keys.ts, use-*.ts
├── lib/                        # api/, schemas/, theme.ts, storage.ts, books.ts, dates.ts, …
├── locales/en.json
└── global.css                  # tokens
```

## Development Patterns

### Adding a New API Endpoint
1. Add the path to `src/lib/api/endpoints.ts`
2. Add a Zod schema (and its inferred type) to `src/lib/schemas/index.ts`
3. Add the call to the matching module in `src/lib/api/` and validate with `handleApiResponse`
4. Add a query key to `src/hooks/query-keys.ts`
5. Add a hook in `src/hooks/api/{resource}/`; mutations invalidate per API.md §0.2

### Creating a New Screen
1. Add the route under `src/app/(app)/` (or a tab's folder) and register its presentation in the parent `_layout.tsx`
2. Build it from `src/components/echo` primitives and tokens; paper ground, the field only for "now"
3. Toolbar buttons and menus via `Stack.Toolbar`; native forms and sheets via `@expo/ui` or `presentation: "formSheet"`
4. Compare with the matching `design/redesign/shots/r6` PNG in the simulator, in light and dark

### Local development
- Backend: run `pnpm dev` in the `echo` repo (`feat/mobile-api-parity`); seed with `pnpm db:seed:dev --email <your test user>`
- `.env.local` sets `EXPO_PUBLIC_API_URL` (simulator: `http://localhost:3000/api`; a phone needs the Mac's LAN IP) and the Clerk key of that backend

## Environment Variables

Set in `eas.json` build profiles (and `.env.local` for local development):
- `EXPO_PUBLIC_API_URL` - Backend API base URL
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk authentication key

## Build Profiles (eas.json)

- **development** - Dev build with debugging
- **ios-simulator** - iOS simulator build (local only)
- **preview** - Internal testing build
- **production** - Production build for app stores
