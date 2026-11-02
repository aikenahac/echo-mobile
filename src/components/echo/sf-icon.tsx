import { useColors } from "@/lib/theme";
import type { SymbolWeight } from "expo-symbols";
import { View, type ColorValue, type StyleProp, type ViewStyle } from "react-native";
import { ICONS, type IconName } from "./icon-names";

export type SFIconProps = {
  name: IconName;
  size?: number;
  /** Defaults to ink */
  color?: ColorValue;
  weight?: SymbolWeight;
  style?: StyleProp<ViewStyle>;
};

/** Lucide strokes (24-unit grid) that read like the SF Symbol weights */
const STROKE: Record<SymbolWeight, number> = {
  unspecified: 2,
  ultraLight: 1.25,
  thin: 1.5,
  light: 1.75,
  regular: 1.9,
  medium: 2,
  semibold: 2.25,
  bold: 2.5,
  heavy: 2.75,
  black: 3,
};

/** Android and web have no SF Symbols: the same names drawn with Lucide (icon-names.tsx) */
export function SFIcon({ name, size = 22, color, weight = "medium", style }: SFIconProps) {
  const colors = useColors();
  const Icon = ICONS[name];
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Icon size={size} color={String(color ?? colors.ink)} strokeWidth={STROKE[weight]} />
    </View>
  );
}
