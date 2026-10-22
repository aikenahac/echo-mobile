import { CapsuleButton, CircleButton, DisplayText, Hairline, SFIcon, Stamp } from "@/components/echo";
import { PremiumCTA } from "@/components/premium-cta";
import { isPlanType, PLAN_TYPES, PlanPicker } from "@/components/premium/plan-picker";
import { useOfferings } from "@/hooks/api/purchases/use-offerings";
import { useRestorePurchases } from "@/hooks/api/purchases/use-restore-purchases";
import { getErrorMessage } from "@/lib/api/errors";
import { PLATE_OFFSET, spacing, useColors } from "@/lib/theme";
import type { SFSymbol } from "expo-symbols";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { PACKAGE_TYPE } from "react-native-purchases";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SITE = "https://echoreads.app";

const BENEFITS: Array<[SFSymbol, string]> = [
  ["folder", "premium.benefit1"],
  ["globe", "premium.benefit2"],
  ["checkmark", "premium.benefit3"],
  ["sparkles", "premium.benefit4"],
];

/**
 * The Premium paywall (r6 07): a full field page with the PREMIUM stamp. Shown to free
 * readers on any collection action. Plans and prices come from the store (RevenueCat's
 * current offering); the purchase itself lives in <PremiumCTA>.
 */
export default function PremiumScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  // Small phones drop the fourth benefit (CRITIQUE.md)
  const benefits = height < 760 ? BENEFITS.slice(0, 3) : BENEFITS;

  const offering = useOfferings();
  const restore = useRestorePurchases();
  const packages = useMemo(
    () =>
      (offering.data?.availablePackages ?? [])
        .filter((p) => isPlanType(p.packageType))
        .sort((a, b) => PLAN_TYPES.findIndex((t) => t === a.packageType) - PLAN_TYPES.findIndex((t) => t === b.packageType)),
    [offering.data],
  );
  const [selectedId, setSelectedId] = useState<string>();
  // Yearly is the default pick
  const selected =
    packages.find((p) => p.identifier === selectedId) ?? packages.find((p) => p.packageType === PACKAGE_TYPE.ANNUAL) ?? packages[0];
  const isSubscription = selected?.packageType !== PACKAGE_TYPE.LIFETIME;

  const onRestore = () =>
    restore.mutate(undefined, {
      onSuccess: ({ premium }) => (premium ? router.back() : Alert.alert(t("premium.nothingToRestore"))),
      onError: (error) => Alert.alert(t("premium.restoreFailed"), getErrorMessage(error)),
    });
  const open = (path: string) => WebBrowser.openBrowserAsync(`${SITE}${path}`);

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

        <View style={{ marginBottom: 16 }}>
          {offering.isPending && offering.fetchStatus !== "idle" ? (
            <ActivityIndicator color={colors.onField} style={{ paddingVertical: 24 }} />
          ) : packages.length > 0 ? (
            <PlanPicker packages={packages} selected={selected?.identifier} onSelect={(p) => setSelectedId(p.identifier)} />
          ) : (
            <Text style={{ fontSize: 15, color: colors.onField2 }}>{t("premium.unavailable")}</Text>
          )}
        </View>
        <PremiumCTA pkg={selected} onPurchased={() => router.back()} />
        <Text style={{ fontSize: 12, lineHeight: 16, color: colors.onField2, textAlign: "center", marginTop: 10 }}>
          {isSubscription ? t("premium.renewalNote") : t("premium.lifetimeLegal")}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", marginTop: 2 }}>
          <CapsuleButton title={t("premium.restore")} variant="plain" size="sm" loading={restore.isPending} onPress={onRestore} />
          <CapsuleButton title={t("premium.terms")} variant="plain" size="sm" onPress={() => open("/documents/terms-of-service")} />
          <CapsuleButton title={t("premium.privacy")} variant="plain" size="sm" onPress={() => open("/documents/privacy-policy")} />
        </View>
        <CapsuleButton title={t("premium.later")} variant="plain" onPress={() => router.back()} />
      </ScrollView>
    </View>
  );
}
