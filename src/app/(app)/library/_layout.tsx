import { useStatusBarStyle } from "@/lib/theme";
import { Stack } from "expo-router";

export default function LibraryStackLayout() {
  const statusBarStyle = useStatusBarStyle();
  return <Stack screenOptions={{ headerShown: false, statusBarStyle }} />;
}
