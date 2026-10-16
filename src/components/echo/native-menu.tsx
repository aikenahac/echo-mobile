import i18n from "i18next";
import { ActionSheetIOS, Alert, Platform, Pressable } from "react-native";
import { menuGroups, type NativeMenuProps } from "./native-menu.types";

/** Fallback for platforms without the SwiftUI menu: an action list on press */
export function NativeMenu({ children, items, accessibilityLabel, style }: NativeMenuProps) {
  const flat = menuGroups(items).flat();
  const open = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...flat.map((i) => i.title), i18n.t("common.cancel")], cancelButtonIndex: flat.length },
        (index) => flat[index]?.onPress(),
      );
      return;
    }
    Alert.alert(accessibilityLabel ?? "", undefined, [
      ...flat.map((i) => ({ text: i.title, style: i.destructive ? ("destructive" as const) : undefined, onPress: i.onPress })),
      { text: i18n.t("common.cancel"), style: "cancel" as const },
    ]);
  };
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={open} style={style}>
      {children}
    </Pressable>
  );
}
