import { Sentry } from "@/lib/sentry"; // first: initialises error reporting before anything else loads
import "@/lib/i18n";
import { isApiRequestError } from "@/lib/api/errors";
import { configurePurchases, isPurchaseCancelled, purchasesEnabled } from "@/lib/purchases";
import { NAV_THEME, useColors, useStatusBarStyle } from "@/lib/theme";
import { ThemeProvider, useTheme } from "@/lib/theme-context";
import { ClerkLoaded, ClerkProvider, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import NetInfo from "@react-native-community/netinfo";
import { MutationCache, onlineManager, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NavThemeProvider, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import Purchases, { PURCHASES_ERROR_CODE } from "react-native-purchases";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

configurePurchases();

let lastPurchasesUserId: string | null | undefined;
let purchasesIdentityUpdate = Promise.resolve();

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

// Keep the splash screen up until Clerk has restored the session
SplashScreen.preventAutoHideAsync();

// Report only what the user can't fix: API 5xx and failures that never carried a status (bad response shape, bugs).
// 4xx are expected (paywall, validation, not found) and offline errors are noise.
function reportQueryError(error: unknown) {
  if (isPurchaseCancelled(error)) return;
  if (isApiRequestError(error) && error.statusCode !== undefined && error.statusCode < 500) return;
  if (error instanceof Error && /NSURLErrorDomain|Network request failed|timed out|Failed to fetch/i.test(error.message)) return;
  Sentry.captureException(error);
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: reportQueryError }),
  mutationCache: new MutationCache({ onError: reportQueryError }),
});

function RootLayout() {
  return (
    <ThemeProvider>
      <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
        <ClerkLoaded>
          <RootLayoutContent />
        </ClerkLoaded>
      </ClerkProvider>
    </ThemeProvider>
  );
}

export default Sentry.wrap(RootLayout);

function RootLayoutContent() {
  const { user } = useUser();
  const { colorScheme } = useTheme();
  const scheme = colorScheme ?? "light";
  const colors = useColors();
  const statusBarStyle = useStatusBarStyle();

  useEffect(() => {
    Sentry.setUser(user ? { id: user.id, username: user.username ?? undefined } : null);
    if (!purchasesEnabled()) return;

    const userId = user?.id ?? null;
    if (lastPurchasesUserId === userId) return;
    lastPurchasesUserId = userId;

    // Queue auth changes so an in-flight login cannot finish after a logout.
    purchasesIdentityUpdate = purchasesIdentityUpdate.then(async () => {
      try {
        if (userId) {
          await Purchases.logIn(userId);
        } else {
          try {
            await Purchases.logOut();
          } catch (error: unknown) {
            if (typeof error === "object" && error !== null && "code" in error &&
              error.code === PURCHASES_ERROR_CODE.LOG_OUT_ANONYMOUS_USER_ERROR) return;
            throw error;
          }
        }
      } catch (error: unknown) {
        if (lastPurchasesUserId === userId) lastPurchasesUserId = undefined;
        Sentry.captureException(error);
      }
    });
  }, [user]);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <NavThemeProvider value={NAV_THEME[scheme]}>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.paper }}>
            <Stack screenOptions={{ headerShown: false, statusBarStyle }}>
              <Stack.Screen name="(app)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="index" />
            </Stack>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </NavThemeProvider>
    </SafeAreaProvider>
  );
}
