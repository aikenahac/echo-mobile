import { useColors, useStatusBarStyle } from "@/lib/theme";
import { Stack } from "expo-router";

export default function YouStackLayout() {
  const statusBarStyle = useStatusBarStyle();
  const colors = useColors();
  return (
    <Stack screenOptions={{ statusBarStyle }}>
      <Stack.Screen
        name="index"
        options={{
          // Transparent header hosting the glass toolbar (edit, settings)
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
