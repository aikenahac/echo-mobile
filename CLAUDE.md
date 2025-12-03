# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Echo is a mobile reading tracker application built with React Native and Expo. It allows users to track their reading progress, manage their book library, and connect with other readers. The app uses Clerk for authentication and connects to a backend API for data persistence.

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

### Routing & Navigation
- **Expo Router** with file-based routing in `src/app/`
- Route groups use parentheses: `(auth)`, `(app)`
- Bottom tabs implemented using `expo-router/unstable-native-tabs` in `src/app/(app)/_layout.tsx`
- Auth flow: Unauthenticated users redirect to `/(auth)/sign-in`, authenticated users redirect to `/(app)/library`
- Main tabs: Search, Library, Feed, Profile

### Authentication
- **Clerk** for user authentication
- Token stored in secure storage via `@clerk/clerk-expo/token-cache`
- All API requests automatically include Bearer token via `useFetch()` hook
- Username enforcement: Users without username are prompted via `SetUsernameDrawer` on first app load

### Data Layer
- **React Query** (`@tanstack/react-query`) for server state management
- **MMKV** for local storage (theme, language, library view preferences)
- Query keys centralized in `src/hooks/query-keys.ts`
- API hooks located in `src/hooks/api/` with pattern: `use-{action}-{resource}.ts`
- All API functions use Zod schemas for runtime validation (defined in `src/lib/schemas/index.ts`)

### API Integration
- Base URL: `process.env.EXPO_PUBLIC_API_URL` (fallback: `https://echobook.club/api`)
- Custom fetch wrapper: `useFetch()` hook in `src/lib/api/fetch-wrapper.ts`
  - Uses `react-native-nitro-fetch` for performance
  - Automatically adds Clerk auth token to requests
  - Returns native Response objects
- Endpoints centralized in `src/lib/api/endpoints.ts`
- API modules in `src/lib/api/` (e.g., `library.ts`, `user.ts`)
- Response validation with `handleApiResponse()` from `src/lib/api/errors.ts`

### Type System
- All types defined in `src/lib/types/index.ts`
- Zod schemas in `src/lib/schemas/index.ts` with inferred types
- Key types:
  - `UserBook` - User's book with reading progress
  - `LibraryResponse` - Categorized library data (favorites, want, reading, finished)
  - `ReadingStatus` - "want" | "reading" | "finished"
  - API responses validated at runtime using Zod

### State Management Patterns
- **Server state**: React Query hooks in `src/hooks/api/`
- **UI state**: React hooks (`useState`, `useReducer`)
- **Persistent state**: MMKV via `src/lib/storage.ts` utilities
  - `getFromLocalStorage<T>(key)` - Type-safe retrieval
  - `setInLocalStorage<T>(key, value)` - Auto-serializes objects
  - Storage keys defined in `STORAGE_KEYS` constant

### Styling & Theming
- **NativeWind** (Tailwind CSS for React Native)
- CSS variables-based theming in `src/global.css`
- Dark mode support via `.dark` class
- Theme state managed by `ThemeProvider` in `src/lib/theme-context.tsx`
- Custom hook: `useColorScheme()` returns current theme
- Navigation theme in `src/lib/theme.ts`
- Custom font: EB Garamond (loaded in root layout)

### UI Components
- **React Native Reusables** (shadcn/ui for React Native)
- Components in `src/components/ui/`
- Built on `@rn-primitives` for accessibility
- Add new components: `npx @react-native-reusables/cli@latest add [component]`
- Custom components follow same styling patterns (NativeWind classes)

### Internationalization
- **react-i18next** for translations
- Translation files in `src/locales/` (JSON format)
- Configured in `src/lib/i18n.ts`
- System language detection via `expo-localization`
- Language preference persisted in MMKV

## Project Structure

```
src/
├── app/                      # Expo Router pages
│   ├── (auth)/              # Auth screens (sign-in, sign-up)
│   ├── (app)/               # Main app screens (library, feed, search, profile)
│   ├── _layout.tsx          # Root layout with providers
│   └── index.tsx            # Entry point with auth redirect
├── components/
│   ├── ui/                  # Reusable UI components (shadcn-style)
│   └── *.tsx                # Feature components
├── hooks/
│   ├── api/                 # React Query hooks organized by resource
│   │   ├── library/
│   │   └── user/
│   ├── query-keys.ts        # Centralized query key definitions
│   └── use-*.ts             # Custom hooks
├── lib/
│   ├── api/                 # API client code
│   │   ├── endpoints.ts     # API endpoint definitions
│   │   ├── errors.ts        # Error handling & response validation
│   │   ├── fetch-wrapper.ts # Authenticated fetch hook
│   │   ├── library.ts       # Library API functions
│   │   └── user.ts          # User API functions
│   ├── assets/              # Static assets (fonts, images)
│   ├── icons/               # Custom icon components
│   ├── schemas/             # Zod validation schemas
│   ├── types/               # TypeScript type definitions
│   ├── i18n.ts              # i18next configuration
│   ├── storage.ts           # MMKV storage utilities
│   ├── theme.ts             # Navigation theme config
│   ├── theme-context.tsx    # Theme provider
│   └── utils.ts             # Utility functions
├── locales/                 # Translation files (en.json, sl.json)
└── global.css               # Global styles & CSS variables
```

## Development Patterns

### Adding a New API Endpoint
1. Add endpoint to `src/lib/api/endpoints.ts`
2. Create Zod schema in `src/lib/schemas/index.ts` for response validation
3. Add API function to appropriate file in `src/lib/api/` (use `useFetch()` hook)
4. Validate response with `handleApiResponse(response, schema)`
5. Create query key in `src/hooks/query-keys.ts`
6. Create React Query hook in `src/hooks/api/{resource}/use-{action}-{resource}.ts`

### Creating a New Screen
1. Add file to `src/app/` following Expo Router conventions
2. For authenticated screens, place in `src/app/(app)/`
3. Export default component
4. Use `<ScreenContainer>` wrapper for consistent layout
5. Navigate with `<Link href="/path">` or `router.push('/path')`

### Working with Storage
- Use centralized utilities from `src/lib/storage.ts`
- Add new keys to `STORAGE_KEYS` constant
- Values are automatically JSON serialized/deserialized
- Example: `setInLocalStorage(STORAGE_KEYS.LIBRARY_VIEW, "grid")`

### Creating API Hooks
- Use React Query's `useQuery` for GET requests
- Use React Query's `useMutation` for POST/PUT/DELETE
- Always validate responses with Zod schemas
- Invalidate related queries on mutations
- Pattern: Export custom hook that wraps useQuery/useMutation

## Environment Variables

Set in `eas.json` build profiles:
- `EXPO_PUBLIC_API_URL` - Backend API base URL
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk authentication key

## Build Profiles (eas.json)

- **development** - Dev build with debugging
- **ios-simulator** - iOS simulator build (local only)
- **preview** - Internal testing build
- **production** - Production build for app stores
