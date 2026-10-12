import { type } from "@/lib/theme";
import { Text, type TextProps } from "react-native";

type Variant = "headline" | "screenTitle" | "heroTitle" | "sectionHead" | "listTitle";

/**
 * Display type already starts at 22–64pt, so like the system's large titles it grows less
 * with Dynamic Type than body text does (body text scales fully).
 */
const DISPLAY_MAX_SCALE = 1.4;

/**
 * Archivo Condensed display type. Colour comes from the caller (className or
 * style), so the same title works on paper and on the field.
 */
export function DisplayText({ variant = "screenTitle", style, ...props }: TextProps & { variant?: Variant }) {
  return (
    <Text
      accessibilityRole={variant === "screenTitle" ? "header" : undefined}
      maxFontSizeMultiplier={DISPLAY_MAX_SCALE}
      style={[type[variant], style]}
      {...props}
    />
  );
}
