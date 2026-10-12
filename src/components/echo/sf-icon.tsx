import { useColors } from "@/lib/theme";
import { SymbolView, type SFSymbol, type SymbolWeight } from "expo-symbols";
import type { ColorValue, StyleProp, ViewStyle } from "react-native";

type Props = {
  name: SFSymbol;
  size?: number;
  /** Defaults to ink */
  color?: ColorValue;
  weight?: SymbolWeight;
  style?: StyleProp<ViewStyle>;
};

/** SF Symbols, tinted from the theme (HANDOFF.md § Icons) */
export function SFIcon({ name, size = 22, color, weight = "medium", style }: Props) {
  const colors = useColors();
  return (
    <SymbolView
      name={name}
      size={size}
      weight={weight}
      tintColor={color ?? colors.ink}
      style={[{ width: size, height: size }, style]}
    />
  );
}
