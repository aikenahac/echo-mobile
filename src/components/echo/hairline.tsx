import { useColors } from "@/lib/theme";
import { View, type StyleProp, type ViewStyle } from "react-native";

/** The 0.5pt rule that replaces cards: group with space and hairlines */
export function Hairline({ color, style }: { color?: string; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  return <View style={[{ height: 0.5, backgroundColor: color ?? colors.rule }, style]} />;
}
