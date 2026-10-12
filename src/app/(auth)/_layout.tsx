import { useColors, useStatusBarStyle } from "@/lib/theme";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";

/** Signed-out screens: Welcome on the field, then the paper forms with a native back button */
export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth();
  const statusBarStyle = useStatusBarStyle();
  const colors = useColors();

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        statusBarStyle,
        headerShown: true,
        headerTransparent: true,
        headerTitle: "",
        headerBackButtonDisplayMode: "minimal",
        headerShadowVisible: false,
        headerTintColor: colors.ink,
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false, statusBarStyle: "dark", contentStyle: { backgroundColor: colors.field } }} />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
