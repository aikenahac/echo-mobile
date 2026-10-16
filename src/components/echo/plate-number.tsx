import { fonts, PLATE_OFFSET, useColors } from "@/lib/theme";
import { Text, type TextProps } from "react-native";

/** Archivo's line box around the figures, as a share of the point size */
const TRIM_TOP = 0.13;
const TRIM_BOTTOM = 0.19; // the box ends at the baseline

type Props = Omit<TextProps, "children"> & {
  value: number | string;
  /** Point size; 120 for the page number and the profile stat */
  size?: number;
  /** Plate offset in points (3 at 120, 2 on smaller display titles) */
  offset?: number;
  color?: string;
};

/**
 * Big Archivo numerals printed with a misregistered pink plate underneath
 * (the riso "plate" offset). Tabular figures so changing values don't jump.
 */
export function PlateNumber({ value, size = 120, offset = PLATE_OFFSET, color, style, ...props }: Props) {
  const colors = useColors();
  return (
    <Text
      style={[
        {
          fontFamily: fonts.display,
          fontSize: size,
          // An explicit lineHeight below the font's ascent clips the glyph tops on iOS, so keep
          // the natural line box and trim its spare space with margins (≈ CSS line-height .8)
          marginTop: -Math.round(size * TRIM_TOP),
          marginBottom: -Math.round(size * TRIM_BOTTOM),
          letterSpacing: -size / 40,
          fontVariant: ["lining-nums", "tabular-nums"],
          color: color ?? colors.ink,
          textShadowColor: colors.plate,
          textShadowOffset: { width: offset, height: offset },
          textShadowRadius: 0.01,
        },
        style,
      ]}
      {...props}
    >
      {value}
    </Text>
  );
}
