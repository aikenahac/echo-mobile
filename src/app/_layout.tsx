import "@/lib/i18n";
import { NAV_THEME, useColors } from "@/lib/theme";
import { ThemeProvider, useTheme } from "@/lib/theme-context";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NavThemeProvider, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

// Keep the splash screen up until Clerk has restored the session
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ClerkProvider tokenCache={tokenCache}>
        <ClerkLoaded>
          <RootLayoutContent />
        </ClerkLoaded>
      </ClerkProvider>
    </ThemeProvider>
  );
}

function RootLayoutContent() {
  const { colorScheme } = useTheme();
  const scheme = colorScheme ?? "light";
  const colors = useColors();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <NavThemeProvider value={NAV_THEME[scheme]}>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.paper }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(app)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="index" />
            </Stack>
            <StatusBar style={scheme === "dark" ? "light" : "dark"} />
          </GestureHandlerRootView>
        </QueryClientProvider>
      </NavThemeProvider>
    </SafeAreaProvider>
  );
}
