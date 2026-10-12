import { CapsuleButton, Cover, DisplayText, Stamp } from "@/components/echo";
import OAuthButton from "@/components/oauth-button";
import { PLATE_OFFSET, spacing, useColors } from "@/lib/theme";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SITE = "https://echobook.club";
const COVERS = {
  pachinko: require("../../../assets/images/covers/pachinko.jpg"),
  piranesi: require("../../../assets/images/covers/piranesi.jpg"),
  james: require("../../../assets/images/covers/james.jpg"),
};

/**
 * Welcome (r6 11), the first screen when signed out: the pink field, a fan of three covers
 * with a FINISHED stamp (hidden on small phones), "Every page, counted.", and the ways in.
 */
export default function WelcomeScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [error, setError] = useState<string | null>(null);
  const showFan = height >= 760;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.field }}
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: insets.top + 14, paddingBottom: insets.bottom + 8 }}
      bounces={false}
    >
      <DisplayText variant="listTitle" style={{ fontFamily: "ArchivoCondensed-Black", color: colors.onField }}>
        {t("auth.brand")}
      </DisplayText>

      {showFan ? (
        <View style={{ flex: 1, minHeight: 320 }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Cover image={COVERS.pachinko} title="Pachinko" width={132} style={{ position: "absolute", left: -14, top: 46, transform: [{ rotate: "-8deg" }] }} />
          <Cover image={COVERS.james} title="James" width={132} style={{ position: "absolute", left: 186, top: 34, transform: [{ rotate: "7deg" }] }} />
          <Cover image={COVERS.piranesi} title="Piranesi" width={148} style={{ position: "absolute", left: 90, top: 16, zIndex: 2 }} />
          <View style={{ position: "absolute", left: 262, top: 236, zIndex: 3 }}>
            <Stamp label={t("stamp.finished")} size={22} rotate={-6} />
          </View>
        </View>
      ) : (
        <View style={{ flex: 1, minHeight: 48 }} />
      )}

      <DisplayText
        variant="headline"
        accessibilityRole="header"
        style={{
          color: colors.onField,
          textShadowColor: colors.plate,
          textShadowOffset: { width: PLATE_OFFSET, height: PLATE_OFFSET },
          textShadowRadius: 0.01,
          paddingRight: PLATE_OFFSET,
        }}
      >
        {t("auth.welcomeTitle")}
      </DisplayText>
      <Text style={{ fontSize: 17, lineHeight: 23, letterSpacing: -0.3, color: colors.onField2, marginTop: 12 }}>{t("auth.welcomeSub")}</Text>

      <View style={{ gap: 10, marginTop: 28 }}>
        <OAuthButton provider="apple" onError={setError} />
        <OAuthButton provider="google" onError={setError} />
        {error && <Text style={{ fontSize: 13, lineHeight: 18, color: colors.onField, textAlign: "center" }}>{error}</Text>}
        <CapsuleButton title={t("auth.useEmail")} variant="plain" size="md" onPress={() => router.push("/sign-in")} style={{ minHeight: 44 }} />
      </View>

      <Text style={{ fontSize: 13, lineHeight: 18, color: colors.onField2, textAlign: "center", marginTop: 8 }}>
        <Trans
          i18nKey="auth.legal"
          components={{
            terms: <LegalLink onPress={() => WebBrowser.openBrowserAsync(`${SITE}/documents/terms-of-service`)} />,
            privacy: <LegalLink onPress={() => WebBrowser.openBrowserAsync(`${SITE}/documents/privacy-policy`)} />,
          }}
        />
      </Text>
    </ScrollView>
  );
}

function LegalLink({ onPress, children }: { onPress: () => void; children?: React.ReactNode }) {
  const colors = useColors();
  return (
    <Text accessibilityRole="link" onPress={onPress} suppressHighlighting style={{ color: colors.onField, textDecorationLine: "underline" }}>
      {children}
    </Text>
  );
}
