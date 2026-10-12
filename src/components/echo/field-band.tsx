import { spacing, useColors } from "@/lib/theme";
import { View, type ViewProps } from "react-native";

/**
 * A full-bleed band of the pink field. The field means "in progress / now"
 * only: the book being read, Reading now, a friend starting a book.
 */
export function FieldBand({ style, ...props }: ViewProps) {
  const colors = useColors();
  return <View style={[{ backgroundColor: colors.field, paddingHorizontal: spacing.lg }, style]} {...props} />;
}
