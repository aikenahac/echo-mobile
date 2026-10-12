import {
  CapsuleButton,
  CircleButton,
  DisplayText,
  Hairline,
} from "@/components/echo";
import { FeedItemView } from "@/components/feed/feed-item";
import { useFeed } from "@/hooks/api/feed/use-feed";
import { getErrorMessage } from "@/lib/api/errors";
import type { FeedItem } from "@/lib/schemas";
import { spacing, useColors } from "@/lib/theme";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const itemKey = (item: FeedItem) =>
  `${item.type}:${item.user.id}:${item.book.id}:${item.type === "book" ? item.data.status : "review"}`;
const isBand = (item: FeedItem | undefined) =>
  item?.type === "book" && item.data.status === "reading";

/** Friends (r6 03): what people you follow started, finished and reviewed */
export default function FriendsScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const feed = useFeed();

  const items = useMemo(() => {
    const seen = new Set<string>();
    return (feed.data?.pages.flatMap((p) => p.activities) ?? []).filter(
      (item) => {
        const key = itemKey(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      },
    );
  }, [feed.data]);

  const findReaders = () =>
    router.navigate({ pathname: "/search", params: { segment: "readers" } });

  return (
    // Wrapped so native tabs don't add their automatic safe-area inset to the list
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <FlatList
        style={{ flex: 1 }}
        data={items}
        keyExtractor={itemKey}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingTop: insets.top + 6,
          paddingBottom: insets.bottom + 96,
        }}
        ListHeaderComponent={
          <View
            style={{
              height: 52,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: spacing.lg,
              marginBottom: 8,
            }}
          >
            <DisplayText style={{ color: colors.ink }}>
              {t("friends.title")}
            </DisplayText>
            <CircleButton
              icon="person.badge.plus"
              accessibilityLabel={t("friends.findReaders")}
              onPress={findReaders}
            />
          </View>
        }
        renderItem={({ item }) => (
          <FeedItemView
            item={item}
            onOpenBook={(bookId) =>
              router.push({ pathname: "/book/[bookId]", params: { bookId } })
            }
          />
        )}
        // Hairlines between paper items only; a field band carries its own edges
        ItemSeparatorComponent={({ leadingItem }) => {
          const index = items.indexOf(leadingItem);
          if (isBand(leadingItem) || isBand(items[index + 1])) return null;
          return <Hairline style={{ marginHorizontal: spacing.lg }} />;
        }}
        ListEmptyComponent={
          feed.isPending ? (
            <ActivityIndicator color={colors.ink2} style={{ marginTop: 48 }} />
          ) : feed.isError ? (
            <View
              style={{
                padding: spacing.lg,
                gap: spacing.md,
                alignItems: "flex-start",
              }}
            >
              <Text style={{ fontSize: 17, color: colors.ink }}>
                {t("friends.error")}
              </Text>
              <Text style={{ fontSize: 13, color: colors.ink2 }}>
                {getErrorMessage(feed.error)}
              </Text>
              <CapsuleButton
                title={t("common.retry")}
                variant="outline"
                size="md"
                onPress={() => feed.refetch()}
              />
            </View>
          ) : (
            <View style={{ padding: spacing.lg, paddingTop: 24 }}>
              <DisplayText variant="sectionHead" style={{ color: colors.ink }}>
                {t("friends.emptyTitle")}
              </DisplayText>
              <Text
                style={{
                  fontSize: 17,
                  lineHeight: 23,
                  letterSpacing: -0.3,
                  color: colors.ink2,
                  marginTop: 8,
                }}
              >
                {t("friends.emptyBody")}
              </Text>
              <CapsuleButton
                title={t("friends.findReaders")}
                icon="person.badge.plus"
                onPress={findReaders}
                style={{ marginTop: 24, alignSelf: "flex-start" }}
              />
            </View>
          )
        }
        onEndReachedThreshold={0.6}
        onEndReached={() =>
          feed.hasNextPage && !feed.isFetchingNextPage && feed.fetchNextPage()
        }
        ListFooterComponent={
          feed.isFetchingNextPage ? (
            <ActivityIndicator color={colors.ink2} style={{ margin: 24 }} />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={feed.isRefetching && !feed.isFetchingNextPage}
            onRefresh={() => feed.refetch()}
            tintColor={colors.ink2}
          />
        }
      />
    </View>
  );
}
