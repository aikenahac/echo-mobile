import { useColors, useStatusBarStyle } from "@/lib/theme";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";

/**
 * Signed-in app: the tabs, plus screens that cover them —
 * Book detail (pushed, no tab bar) and the review editor (large-detent sheet).
 */
export default function AppLayout() {
  const { isSignedIn } = useAuth();
  const statusBarStyle = useStatusBarStyle();
  const colors = useColors();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // TODO(phase 9): blocking username onboarding modal when profile.username is null

  return (
    <Stack screenOptions={{ headerShown: false, statusBarStyle }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="book/[bookId]"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
          // Stays live under the review sheet so saved changes show when it closes
          freezeOnBlur: false,
        }}
      />
      <Stack.Screen
        name="review/[bookId]"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [1],
          sheetGrabberVisible: true,
          headerShown: true,
          headerTransparent: true,
          headerShadowVisible: false,
          // The sheet is paper, like every other ground in the app
          contentStyle: { backgroundColor: colors.paper },
        }}
      />
    </Stack>
  );
}
