import { DisplayText, Hairline } from "@/components/echo";
import { FollowRow } from "@/components/profile/follow-row";
import { useFollowList, useUserProfile } from "@/hooks/api/profile/use-profile-queries";
import { useProfile } from "@/hooks/api/user/use-get-me";
import { getErrorMessage, isApiRequestError } from "@/lib/api/errors";
import { displayName } from "@/lib/books";
import type { Audience } from "@/lib/schemas";
import { spacing, type, useColors } from "@/lib/theme";
import { SegmentedControl } from "@expo/ui/community/segmented-control";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FollowDirection = "followers" | "following";

/** A reader's paginated followers/following list. */
export default function FollowListScreen() {
  const params = useLocalSearchParams<{ userId: string; direction: string }>();
  const direction: FollowDirection = params.direction === "following" ? "following" : "followers";
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const me = useProfile();
  const otherProfile = useUserProfile(params.userId, me.data?.id !== params.userId);
  const isSelf = me.data?.id === params.userId || otherProfile.data?.relationship?.isSelf === true;
  const target = isSelf ? (me.data ?? otherProfile.data?.user) : otherProfile.data?.user;
  const targetReady = isSelf ? !!target : !!otherProfile.data;
  const contentVisible = isSelf || otherProfile.data?.access?.content !== false;
  const followList = useFollowList(params.userId, direction, targetReady && contentVisible);
  const followerCount = isSelf ? me.data?.followerCount : otherProfile.data?.followerCount;
  const followingCount = isSelf ? me.data?.followingCount : otherProfile.data?.followingCount;
  const name = target ? displayName(target) : t(direction === "followers" ? "profile.followersTitle" : "profile.followingTitle");
  const listNotFound = followList.isError && isApiRequestError(followList.error) && followList.error.statusCode === 404;
  const locked = (!isSelf && otherProfile.data?.access?.content === false) || listNotFound;
  const items = locked ? [] : (followList.data?.pages.flatMap((page) => page.results) ?? []);
  const audience = otherProfile.data?.visibility?.content;

  const emptyText = direction === "followers"
    ? isSelf
      ? t("profile.noFollowers")
      : t("profile.noFollowersOther", { name })
    : isSelf
      ? t("profile.noFollowing")
      : t("profile.noFollowingOther", { name });

  const message = locked
    ? lockedMessage(audience, name, t)
    : otherProfile.isError
      ? getErrorMessage(otherProfile.error)
      : followList.isError
        ? getErrorMessage(followList.error)
        : emptyText;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.paper }}
      data={items}
      keyExtractor={(user) => user.id}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{
        paddingTop: insets.top + 64,
        paddingBottom: insets.bottom + spacing.xxl,
        paddingHorizontal: spacing.lg,
        flexGrow: 1,
      }}
      ListHeaderComponent={
        <View style={{ gap: spacing.lg, paddingBottom: spacing.md }}>
          <DisplayText style={{ color: colors.ink }}>{name}</DisplayText>
          <SegmentedControl
            values={[
              t("profile.followersTab", { count: followerCount ?? 0 }),
              t("profile.followingTab", { count: followingCount ?? 0 }),
            ]}
            selectedIndex={direction === "followers" ? 0 : 1}
            onChange={(event) => {
              const next: FollowDirection = event.nativeEvent.selectedSegmentIndex === 1 ? "following" : "followers";
              router.setParams({ direction: next });
            }}
            style={{ height: 36 }}
          />
        </View>
      }
      renderItem={({ item }) => <FollowRow user={item} />}
      ItemSeparatorComponent={Hairline}
      onEndReached={() => {
        if (followList.hasNextPage && !followList.isFetchingNextPage) followList.fetchNextPage();
      }}
      onEndReachedThreshold={0.6}
      ListEmptyComponent={
        (!targetReady && !otherProfile.isError) || (followList.isPending && !locked && !otherProfile.isError) ? (
          <ActivityIndicator color={colors.ink2} style={{ marginTop: spacing.xl }} />
        ) : (
          <Text style={{ ...type.secondary, color: colors.ink2, marginTop: spacing.lg }}>{message}</Text>
        )
      }
      ListFooterComponent={
        followList.isFetchingNextPage ? <ActivityIndicator color={colors.ink2} style={{ marginTop: spacing.lg }} /> : null
      }
    />
  );
}

function lockedMessage(audience: Audience | undefined, name: string, t: ReturnType<typeof useTranslation>["t"]) {
  if (audience === "followers") return t("profile.lockedFollowers", { name });
  if (audience === "friends") return t("profile.lockedFriends", { name });
  return t("profile.lockedPrivate", { name });
}
