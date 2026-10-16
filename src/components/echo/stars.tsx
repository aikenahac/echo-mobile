import { useColors } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { SFIcon } from "./sf-icon";

type Props = {
  /** 1–5, or null for unrated */
  value: number | null;
  /** Star size in points: 13 in rows, 20 in the detail column, 28–32 when editable */
  size?: number;
  gap?: number;
  color?: string;
  /** Makes the stars tappable */
  onChange?: (rating: number) => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Ink stars (never yellow) */
export function Stars({ value, size = 13, gap, color, onChange, accessibilityLabel, style }: Props) {
  const colors = useColors();
  const tint = color ?? colors.ink;
  const rating = value ?? 0;

  return (
    <View
      accessible={!onChange}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={onChange ? "adjustable" : "image"}
      accessibilityValue={{ min: 0, max: 5, now: rating }}
      accessibilityActions={onChange ? [{ name: "increment" }, { name: "decrement" }] : undefined}
      onAccessibilityAction={(e) => {
        if (!onChange) return;
        if (e.nativeEvent.actionName === "increment") onChange(Math.min(5, rating + 1));
        if (e.nativeEvent.actionName === "decrement") onChange(Math.max(1, rating - 1));
      }}
      style={[{ flexDirection: "row", gap: gap ?? Math.max(2, Math.round(size / 5)) }, style]}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const star = <SFIcon key={n} name={n <= rating ? "star.fill" : "star"} size={size} color={tint} weight="regular" />;
        if (!onChange) return star;
        return (
          <Pressable
            key={n}
            hitSlop={4}
            importantForAccessibility="no-hide-descendants"
            onPress={() => {
              Haptics.selectionAsync();
              onChange(n);
            }}
          >
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}
