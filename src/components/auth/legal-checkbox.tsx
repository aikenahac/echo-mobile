import { SFIcon } from "@/components/echo";
import { useColors } from "@/lib/theme";
import * as WebBrowser from "expo-web-browser";
import { Trans, useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

const SITE = "https://echoreads.app";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string | null;
};

/** Terms/Privacy consent on sign-up; passed to Clerk as `legalAccepted` */
export function LegalCheckbox({ checked, onChange, error }: Props) {
  const colors = useColors();
  const { t } = useTranslation();

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          accessibilityLabel={t("auth.legalCheckboxLabel")}
          hitSlop={10}
          onPress={() => onChange(!checked)}
          style={{
            width: 22,
            height: 22,
            marginTop: 1,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: checked ? colors.pinkInk : error ? colors.negative : colors.rule,
            backgroundColor: checked ? colors.pinkInk : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {checked && <SFIcon name="checkmark" size={13} color="#fff" weight="bold" />}
        </Pressable>
        <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: colors.ink2 }} onPress={() => onChange(!checked)}>
          <Trans
            i18nKey="auth.signUpLegal"
            components={{
              terms: <LegalLink url={`${SITE}/documents/terms-of-service`} />,
              privacy: <LegalLink url={`${SITE}/documents/privacy-policy`} />,
            }}
          />
        </Text>
      </View>
      {error && (
        <Text accessibilityLiveRegion="polite" style={{ fontSize: 13, lineHeight: 18, color: colors.negative, marginTop: 8 }}>
          {error}
        </Text>
      )}
    </View>
  );
}

function LegalLink({ url, children }: { url: string; children?: React.ReactNode }) {
  const colors = useColors();
  return (
    <Text
      accessibilityRole="link"
      onPress={() => WebBrowser.openBrowserAsync(url)}
      suppressHighlighting
      style={{ color: colors.ink, fontWeight: "600", textDecorationLine: "underline" }}
    >
      {children}
    </Text>
  );
}
