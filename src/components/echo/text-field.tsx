import { radius, useColors } from "@/lib/theme";
import { forwardRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { SFIcon } from "./sf-icon";

type Props = TextInputProps & {
  label?: string;
  /** Inline error under the field; turns the border negative. Never a toast. */
  error?: string | null;
  /** Helper or rule text under the field (hidden while an error shows) */
  hint?: ReactNode;
  /** Adds the show/hide eye; replaces a confirm-password field */
  password?: boolean;
  /** Text or element inside the field, before the input (e.g. "@") */
  leading?: ReactNode;
  /** Element inside the field, after the input (e.g. "Available") */
  trailing?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

/** A labelled text field: surface fill, hairline border, 12pt corners */
export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, hint, password, leading, trailing, containerStyle, style, multiline, onFocus, onBlur, ...props },
  ref,
) {
  const colors = useColors();
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const borderColor = error ? colors.negative : focused ? colors.ink : colors.rule;

  return (
    <View style={containerStyle}>
      {label && <Text style={{ fontSize: 13, fontWeight: "600", color: colors.ink2, marginBottom: 6 }}>{label}</Text>}
      <View
        style={{
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
          minHeight: 52,
          borderRadius: radius.field,
          borderCurve: "continuous",
          borderWidth: error ? 1.5 : 1,
          borderColor,
          backgroundColor: colors.surface,
          paddingHorizontal: 14,
          gap: 8,
        }}
      >
        {typeof leading === "string" ? <Text style={{ fontSize: 17, color: colors.ink2 }}>{leading}</Text> : leading}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.ink3}
          selectionColor={colors.pinkInk}
          cursorColor={colors.pinkInk}
          secureTextEntry={password && !revealed}
          multiline={multiline}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            { flex: 1, fontSize: 17, color: colors.ink, paddingVertical: 14, letterSpacing: -0.3 },
            multiline && { minHeight: 120, textAlignVertical: "top" },
            style,
          ]}
          {...props}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? t("a11y.hidePassword") : t("a11y.showPassword")}
            hitSlop={10}
            onPress={() => setRevealed((r) => !r)}
          >
            <SFIcon name={revealed ? "eye.slash" : "eye"} size={20} color={colors.ink2} />
          </Pressable>
        )}
        {trailing}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={{ fontSize: 13, color: colors.negative, marginTop: 6 }}>
          {error}
        </Text>
      ) : hint ? (
        typeof hint === "string" ? <Text style={{ fontSize: 13, lineHeight: 18, color: colors.ink2, marginTop: 6 }}>{hint}</Text> : hint
      ) : null}
    </View>
  );
});
