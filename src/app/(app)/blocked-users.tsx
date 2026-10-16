import { AdminBadge, Avatar, CapsuleButton, DisplayText, Hairline } from "@/components/echo";
import { useBlockedUsers, useUnblockUser } from "@/hooks/api/moderation/use-moderation";
import { getErrorMessage } from "@/lib/api/errors";
import { displayName, isAdmin } from "@/lib/books";
import { spacing, useColors } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Settings > Blocked users: everyone you blocked, with Unblock */
export default function BlockedUsersScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const blocked = useBlockedUsers();
  const unblock = useUnblockUser();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.paper }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: insets.top + 56, paddingBottom: insets.bottom + 48 }}
    >
      <DisplayText style={{ color: colors.ink }}>{t("moderation.blockedTitle")}</DisplayText>
      <Text style={{ fontSize: 15, color: colors.ink2, marginTop: 8 }}>{t("moderation.blockedBody")}</Text>

      {blocked.isPending && <ActivityIndicator color={colors.ink2} style={{ marginTop: 32 }} />}
      {blocked.isError && (
        <View style={{ marginTop: 24, gap: spacing.md, alignItems: "flex-start" }}>
          <Text style={{ fontSize: 17, color: colors.ink }}>{getErrorMessage(blocked.error)}</Text>
          <CapsuleButton title={t("common.retry")} variant="outline" size="md" onPress={() => blocked.refetch()} />
        </View>
      )}
      {blocked.isSuccess && blocked.data.users.length === 0 && (
        <Text style={{ fontSize: 17, color: colors.ink2, marginTop: 24 }}>{t("moderation.noneBlocked")}</Text>
      )}
      {blocked.data?.users.map((u, i) => {
        const name = displayName(u);
        return (
          <View key={u.id}>
            {i > 0 && <Hairline />}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 }}>
              <Avatar user={u} size={44} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text numberOfLines={1} style={{ flexShrink: 1, fontSize: 17, fontWeight: "600", letterSpacing: -0.4, color: colors.ink }}>
                    {name}
                  </Text>
                  {isAdmin(u) && <AdminBadge size={14} />}
                </View>
                {u.displayName && u.username ? <Text style={{ fontSize: 13, lineHeight: 18, color: colors.ink2 }}>@{u.username}</Text> : null}
              </View>
              <CapsuleButton
                title={t("moderation.unblock")}
                variant="quiet"
                size="sm"
                accessibilityLabel={t("moderation.unblockName", { name })}
                onPress={() => unblock.mutate(u.id, { onError: (e) => Alert.alert(getErrorMessage(e)) })}
                style={{ minHeight: 34, paddingHorizontal: 14 }}
              />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
