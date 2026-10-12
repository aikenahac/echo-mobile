import { useColors, type Palette } from "@/lib/theme";
import type { SFSymbol } from "expo-symbols";
import { ActivityIndicator, Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { SFIcon } from "./sf-icon";

type Variant =
  /** Ink fill on paper */
  | "primary"
  /** The primary action on the field: ink in light, pink-ink in dark */
  | "field"
  /** 1.5pt ink outline */
  | "outline"
  /** Outline on the field */
  | "fieldOutline"
  /** Hairline-bordered secondary (search quick-adds, Following) */
  | "quiet"
  /** Paper fill on the field (Continue with Google) */
  | "paper"
  /** Text only */
  | "plain";

type Size = "lg" | "md" | "sm";

type Props = {
  title?: string;
  icon?: SFSymbol;
  variant?: Variant;
  size?: Size;
  /** Negative text for destructive plain buttons */
  destructive?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const SIZES = {
  lg: { height: 52, padding: 20, font: 17, icon: 17, gap: 8 },
  md: { height: 44, padding: 16, font: 15, icon: 15, gap: 6 },
  sm: { height: 32, padding: 12, font: 13, icon: 12, gap: 4 },
} as const;

function look(variant: Variant, c: Palette) {
  switch (variant) {
    case "primary":
      return { bg: c.ink, fg: c.paper, border: undefined, borderWidth: 0 };
    case "field":
      return { bg: c.fieldButton, fg: c.onFieldButton, border: undefined, borderWidth: 0 };
    case "outline":
      return { bg: "transparent", fg: c.ink, border: c.ink, borderWidth: 1.5 };
    case "fieldOutline":
      return { bg: "transparent", fg: c.onField, border: c.fieldOutline, borderWidth: 1.5 };
    case "quiet":
      return { bg: "transparent", fg: c.ink, border: c.rule, borderWidth: 1 };
    case "paper":
      return { bg: c.paper, fg: c.ink, border: undefined, borderWidth: 0 };
    case "plain":
      return { bg: "transparent", fg: c.ink, border: undefined, borderWidth: 0 };
  }
}

/** Buttons are capsules (52–56pt for primary actions) */
export function CapsuleButton({
  title,
  icon,
  variant = "primary",
  size = "lg",
  destructive,
  loading,
  disabled,
  onPress,
  accessibilityLabel,
  style,
}: Props) {
  const colors = useColors();
  const s = SIZES[size];
  const l = look(variant, colors);
  const fg = destructive ? colors.negative : l.fg;
  const iconOnly = !title;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: s.height,
          minWidth: iconOnly ? s.height : undefined,
          paddingHorizontal: iconOnly ? 0 : s.padding,
          borderRadius: s.height / 2,
          backgroundColor: l.bg,
          borderColor: l.border,
          borderWidth: l.borderWidth,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: s.gap,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: s.gap }}>
          {icon && <SFIcon name={icon} size={s.icon} color={fg} weight="semibold" />}
          {title && (
            <Text style={{ color: fg, fontSize: s.font, fontWeight: "600", letterSpacing: size === "lg" ? -0.3 : 0 }}>{title}</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}
