import { CapsuleButton, Cover, Hairline, Stamp, Toolbar } from "@/components/echo";
import { FeedItemView } from "@/components/feed/feed-item";
import { CollectionRow } from "@/components/library/collection-row";
import { FollowCounts, ProfileHead, ReadingNowBand, ShelfStrip, YearStat } from "@/components/profile/profile-parts";
import { useUserActivity, useUserProfile, useUserReviews } from "@/hooks/api/profile/use-profile-queries";
import { useToggleFollow } from "@/hooks/api/social/use-follow";
import { useModerationActions } from "@/hooks/use-moderation-actions";
import { displayName } from "@/lib/books";
import { shortDate } from "@/lib/dates";
import { getErrorMessage, isApiRequestError } from "@/lib/api/errors";
import type { Audience, OtherUserProfile, ProfileShelf } from "@/lib/schemas";
import { spacing, useColors } from "@/lib/theme";
import { SegmentedControl } from "@expo/ui/community/segmented-control";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Tab = "books" | "reviews" | "activity";
const TABS: Array<Tab> = ["books", "reviews", "activity"];

/**
 * Someone else's profile (not drawn; built in the You screen's language from
 * GET /users/{id}): who they are, Follow and whether you're friends, then
 * Books (this year's count, shelves, public collections), Reviews and
 * Activity, each shown only as far as their privacy settings allow.
 */
export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useUserProfile(userId);
  const toggleFollow = useToggleFollow();
  const { report, confirmBlock } = useModerationActions();
  const [tab, setTab] = useState<Tab>("books");
  // Where the tabs sit in the scroll content, and whether they're pinned under the header
  const [tabsTop, setTabsTop] = useState<number | null>(null);
  const [pinned, setPinned] = useState(false);
  // Just below the header's back and ⋯ buttons
  const pinAt = insets.top + 60;

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
  const name = displayName(p.user);

  return (
    <>
    <Toolbar
      placement="right"
      items={[
        {
          kind: "menu",
          icon: "ellipsis",
          label: t("moderation.moreFor", { name }),
          items: [
            { title: t("moderation.reportUser"), systemImage: "flag", onPress: () => report("user", p.user.id) },
            {
              title: t("moderation.block"),
              systemImage: "hand.raised",
              destructive: true,
              onPress: () => confirmBlock(p.user.id, name, () => router.back()),
            },
          ],
        },
      ]}
    />
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.paper }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{ paddingTop: insets.top + 64, paddingBottom: insets.bottom + 48 }}
      scrollEventThrottle={16}
      onScroll={(e) => {
        if (tabsTop === null) return;
        const next = e.nativeEvent.contentOffset.y >= tabsTop - pinAt;
        if (next !== pinned) setPinned(next);
      }}
    >
      <ProfileHead user={p.user}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 16, marginTop: 16 }}>
          <CapsuleButton
            title={following ? t("profile.followingButton") : t("profile.follow")}
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
          {p.relationship?.isFriend ? (
            <Stamp label={t("profile.friend").toUpperCase()} size={11} rotate={-5} />
          ) : p.relationship?.followsYou ? (
            <Text style={{ fontSize: 13, color: colors.ink2 }}>{t("profile.followsYou")}</Text>
          ) : null}
        </View>
        <FollowCounts
          userId={p.user.id}
          followerCount={p.followerCount}
          followingCount={p.followingCount}
          interactive={p.access?.content === true}
        />
      </ProfileHead>

      {/* Servers before privacy settings send no access and have no Reviews or Activity lists */}
      {p.access ? (
        <>
          <View
            style={{ paddingHorizontal: spacing.lg, marginTop: 24 }}
            onLayout={(e) => setTabsTop(e.nativeEvent.layout.y)}
          >
            <ProfileTabs tab={tab} onChange={setTab} />
          </View>
          {tab === "books" &&
            (p.access.content ? (
              <BooksTab profile={p} />
            ) : (
              <Locked audience={p.visibility?.content} name={name} />
            ))}
          {tab === "reviews" &&
            (p.access.reviews ? (
              <ReviewsTab userId={p.user.id} />
            ) : (
              <Locked audience={p.visibility?.reviews} name={name} />
            ))}
          {tab === "activity" &&
            (p.access.activity ? (
              <ActivityTab userId={p.user.id} />
            ) : (
              <Locked audience={p.visibility?.activity} name={name} />
            ))}
        </>
      ) : (
        <BooksTab profile={p} />
      )}
    </ScrollView>
    {/* Once the tabs scroll up to the header buttons they stay there, on paper. Always
        mounted (hidden until pinned) so the native control doesn't flash in. */}
    {p.access && (
      <View
        pointerEvents={pinned ? "auto" : "none"}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          opacity: pinned ? 1 : 0,
          backgroundColor: colors.paper,
          paddingTop: pinAt,
          paddingHorizontal: spacing.lg,
          paddingBottom: 16,
        }}
      >
        <ProfileTabs tab={tab} onChange={setTab} />
        <Hairline style={{ position: "absolute", left: 0, right: 0, bottom: 0 }} />
      </View>
    )}
    </>
  );
}

