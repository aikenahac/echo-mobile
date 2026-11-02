import { AdminBadge, Avatar, CapsuleButton, Stamp } from "@/components/echo";
import { useToggleFollow } from "@/hooks/api/social/use-follow";
import { displayName, isAdmin } from "@/lib/books";
import { getErrorMessage } from "@/lib/api/errors";
import type { FollowListUser } from "@/lib/schemas";
import { spacing, type, useColors } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, Text, View } from "react-native";

/** A follower/following row with the viewer's relationship to that reader. */
export function FollowRow({ user }: { user: FollowListUser }) {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const toggleFollow = useToggleFollow();
  const name = displayName(user);
  const handle = user.username ? `@${user.username}` : null;
  const buttonTitle = user.isFollowing
    ? t("profile.followingButton")
    : user.followsYou
      ? t("profile.followBack")
      : t("profile.follow");

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        if (user.isSelf) router.navigate("/you");
        else router.push({ pathname: "/user/[userId]", params: { userId: user.id } });
      }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing.md,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Avatar user={user} size={44} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <Text numberOfLines={1} style={{ ...type.rowTitle, flexShrink: 1, color: colors.ink }}>
            {name}
          </Text>
          {isAdmin(user) ? <AdminBadge size={14} /> : null}
        </View>
        {handle ? <Text style={{ ...type.meta, color: colors.ink2 }}>{handle}</Text> : null}
        {!user.isSelf && user.isFriend ? (
          <View style={{ alignItems: "flex-start", paddingTop: spacing.xs }}>
            <Stamp label={t("profile.friend").toUpperCase()} size={11} rotate={-4} />
          </View>
        ) : !user.isSelf && user.followsYou ? (
          <Text style={{ ...type.meta, color: colors.ink2, paddingTop: spacing.xs }}>{t("profile.followsYou")}</Text>
        ) : null}
      </View>
      {!user.isSelf ? (
        <CapsuleButton
          title={buttonTitle}
          variant={user.isFollowing ? "quiet" : "primary"}
          size="sm"
          disabled={toggleFollow.isPending}
          onPress={() => {
            Haptics.selectionAsync();
            toggleFollow.mutate(
              { userId: user.id, following: !user.isFollowing },
              { onError: (error) => Alert.alert(getErrorMessage(error)) },
            );
          }}
        />
      ) : null}
    </Pressable>
  );
}
