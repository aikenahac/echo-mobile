import type { SFSymbol } from "expo-symbols";
import type { ReactElement } from "react";
import type { StyleProp, ViewStyle } from "react-native";

export type MenuItem = {
  title: string;
  systemImage?: SFSymbol;
  onPress: () => void;
  destructive?: boolean;
  /** Shows a checkmark (single-choice menus such as sort order) */
  checked?: boolean;
};

export type NativeMenuProps = {
  /** The trigger, an RN element */
  children: ReactElement;
  /** Groups are separated by dividers */
  items: Array<MenuItem> | Array<Array<MenuItem>>;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function menuGroups(items: NativeMenuProps["items"]): Array<Array<MenuItem>> {
  return Array.isArray(items[0]) ? (items as Array<Array<MenuItem>>) : [items as Array<MenuItem>];
}