function ProfileTabs({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  const { t } = useTranslation();
  return (
    <SegmentedControl
      values={[t("profile.tabBooks"), t("profile.tabReviews"), t("profile.tabActivity")]}
      selectedIndex={TABS.indexOf(tab)}
      onChange={(e) => onChange(TABS[e.nativeEvent.selectedSegmentIndex] ?? "books")}
      style={{ height: 36 }}
    />
  );
}

function BooksTab({ profile: p }: { profile: OtherUserProfile }) {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const openBook = (bookId: string) => router.push({ pathname: "/book/[bookId]", params: { bookId } });
  // The full shelves need GET /users/{id}/books, which came with privacy settings
  const seeAll = (shelf: ProfileShelf) =>
    p.access ? () => router.push({ pathname: "/user-shelf/[userId]/[shelf]", params: { userId: p.user.id, shelf } }) : undefined;
  const wantToRead = p.wantToRead ?? [];
  const empty =
    !p.currentlyReading.length && !p.favorites.length && !wantToRead.length && !p.recentlyFinished.length && !p.publicCollections.length;

  return (
    <>
      <YearStat count={p.stats.booksFinishedThisYear} pages={p.stats.pagesReadThisYear} />
      <ReadingNowBand books={p.currentlyReading} onOpen={openBook} />
      {empty && (
        <Text style={{ fontSize: 15, color: colors.ink2, paddingHorizontal: spacing.lg, marginTop: 28 }}>
          {t("profile.nothingYet", { name: displayName(p.user) })}
        </Text>
      )}
      <ShelfStrip title={t("profile.favourites")} books={p.favorites.map((b) => b.book)} onOpen={openBook} onSeeAll={seeAll("favourites")} />
      <ShelfStrip
        big
        title={t("profile.wantToRead")}
        count={p.counts?.want}
        books={wantToRead.map((b) => b.book)}
        onOpen={openBook}
        onSeeAll={seeAll("want")}
      />
      <ShelfStrip
        big
        title={p.access ? t("profile.finished") : t("profile.recentlyFinished")}
        count={p.stats.finishedCount}
        books={p.recentlyFinished.map((b) => b.book)}
        onOpen={openBook}
        onSeeAll={seeAll("finished")}
      />

      {p.publicCollections.length > 0 && (
        <View style={{ paddingHorizontal: spacing.lg, marginTop: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.ink2, marginBottom: 4 }}>{t("profile.publicCollections")}</Text>
          {p.publicCollections.map((c) => (
            <CollectionRow
              key={c.id}
              collection={{ ...c, bookCount: c.bookCount ?? 0, books: [] }}
              onPress={() => router.push({ pathname: "/collection/[id]", params: { id: c.id, shared: "1" } })}
            />
          ))}
        </View>
      )}
    </>
  );
}

function ReviewsTab({ userId }: { userId: string }) {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const reviews = useUserReviews(userId, true);
  const items = reviews.data?.pages.flatMap((page) => page.results) ?? [];

  if (reviews.isPending) return <ActivityIndicator color={colors.ink2} style={{ marginTop: 32 }} />;
  if (reviews.isError) return <TabMessage text={getErrorMessage(reviews.error)} />;
  if (!items.length) return <TabMessage text={t("profile.noReviews")} />;

  return (
    <View style={{ paddingHorizontal: spacing.lg, marginTop: 12 }}>
      {items.map((r, i) => (
        <View key={r.id}>
          {i > 0 && <Hairline />}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/book/[bookId]", params: { bookId: r.book.id } })}
            style={{ flexDirection: "row", gap: 14, paddingVertical: 18 }}
          >
            <Cover uri={r.book.coverUrl} title={r.book.title} author={r.book.author} width={48} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontSize: 15, color: colors.ink2 }}>
                <Text style={{ fontWeight: "600", color: colors.ink }}>{r.book.title}</Text> · {shortDate(r.createdAt)}
              </Text>
              <Text style={{ fontSize: 17, lineHeight: 24, letterSpacing: -0.3, color: colors.ink, marginTop: 6 }}>{r.content}</Text>
            </View>
          </Pressable>
        </View>
      ))}
      <LoadMore query={reviews} />
    </View>
  );
}

