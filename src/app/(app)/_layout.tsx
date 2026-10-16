import { fixed, useColors, useStatusBarStyle } from "@/lib/theme";
import { UsernameOnboarding } from "@/components/username-onboarding";
import { useProfile } from "@/hooks/api/user/use-get-me";
import { useAuth } from "@clerk/expo";
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
  const profile = useProfile();

  if (!isSignedIn) {
    return <Redirect href="/welcome" />;
  }

  // A reader without a username can't use the app yet: the onboarding blocks everything
  if (profile.data && !profile.data.username) {
    return <UsernameOnboarding />;
  }

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
        name="blocked-users"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="report/[type]/[id]"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [1],
          sheetGrabberVisible: true,
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
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
      <Stack.Screen name="premium" options={{ presentation: "fullScreenModal", statusBarStyle: "dark" }} />
      <Stack.Screen
        name="add-to-collection/[userBookId]"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: "fitToContents",
          sheetGrabberVisible: true,
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
        }}
      />
      <Stack.Screen
        name="collection/[id]"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
          headerTintColor: fixed.onColor,
          statusBarStyle: "light",
        }}
      />
      <Stack.Screen
        name="collection-editor"
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
    </Stack>
  );
}
