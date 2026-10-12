import { useColors } from "@/lib/theme";
import type { SFSymbol } from "expo-symbols";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import { SFIcon } from "./sf-icon";

type Props = {
  icon: SFSymbol;
  accessibilityLabel: string;
  onPress?: () => void;
  /** On the field the button is a light glass wash; on paper it is a surface disc */
  onField?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/** A 44pt round toolbar button for screens that draw their own top bar */
export function CircleButton({ icon, accessibilityLabel, onPress, onField, size = 44, style }: Props) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: onField ? colors.fieldGlass : colors.surface,
          boxShadow: colors.glassShadow,
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <SFIcon name={icon} size={20} color={onField ? colors.onField : colors.ink} />
    </Pressable>
  );
}
