import { useColors, useStatusBarStyle } from "@/lib/theme";
import { Stack } from "expo-router";

export default function SearchStackLayout() {
  const statusBarStyle = useStatusBarStyle();
  const colors = useColors();
  return (
    <Stack screenOptions={{ statusBarStyle }}>
      <Stack.Screen
        name="index"
        options={{
          // A header is needed to host the native search field (it docks by the tab bar on iOS 26)
          headerShown: true,
          headerTransparent: true,
          headerShadowVisible: false,
          title: "",
          contentStyle: { backgroundColor: colors.paper },
        }}
      />
    </Stack>
  );
}
