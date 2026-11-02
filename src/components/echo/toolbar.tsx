import { useColors } from "@/lib/theme";
import { Stack } from "expo-router";
import { Pressable, View, type ColorValue } from "react-native";
import type { IconName } from "./icon-names";
import { NativeMenu } from "./native-menu";
import { SFIcon } from "./sf-icon";
import type { ToolbarProps } from "./toolbar.types";

/**
 * The screen's top-bar buttons and menus. expo-router's Android toolbar only draws image
 * sources, not SF Symbol names, so Android gets plain icon buttons in the header instead.
 */
export function Toolbar({ placement, items }: ToolbarProps) {
  const colors = useColors();
  const row = () => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      {items.map((item) => {
        if (!item) return null;
        if (item.kind === "button") {
          return (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ disabled: !!item.disabled }}
              disabled={item.disabled}
              onPress={item.onPress}
              android_ripple={{ color: colors.rule, borderless: true, radius: 24 }}
            >
              <Glyph icon={item.icon} tint={item.tint} prominent={item.prominent} dim={item.disabled} />
            </Pressable>
          );
        }
        return (
          <NativeMenu key={item.label} items={item.items} accessibilityLabel={item.label}>
            <Glyph icon={item.icon} tint={item.tint} />
          </NativeMenu>
        );
      })}
    </View>
  );
  return <Stack.Screen options={placement === "left" ? { headerLeft: row } : { headerRight: row }} />;
}

/** A 48dp target; the prominent one is an ink disc */
function Glyph({ icon, tint, prominent, dim }: { icon: IconName; tint?: ColorValue; prominent?: boolean; dim?: boolean }) {
  const colors = useColors();
  return (
    <View style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center", opacity: dim ? 0.4 : 1 }}>
      {prominent ? (
        <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: tint ?? colors.ink }}>
          <SFIcon name={icon} size={20} color={colors.paper} weight="semibold" />
        </View>
      ) : (
        <SFIcon name={icon} size={22} color={tint ?? colors.ink} />
      )}
    </View>
  );
}
