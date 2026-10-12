import { useColors } from "@/lib/theme";
import { View, type StyleProp, type ViewStyle } from "react-native";

/** 3pt reading progress: pink-ink on a rule track */
export function ProgressBar({ value, style }: { value: number; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: pct }}
      style={[{ height: 3, borderRadius: 2, backgroundColor: colors.rule, overflow: "hidden", minWidth: 40 }, style]}
    >
      <View style={{ width: `${pct}%`, height: "100%", borderRadius: 2, backgroundColor: colors.pinkInk }} />
    </View>
  );
}
