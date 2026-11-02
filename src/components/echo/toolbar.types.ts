import type { ColorValue } from "react-native";
import type { IconName } from "./icon-names";
import type { NativeMenuProps } from "./native-menu.types";

export type ToolbarItem =
  | {
      kind: "button";
      icon: IconName;
      /** Spoken; icon-only buttons never show it */
      label: string;
      onPress: () => void;
      tint?: ColorValue;
      /** The filled confirm button of a sheet (✓) */
      prominent?: boolean;
      disabled?: boolean;
    }
  | { kind: "menu"; icon: IconName; label: string; tint?: ColorValue; items: NativeMenuProps["items"] };

export type ToolbarProps = {
  placement: "left" | "right";
  /** `false` / `null` entries are skipped, so items can be conditional inline */
  items: Array<ToolbarItem | false | null | undefined>;
};
