import { DisplayText } from "@/components/echo";
import { ShelfGridCell } from "@/components/library/shelf-rows";
import { useUserShelf } from "@/hooks/api/profile/use-profile-queries";
import { getErrorMessage, isApiRequestError } from "@/lib/api/errors";
import { type ProfileShelf, ProfileShelfSchema } from "@/lib/schemas";
import { spacing, useColors } from "@/lib/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TITLE_KEYS = {
  reading: "profile.shelfReading",
  want: "profile.shelfWant",
  finished: "profile.shelfFinished",
  favourites: "profile.shelfFavourites",
} as const satisfies Record<ProfileShelf, string>;

const COLUMNS = 3;
const GAP = 12;

/** One of another reader's shelves in full (See all on their profile), 3 columns */
export default function UserShelfScreen() {
  const params = useLocalSearchParams<{ userId: string; shelf: string }>();
  const shelf = ProfileShelfSchema.catch("finished").parse(params.shelf);
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const books = useUserShelf(params.userId, shelf);
  const items = books.data?.pages.flatMap((page) => page.results) ?? [];
  const cell = (width - spacing.lg * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.paper }}
      data={items}
      keyExtractor={(ub) => ub.id}
      numColumns={COLUMNS}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{ paddingTop: insets.top + 56, paddingBottom: insets.bottom + 48, paddingHorizontal: spacing.lg }}
      columnWrapperStyle={{ gap: GAP }}
      ItemSeparatorComponent={() => <View style={{ height: 22 }} />}
      ListHeaderComponent={
        <DisplayText style={{ color: colors.ink, marginBottom: 20 }} accessibilityRole="header">
          {t(TITLE_KEYS[shelf])}
        </DisplayText>
      }
      renderItem={({ item }) => (
        <ShelfGridCell
          userBook={item}
          width={cell}
          onPress={() => router.push({ pathname: "/book/[bookId]", params: { bookId: item.bookId } })}
        />
      )}
      onEndReached={() => {
        if (books.hasNextPage && !books.isFetchingNextPage) books.fetchNextPage();
      }}
      onEndReachedThreshold={0.6}
      ListEmptyComponent={
        books.isPending ? (
          <ActivityIndicator color={colors.ink2} style={{ marginTop: 32 }} />
        ) : (
          <Text style={{ fontSize: 15, lineHeight: 20, color: colors.ink2 }}>
            {books.isError
              ? isApiRequestError(books.error) && books.error.statusCode === 404
                ? t("profile.notFound")
                : getErrorMessage(books.error)
              : t("profile.emptyShelf")}
          </Text>
        )
      }
      ListFooterComponent={books.isFetchingNextPage ? <ActivityIndicator color={colors.ink2} style={{ marginTop: 24 }} /> : null}
    />
  );
}
