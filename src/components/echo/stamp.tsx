import { fonts, useColors } from "@/lib/theme";
import type { ReactNode } from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";

export type StampSize = 11 | 22 | 34;

type Props = {
  /** Upper-case label: FINISHED, READING, WANT, PREMIUM, LIFETIME */
  label: string;
  size?: StampSize;
  /** Degrees; the design tilts stamps −5° to −7° */
  rotate?: number;
  /** Trailing glyph, e.g. the chevron on the detail stamp that opens the status menu */
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const SPEC = {
  // Mini: on small covers (feed, search) — single 1.5pt rule
  11: { border: 1.5, outline: 0, outlineOffset: 0, padding: [2, 4, 1, 4], tracking: 0.4 },
  // Detail / paywall / settings — ink double rule
  22: { border: 2, outline: 2, outlineOffset: 2, padding: [6, 8, 5, 10], tracking: 0.5 },
  // The FINISHED stamp landing on the hero cover — heavy rule with a paper halo
  34: { border: 4, outline: 3, outlineOffset: 0, padding: [6, 10, 3, 10], tracking: 1 },
} as const;

/** The ink label stamped at an angle onto covers and pages */
export function Stamp({ label, size = 22, rotate = -6, trailing, style }: Props) {
  const colors = useColors();
  const spec = SPEC[size];
  const [pt, pr, pb, pl] = spec.padding;
  // The 34 stamp's outer ring is paper (a halo on the cover); the others are ink
  const outlineColor = size === 34 ? colors.paper : colors.ink;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      style={[
        {
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          backgroundColor: colors.paper,
          borderWidth: spec.border,
          borderColor: colors.ink,
          outlineWidth: spec.outline,
          outlineColor,
          outlineOffset: spec.outlineOffset,
          outlineStyle: "solid",
          paddingTop: pt,
          paddingRight: pr,
          paddingBottom: pb,
          paddingLeft: pl,
          transform: [{ rotate: `${rotate}deg` }],
        },
        style,
      ]}
    >
      <Text
        allowFontScaling={false}
        style={{ fontFamily: fonts.display, fontSize: size, lineHeight: size * 1.05, letterSpacing: spec.tracking, color: colors.ink }}
      >
        {label}
      </Text>
      {trailing}
    </View>
  );
}
