import { useColorScheme } from "@/hooks/use-color-scheme";
import "@/lib/i18n";
import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@/lib/theme-context";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import {
  EBGaramond_400Regular,
  EBGaramond_500Medium,
  EBGaramond_600SemiBold,
  EBGaramond_700Bold,
  useFonts,
} from "@expo-google-fonts/eb-garamond";
import { ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

import NetInfo from '@react-native-community/netinfo';
import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected)
  })
})


// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    EBGaramond_400Regular,
    EBGaramond_500Medium,
    EBGaramond_600SemiBold,
    EBGaramond_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <ClerkProvider tokenCache={tokenCache}>
        <RootLayoutContent />
      </ClerkProvider>
    </ThemeProvider>
  );
}

const queryClient = new QueryClient()


function RootLayoutContent() {
  const { colorScheme } = useColorScheme();
  const effectiveColorScheme = colorScheme ?? "light";

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <NavThemeProvider value={NAV_THEME[effectiveColorScheme]}>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <View
              style={{ flex: 1 }}
              className={
                effectiveColorScheme === "dark"
                  ? "dark bg-background"
                  : "bg-background"
              }
            >
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(app)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="index" />
              </Stack>
              <StatusBar
                style={effectiveColorScheme === "dark" ? "light" : "dark"}
                translucent
                backgroundColor="transparent"
              />
              <PortalHost />
              <Toaster position="bottom-center" />
            </View>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </NavThemeProvider>
    </SafeAreaProvider>
  );
}
