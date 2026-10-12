import { fonts, radius, useColors } from "@/lib/theme";
import { useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChange: (code: string) => void;
  /** Called once all six digits are in */
  onComplete?: (code: string) => void;
  error?: boolean;
  autoFocus?: boolean;
  accessibilityLabel: string;
};

const LENGTH = 6;

/**
 * Six code boxes (r6 14, 24): Archivo digits on their pink plate; the box being typed in
 * gets an ink border and a pink caret. One hidden field takes the input, so iOS one-time
 * code autofill and paste work.
 */
export function CodeBoxes({ value, onChange, onComplete, error, autoFocus, accessibilityLabel }: Props) {
  const colors = useColors();
  const input = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  return (
    <Pressable onPress={() => input.current?.focus()} accessible={false}>
      <View style={{ flexDirection: "row", gap: 8 }} importantForAccessibility="no-hide-descendants">
        {Array.from({ length: LENGTH }, (_, i) => {
          const digit = value[i];
          const current = focused && i === Math.min(value.length, LENGTH - 1) && value.length < LENGTH;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: 68,
                borderRadius: radius.field,
                borderCurve: "continuous",
                backgroundColor: colors.surface,
                borderWidth: current ? 2 : error ? 1.5 : 1,
                borderColor: current ? colors.ink : error ? colors.negative : colors.rule,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {digit ? (
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 44,
                    lineHeight: 50,
                    color: colors.ink,
                    textShadowColor: colors.plate,
                    textShadowOffset: { width: 2, height: 2 },
                    textShadowRadius: 0.01,
                    paddingRight: 2,
                  }}
                >
                  {digit}
                </Text>
              ) : current ? (
                <View style={{ width: 2, height: 30, backgroundColor: colors.pinkInk }} />
              ) : null}
            </View>
          );
        })}
      </View>
      <TextInput
        ref={input}
        value={value}
        onChangeText={(v) => {
          const code = v.replace(/\D/g, "").slice(0, LENGTH);
          onChange(code);
          if (code.length === LENGTH) onComplete?.(code);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={LENGTH}
        caretHidden
        accessibilityLabel={accessibilityLabel}
        style={{ position: "absolute", inset: 0, opacity: 0.01, color: "transparent" }}
      />
    </Pressable>
  );
}
