import { CapsuleButton, DisplayText, Hairline, SFIcon } from "@/components/echo";
import { BookResultRow } from "@/components/search/book-result-row";
import { ReaderRow } from "@/components/search/reader-row";
import { useLibrary } from "@/hooks/api/library/use-library";
import { addBookBody, useAddBook } from "@/hooks/api/library/use-library-mutations";
import { searchResultKey, useSearchBooks } from "@/hooks/api/search/use-search-books";
import { useSearchUsers } from "@/hooks/api/search/use-search-users";
import { useToggleFollow } from "@/hooks/api/social/use-follow";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/api/errors";
import type { ReadingStatus, SearchResult, UserBook } from "@/lib/schemas";
import { spacing, useColors } from "@/lib/theme";
import { SegmentedControl } from "@expo/ui/community/segmented-control";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, FlatList, Text, View } from "react-native";

type Segment = "books" | "readers";
const READERS_PAGE = 20;
const READERS_MAX = 50;

/**
 * Search (r6 04, 21): the native search field, Books / Readers, results with quick-add
 * capsules or your shelf, and Find readers with Follow.
 */
export default function SearchScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ segment?: Segment }>();

  const [segment, setSegment] = useState<Segment>(params.segment === "readers" ? "readers" : "books");
  // Arriving again with a segment (Find readers / Find a book) switches to it
  const [lastParam, setLastParam] = useState(params.segment);
  if (params.segment !== lastParam) {
    setLastParam(params.segment);
    if (params.segment === "readers" || params.segment === "books") setSegment(params.segment);
  }
  const [text, setText] = useState("");
  const q = useDebouncedValue(text.trim().slice(0, 200), 350);
  const [readersLimit, setReadersLimit] = useState(READERS_PAGE);

  const books = useSearchBooks(segment === "books" ? q : "");
  const readers = useSearchUsers(segment === "readers" ? q : "", readersLimit);
  const library = useLibrary();
  const addBook = useAddBook();
  const toggleFollow = useToggleFollow();
  const [adding, setAdding] = useState<{ key: string; status: ReadingStatus } | null>(null);

  // What you already own: internal results by catalog id, others by ISBN
  const owned = useMemo(() => {
    const byBook = new Map<string, UserBook>();
    const byIsbn = new Map<string, UserBook>();
    const data = library.data;
    for (const list of data ? [data.currentlyReading, data.wantToRead, data.finished] : []) {
      for (const ub of list) {
        byBook.set(ub.bookId, ub);
        if (ub.book.isbn) byIsbn.set(ub.book.isbn, ub);
      }
    }
    return (r: SearchResult) => (r.id && byBook.get(r.id)) || (r.isbn ? byIsbn.get(r.isbn) : undefined);
  }, [library.data]);

  const add = (result: SearchResult, status: ReadingStatus) => {
    Haptics.selectionAsync();
    setAdding({ key: searchResultKey(result), status });
    addBook.mutate(addBookBody(result, status), {
      onSuccess: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
      onError: (e) => {
        // "Book already in your library": our copy is stale; the refetch flips the row to owned
        library.refetch();
        if (!/already/i.test(getErrorMessage(e))) Alert.alert(getErrorMessage(e));
      },
      onSettled: () => setAdding(null),
    });
  };

  const changeSegment = (next: Segment) => {
    if (next === segment) return;
    Haptics.selectionAsync();
    setSegment(next);
  };

  const header = (
    <View style={{ paddingHorizontal: spacing.lg }}>
      <DisplayText style={{ color: colors.ink, marginTop: 6 }}>{t("search.title")}</DisplayText>
      <SegmentedControl
        values={[t("search.books"), t("search.readers")]}
        selectedIndex={segment === "books" ? 0 : 1}
        onChange={(e) => changeSegment(e.nativeEvent.selectedSegmentIndex === 0 ? "books" : "readers")}
        style={{ marginTop: 18, height: 36 }}
      />
      <SearchCaption segment={segment} q={q} books={books} readers={readers} />
    </View>
  );

  return (
    <>
      <Stack.SearchBar
        placeholder={t("search.placeholder")}
        autoCapitalize="none"
        hideWhenScrolling={false}
        // TODO: r6 docks the field at the bottom beside a collapsed tab button (iOS 26 search tab);
        // react-native-screens 4.26 keeps it in the navigation bar
        placement="stacked"
        onChangeText={(e) => {
          setText(e.nativeEvent.text);
          setReadersLimit(READERS_PAGE);
        }}
        onCancelButtonPress={() => setText("")}
      />
      {segment === "books" ? (
        <FlatList
          data={q ? books.results : []}
          keyExtractor={searchResultKey}
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={header}
          ItemSeparatorComponent={() => <Hairline style={{ marginHorizontal: spacing.lg }} />}
          renderItem={({ item }) => {
            const mine = owned(item);
            const bookId = mine?.bookId ?? item.id;
            const key = searchResultKey(item);
            return (
              <View style={{ paddingHorizontal: spacing.lg }}>
                <BookResultRow
                  result={item}
                  owned={mine}
                  adding={adding?.key === key ? adding.status : null}
                  onAdd={(s) => add(item, s)}
                  onOpen={bookId ? () => router.push({ pathname: "/book/[bookId]", params: { bookId } }) : undefined}
                />
              </View>
            );
          }}
          onEndReachedThreshold={0.6}
          onEndReached={() => books.hasNextPage && !books.isFetchingNextPage && books.fetchNextPage()}
          ListFooterComponent={books.isFetchingNextPage ? <ActivityIndicator color={colors.ink2} style={{ margin: 24 }} /> : null}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      ) : (
        <FlatList
          data={q.length >= 2 ? (readers.data?.results ?? []) : []}
          keyExtractor={(r) => r.id}
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={header}
          ItemSeparatorComponent={() => <Hairline style={{ marginHorizontal: spacing.lg }} />}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <ReaderRow
                reader={item}
                onOpen={() => router.push({ pathname: "/user/[userId]", params: { userId: item.id } })}
                onToggle={() => {
                  Haptics.selectionAsync();
                  toggleFollow.mutate({ userId: item.id, following: !item.isFollowing }, { onError: (e) => Alert.alert(getErrorMessage(e)) });
                }}
              />
            </View>
          )}
          ListFooterComponent={
            readers.data?.hasMore && readersLimit < READERS_MAX ? (
              <CapsuleButton
                title={t("search.showMore")}
                variant="quiet"
                size="md"
                loading={readers.isFetching}
                onPress={() => setReadersLimit(READERS_MAX)}
                style={{ alignSelf: "center", marginTop: 16 }}
              />
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </>
  );
}

/** "From Echo's catalog" / "5 readers match …", the hints, and the empty and error states */
function SearchCaption({
  segment,
  q,
  books,
  readers,
}: {
  segment: Segment;
  q: string;
  books: ReturnType<typeof useSearchBooks>;
  readers: ReturnType<typeof useSearchUsers>;
}) {
  const colors = useColors();
  const { t } = useTranslation();
  const caption = (text: string, icon?: "cylinder" | "globe") => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 20, marginBottom: 4 }}>
      {icon && <SFIcon name={icon} size={13} color={colors.ink2} weight="regular" />}
      <Text style={{ fontSize: 13, lineHeight: 18, color: colors.ink2 }}>{text}</Text>
    </View>
  );

  if (segment === "books") {
    if (!q) return caption(t("search.booksHint"));
    if (books.isPending) return <ActivityIndicator color={colors.ink2} style={{ marginTop: 32 }} />;
    if (books.isError) return caption(`${t("search.error")} ${getErrorMessage(books.error)}`);
    if (!books.results.length) return caption(t("search.noBooks", { q }));
    return books.results[0].source === "internal" ? caption(t("search.fromCatalog"), "cylinder") : caption(t("search.fromOpenLibrary"), "globe");
  }

  if (q.length < 2) return caption(t("search.readersHint"));
  if (readers.isPending) return <ActivityIndicator color={colors.ink2} style={{ marginTop: 32 }} />;
  if (readers.isError) return caption(`${t("search.error")} ${getErrorMessage(readers.error)}`);
  const count = readers.data.total ?? readers.data.results.length;
  if (!count) return caption(t("search.noReaders", { q }));
  return caption(t("search.readersMatch", { count, q }));
}
