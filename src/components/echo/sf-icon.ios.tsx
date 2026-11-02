import { useColors } from "@/lib/theme";
import { SymbolView } from "expo-symbols";
import type { SFIconProps } from "./sf-icon";

/** SF Symbols, tinted from the theme (HANDOFF.md § Icons) */
export function SFIcon({ name, size = 22, color, weight = "medium", style }: SFIconProps) {
  const colors = useColors();
  return (
    <SymbolView
      name={name}
      size={size}
      weight={weight}
      tintColor={color ?? colors.ink}
      style={[{ width: size, height: size }, style]}
    />
  );
}
