import { useColors } from "@/lib/theme";
import { Host, Switch } from "@expo/ui";

type Props = { value: boolean; onValueChange: (value: boolean) => void; accessibilityLabel?: string };

/**
 * The native toggle (SwiftUI / Compose), tinted with the app's accent. The visible label
 * is the caller's row text; `accessibilityLabel` names the control for VoiceOver.
 */
export function NativeSwitch({ value, onValueChange, accessibilityLabel }: Props) {
  const colors = useColors();
  return (
    <Host matchContents seedColor={colors.pinkInk} accessibilityLabel={accessibilityLabel}>
      <Switch value={value} onValueChange={onValueChange} />
    </Host>
  );
}
