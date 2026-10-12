import { Avatar, CapsuleButton, DisplayText, Hairline } from "@/components/echo";
import { spacing, useColors } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfileQueriesForSettings } from "./use-settings";

/** Plain fallback where the SwiftUI form isn't available */
export function SettingsForm() {
  const s = useProfileQueriesForSettings();
  const colors = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.paper }} contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + 56 }}>
      <DisplayText style={{ color: colors.ink }}>{t("settings.title")}</DisplayText>
      <Pressable onPress={s.editProfile} style={{ flexDirection: "row", gap: 12, alignItems: "center", marginTop: 24 }}>
        {s.user && <Avatar user={s.user} size={44} />}
        <View>
          <Text style={{ fontSize: 17, fontWeight: "600", color: colors.ink }}>{s.name}</Text>
          <Text style={{ fontSize: 15, color: colors.ink2 }}>{s.email}</Text>
        </View>
      </Pressable>
      <Hairline style={{ marginTop: 20 }} />
      <Row title={s.isPremium ? s.planName : t("settings.free")} value={s.planDate?.value} />
      <Row title={s.isPremium ? t("settings.billing") : t("settings.getPremium")} onPress={s.isPremium ? s.billing : s.getPremium} />
      <Hairline />
      <Row title={t("settings.appearance")} value={s.themeMode} onPress={() => s.setThemeMode(s.themeMode === "dark" ? "light" : "dark")} />
      <Row title={t("settings.libraryLayout")} value={s.layout} onPress={() => s.setLayout(s.layout === "grid" ? "list" : "grid")} />
      <Hairline />
      <Row title={t("settings.terms")} onPress={s.terms} />
      <Row title={t("settings.privacy")} onPress={s.privacy} />
      <CapsuleButton title={t("settings.signOut")} variant="outline" onPress={s.signOut} style={{ marginTop: 24 }} />
      <CapsuleButton title={t("settings.deleteAccount")} variant="plain" destructive onPress={s.deleteAccount} style={{ marginTop: 8 }} />
      <Text style={{ fontSize: 13, color: colors.ink2, textAlign: "center", marginTop: 16 }}>{s.version}</Text>
    </ScrollView>
  );
}

function Row({ title, value, onPress }: { title: string; value?: string; onPress?: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 14 }}>
      <Text style={{ fontSize: 17, color: colors.ink }}>{title}</Text>
      {value && <Text style={{ fontSize: 17, color: colors.ink2 }}>{value}</Text>}
    </Pressable>
  );
}
