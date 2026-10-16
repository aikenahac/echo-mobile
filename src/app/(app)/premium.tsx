import { CapsuleButton, CircleButton, DisplayText, Hairline, SFIcon, Stamp } from "@/components/echo";
import { PremiumCTA } from "@/components/premium-cta";
import { PLATE_OFFSET, spacing, useColors } from "@/lib/theme";
import type { SFSymbol } from "expo-symbols";
import { useRouter } from "expo-router";
import { Trans, useTranslation } from "react-i18next";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BENEFITS: Array<[SFSymbol, string]> = [
  ["folder", "premium.benefit1"],
  ["globe", "premium.benefit2"],
  ["checkmark", "premium.benefit3"],
  ["sparkles", "premium.benefit4"],
];

/**
 * The Premium paywall (r6 07): a full field page with the PREMIUM stamp. Shown to free
 * readers on any collection action. The purchase itself lives in <PremiumCTA>.
 */
export default function PremiumScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  // Small phones drop the fourth benefit (CRITIQUE.md)
  const benefits = height < 760 ? BENEFITS.slice(0, 3) : BENEFITS;

  return (
    <View style={{ flex: 1, backgroundColor: colors.field }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <DisplayText variant="listTitle" style={{ color: colors.onField }}>
            {t("premium.brand")}
          </DisplayText>
          <CircleButton icon="xmark" accessibilityLabel={t("premium.close")} onField onPress={() => router.back()} />
        </View>

        <View style={{ marginTop: height < 760 ? 20 : 36, marginLeft: 2 }}>
          <Stamp label={t("stamp.premium")} size={22} rotate={-5} />
        </View>

        <DisplayText
          variant="headline"
          accessibilityRole="header"
          style={{
            color: colors.onField,
            marginTop: 28,
            textShadowColor: colors.plate,
            textShadowOffset: { width: PLATE_OFFSET, height: PLATE_OFFSET },
            textShadowRadius: 0.01,
            paddingRight: PLATE_OFFSET,
          }}
        >
          {t("premium.headline")}
        </DisplayText>

        <View style={{ marginTop: 28 }}>
          {benefits.map(([icon, key]) => (
            <View key={key}>
              <Hairline color={colors.onFieldRule} />
              <View style={{ flexDirection: "row", gap: 14, paddingVertical: 14, alignItems: "flex-start" }}>
                <SFIcon name={icon} size={20} color={colors.onField} weight="regular" style={{ marginTop: 1 }} />
                <Text style={{ flex: 1, fontSize: 17, lineHeight: 23, letterSpacing: -0.3, color: colors.onField }}>{t(key)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ flex: 1, minHeight: 24 }} />

        {/* TODO: prices have no public API (API.md §8); kept in i18n until they do */}
        <Text style={{ fontSize: 15, color: colors.onField2, marginBottom: 14 }}>
          <Trans i18nKey="premium.price" components={{ b: <Text style={{ fontWeight: "600", color: colors.onField }} /> }} />
        </Text>
        <PremiumCTA />
        <CapsuleButton title={t("premium.later")} variant="plain" onPress={() => router.back()} style={{ marginTop: 6 }} />
      </ScrollView>
    </View>
  );
}