function ActivityTab({ userId }: { userId: string }) {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const activity = useUserActivity(userId, true);
  const items = activity.data?.pages.flatMap((page) => page.activities) ?? [];

  if (activity.isPending) return <ActivityIndicator color={colors.ink2} style={{ marginTop: 32 }} />;
  if (activity.isError) return <TabMessage text={getErrorMessage(activity.error)} />;
  if (!items.length) return <TabMessage text={t("profile.noActivity")} />;

  return (
    <View style={{ marginTop: 12 }}>
      {items.map((item, i) => (
        <View key={`${item.type}:${item.book.id}:${item.date}`}>
          {i > 0 && <Hairline style={{ marginHorizontal: spacing.lg }} />}
          <FeedItemView
            item={item}
            onOpenBook={(bookId) => router.push({ pathname: "/book/[bookId]", params: { bookId } })}
            // Already on this reader's profile
            onOpenUser={() => {}}
          />
        </View>
      ))}
      <View style={{ paddingHorizontal: spacing.lg }}>
        <LoadMore query={activity} />
      </View>
    </View>
  );
}

function LoadMore({
  query,
}: {
  query: { hasNextPage: boolean; isFetchingNextPage: boolean; fetchNextPage: () => unknown };
}) {
  const { t } = useTranslation();
  if (!query.hasNextPage) return null;
  return (
    <View style={{ alignItems: "center", paddingVertical: 20 }}>
      <CapsuleButton
        title={t("profile.loadMore")}
        variant="outline"
        size="md"
        disabled={query.isFetchingNextPage}
        onPress={() => query.fetchNextPage()}
      />
    </View>
  );
}

/** What a hidden part of a profile says, by who it's shared with */
function Locked({ audience, name }: { audience?: Audience; name: string }) {
  const { t } = useTranslation();
  const text =
    audience === "followers"
      ? t("profile.lockedFollowers", { name })
      : audience === "friends"
        ? t("profile.lockedFriends", { name })
        : t("profile.lockedPrivate", { name });
  return <TabMessage text={text} />;
}

function TabMessage({ text }: { text: string }) {
  const colors = useColors();
  return (
    <Text style={{ fontSize: 15, lineHeight: 20, color: colors.ink2, paddingHorizontal: spacing.lg, marginTop: 28 }}>
      {text}
    </Text>
  );
}
