import { DisplayText } from "@/components/echo";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
import { spacing, useColors } from "@/lib/theme";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title: string;
  /** The line under the title (hidden on small phones while typing) */
  lead?: ReactNode;
  children: ReactNode;
  /** The primary action: docked above the keyboard, in the thumb zone otherwise */
  action: ReactNode;
  /** Secondary links under the action, hidden while the keyboard is up */
  footer?: ReactNode;
};

/** Header space for the native back button */
const HEADER = 64;

/**
 * The paper auth layout (r6 12–14, 24): Archivo title and lead, the fields, and the
 * primary button docked above the keyboard; the footer link hides while typing. On small
 * phones the lead hides and the title shrinks while the keyboard is up, and the form scrolls.
 */
export function AuthScreen({ title, lead, children, action, footer }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const keyboard = useKeyboardVisible();
  const compact = keyboard && height < 760;

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.paper }}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: insets.top + HEADER, paddingBottom: 16 }}
      >
        <DisplayText accessibilityRole="header" style={{ color: colors.ink, marginTop: compact ? 8 : 12, fontSize: compact ? 28 : 44, lineHeight: compact ? 30 : 46 }}>
          {title}
        </DisplayText>
        {lead && !compact && (
          <Text style={{ fontSize: 17, lineHeight: 23, letterSpacing: -0.3, color: colors.ink2, marginTop: 10 }}>{lead}</Text>
        )}
        {children}
      </ScrollView>
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: keyboard ? 12 : insets.bottom + 4, gap: 4 }}>
        {action}
        {!keyboard && footer}
      </View>
    </KeyboardAvoidingView>
  );
}

/** "New to Echo? Create an account" */
export function FooterLink({ text, link, onPress }: { text: string; link: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <View style={{ height: 44, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 15, color: colors.ink2 }}>
        {text}{" "}
        <Text accessibilityRole="link" onPress={onPress} suppressHighlighting style={{ color: colors.pinkInk, fontWeight: "600" }}>
          {link}
        </Text>
      </Text>
    </View>
  );
}
