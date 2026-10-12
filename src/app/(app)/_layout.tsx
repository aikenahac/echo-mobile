import { useColors, useStatusBarStyle } from "@/lib/theme";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";

/**
 * Signed-in app: the tabs, plus screens that cover them —
 * Book detail, Settings and other readers' profiles (pushed, no tab bar), and the
 * review editor and Edit profile (large-detent sheets).
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
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [1],
          sheetGrabberVisible: true,
          headerShown: true,
          headerTransparent: true,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.paper },
        }}
      />
      <Stack.Screen
        name="user/[userId]"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
