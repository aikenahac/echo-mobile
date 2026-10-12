import { SFIcon } from "@/components/echo";
import { MIN_PASSWORD } from "@/lib/clerk-errors";
import { useColors } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

/** The live "8 characters or more" check under a new password */
export function PasswordRule({ password }: { password: string }) {
  const colors = useColors();
  const { t } = useTranslation();
  const ok = password.length >= MIN_PASSWORD;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }} accessibilityLiveRegion="polite">
      <SFIcon name={ok ? "checkmark" : "circle"} size={12} color={ok ? colors.pinkInk : colors.ink3} weight="semibold" />
      <Text style={{ fontSize: 13, lineHeight: 18, color: ok ? colors.pinkInk : colors.ink2 }}>{t("auth.passwordRule")}</Text>
    </View>
  );
}
