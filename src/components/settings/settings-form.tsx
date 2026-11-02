import { AdminBadge, Avatar, CapsuleButton, DisplayText, Hairline } from "@/components/echo";
import { NativeSwitch } from "@/components/echo/native-switch";
import { spacing, useColors } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NOTIFICATION_SETTINGS, PRIVACY_SETTINGS, useProfileQueriesForSettings } from "./use-settings";

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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 17, fontWeight: "600", color: colors.ink }}>{s.name}</Text>
            {s.isAdmin && <AdminBadge />}
          </View>
          <Text style={{ fontSize: 15, color: colors.ink2 }}>{s.email}</Text>
        </View>
      </Pressable>
      <Hairline style={{ marginTop: 20 }} />
      <Row title={s.isPremium ? s.planName : t("settings.free")} value={s.planDate?.value} />
      {!s.isPremium ? (
        <Row title={t("settings.getPremium")} onPress={s.getPremium} />
      ) : (
        s.canManageBilling && <Row title={t("settings.billing")} onPress={s.billing} />
      )}
      <Hairline />
      <Row title={t("settings.appearance")} value={s.themeMode} onPress={() => s.setThemeMode(s.themeMode === "dark" ? "light" : "dark")} />
      <Row title={t("settings.libraryLayout")} value={s.layout} onPress={() => s.setLayout(s.layout === "grid" ? "list" : "grid")} />
      {s.privacySettings && (
        <>
          <Hairline />
          {PRIVACY_SETTINGS.map((setting) => {
            const value = s.privacySettings![setting];
            // Tapping steps to the next audience
            const next = s.audiences[(s.audiences.indexOf(value) + 1) % s.audiences.length];
            return (
              <Row
                key={setting}
                title={t(`settings.${setting}`)}
                value={s.audienceLabel(setting, value)}
                onPress={() => s.setPrivacy(setting, next)}
              />
            );
          })}
          <Text style={{ fontSize: 13, lineHeight: 18, color: colors.ink2, marginBottom: 8 }}>{t("settings.privacyFooter")}</Text>
        </>
      )}
      {s.notificationSettings && (
        <>
          <Hairline />
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.ink2, marginTop: 18, marginBottom: 4 }}>
            {t("settings.notificationsSection")}
          </Text>
          {NOTIFICATION_SETTINGS.map((setting, index) => (
            <View key={setting}>
              {index > 0 && <Hairline />}
              <NotificationRow
                title={t(`settings.${setting}`)}
                subtitle={setting === "notifyActivity" ? t("settings.notifyActivityDescription") : undefined}
                value={s.notificationSettings![setting]}
                onValueChange={(value) => s.setNotification(setting, value)}
              />
            </View>
          ))}
          {s.pushPermissionStatus === "denied" && (
            <Row title={t("settings.turnOnNotificationsInSettings")} onPress={s.openNotificationSettings} />
          )}
          {s.pushPermissionStatus === "undetermined" && (
            <Row title={t("settings.turnOnNotifications")} onPress={() => void s.requestPushPermission()} />
          )}
          <Text style={{ fontSize: 13, lineHeight: 18, color: colors.ink2, marginBottom: 8 }}>
            {t("settings.notificationsFooter")}
          </Text>
        </>
      )}
      <Hairline />
      <Row title={t("settings.blockedUsers")} onPress={s.blockedUsers} />
      <Row title={t("settings.terms")} onPress={s.terms} />
      <Row title={t("settings.privacy")} onPress={s.privacy} />
      <CapsuleButton title={t("settings.signOut")} variant="outline" onPress={s.signOut} style={{ marginTop: 24 }} />
      <CapsuleButton title={t("settings.deleteAccount")} variant="plain" destructive onPress={s.deleteAccount} style={{ marginTop: 8 }} />
      <Text style={{ fontSize: 13, color: colors.ink2, textAlign: "center", marginTop: 16 }}>{s.version}</Text>
    </ScrollView>
  );
}

function NotificationRow({ title, subtitle, value, onValueChange }: { title: string; subtitle?: string; value: boolean; onValueChange: (value: boolean) => void }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 14 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 17, color: colors.ink }}>{title}</Text>
        {subtitle && <Text style={{ fontSize: 13, lineHeight: 18, color: colors.ink2, marginTop: 2 }}>{subtitle}</Text>}
      </View>
      <NativeSwitch value={value} onValueChange={onValueChange} accessibilityLabel={title} />
    </View>
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
