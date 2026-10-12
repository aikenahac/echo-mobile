import { type } from "@/lib/theme";
import { Text, type TextProps } from "react-native";

type Variant = "headline" | "screenTitle" | "heroTitle" | "sectionHead" | "listTitle";

/**
 * Archivo Condensed display type. Colour comes from the caller (className or
 * style), so the same title works on paper and on the field.
 */
export function DisplayText({ variant = "screenTitle", style, ...props }: TextProps & { variant?: Variant }) {
  return <Text accessibilityRole={variant === "screenTitle" ? "header" : undefined} style={[type[variant], style]} {...props} />;
}
