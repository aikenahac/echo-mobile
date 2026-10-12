import { CapsuleButton } from "@/components/echo";
import { CollectionRow } from "@/components/library/collection-row";
import { ProfileHead, ReadingNowBand, ShelfStrip, YearStat } from "@/components/profile/profile-parts";
import { useUserProfile } from "@/hooks/api/profile/use-profile-queries";
import { useToggleFollow } from "@/hooks/api/social/use-follow";
import { getErrorMessage, isApiRequestError } from "@/lib/api/errors";
import { spacing, useColors } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Someone else's profile (not drawn; built in the You screen's language from
 * GET /users/{id}): who they are, Follow, this year's count, what they're reading,
 * favourites, recently finished and public collections. Never reviews or email.
 */
export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useUserProfile(userId);
  const toggleFollow = useToggleFollow();

  const openBook = (bookId: string) => router.push({ pathname: "/book/[bookId]", params: { bookId } });

  if (profile.isPending) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.paper, justifyContent: "center" }}>
        <ActivityIndicator color={colors.ink2} />
      </View>
    );
  }
  if (profile.isError) {
    const notFound = isApiRequestError(profile.error) && profile.error.statusCode === 404;
    return (
      <View style={{ flex: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: insets.top + 64 }}>
        <Text style={{ fontSize: 17, color: colors.ink }}>{notFound ? t("profile.notFound") : getErrorMessage(profile.error)}</Text>
      </View>
    );
  }

  const p = profile.data;
  const following = p.isFollowing;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.paper }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{ paddingTop: insets.top + 64, paddingBottom: insets.bottom + 48 }}
    >
      <ProfileHead user={p.user}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 16 }}>
          <CapsuleButton
            title={following ? t("search.following") : t("search.follow")}
            variant={following ? "quiet" : "primary"}
            size="md"
            onPress={() => {
              Haptics.selectionAsync();
              toggleFollow.mutate(
                { userId: p.user.id, following: !following },
                { onError: (e) => Alert.alert(getErrorMessage(e)), onSettled: () => profile.refetch() },
              );
            }}
          />
          <Text style={{ fontSize: 13, color: colors.ink2 }}>
            {t("profile.followers", { count: p.followerCount })} · {t("profile.following", { count: p.followingCount })}
          </Text>
        </View>
      </ProfileHead>

      <YearStat count={p.stats.booksFinishedThisYear} />
      <ReadingNowBand books={p.currentlyReading} onOpen={openBook} />
      <ShelfStrip title={t("profile.favourites")} books={p.favorites.map((b) => b.book)} onOpen={openBook} />
      <ShelfStrip big title={t("profile.recentlyFinished")} count={p.stats.finishedCount} books={p.recentlyFinished.map((b) => b.book)} onOpen={openBook} />

      {p.publicCollections.length > 0 && (
        <View style={{ paddingHorizontal: spacing.lg, marginTop: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.ink2, marginBottom: 4 }}>{t("profile.publicCollections")}</Text>
          {p.publicCollections.map((c) => (
            <CollectionRow key={c.id} collection={{ ...c, bookCount: c.bookCount ?? 0, books: [] }} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
