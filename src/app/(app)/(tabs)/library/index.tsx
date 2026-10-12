import { CapsuleButton, FieldBand, Hairline, NativeMenu, SFIcon } from "@/components/echo";
import { AlsoReadingRow } from "@/components/library/also-reading-row";
import { CollectionRow } from "@/components/library/collection-row";
import { EmptyReading, FindReadersNote } from "@/components/library/empty-reading";
import { DrainingField, FinishedMoment } from "@/components/library/finished-moment";
import { LibraryHeader } from "@/components/library/library-header";
import { PageSheet } from "@/components/library/page-sheet";
import { ReadingHero } from "@/components/library/reading-hero";
import { ShelfTabs } from "@/components/library/shelf-tabs";
import { ShelfGridCell, ShelfListRow } from "@/components/library/shelf-rows";
import { useCollections } from "@/hooks/api/collections/use-collections";
import { useLibrary } from "@/hooks/api/library/use-library";
import { useProgressCommitter } from "@/hooks/api/library/use-progress-committer";
import { useRateBook } from "@/hooks/api/library/use-rate-book";
import { useUpdateProgress } from "@/hooks/api/library/use-update-progress";
import { getErrorMessage } from "@/lib/api/errors";
import { bookTotal } from "@/lib/books";
import { heroBook, SHELF_KEY, type Shelf } from "@/lib/library-cache";
import type { UserBook } from "@/lib/schemas";
import { getFromLocalStorage, setInLocalStorage, STORAGE_KEYS } from "@/lib/storage";
import { spacing, useColors } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type View_ = "grid" | "list";
type Sort = "recentlyFinished" | "recentlyAdded" | "title" | "author" | "rating";

const DEFAULT_SORT: Record<Exclude<Shelf, "reading">, Sort> = {
  want: "recentlyAdded",
  finished: "recentlyFinished",
  favourites: "recentlyAdded",
};

function sortBooks(books: Array<UserBook>, sort: Sort) {
  const list = [...books];
  switch (sort) {
    case "recentlyFinished":
      return list.sort((a, b) => (b.finishedAt ?? "").localeCompare(a.finishedAt ?? ""));
    case "recentlyAdded":
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "title":
      return list.sort((a, b) => a.book.title.localeCompare(b.book.title));
    case "author":
      return list.sort((a, b) => a.book.author.localeCompare(b.book.author));
    case "rating":
      return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }
}

export default function LibraryScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const library = useLibrary();
  const collections = useCollections();
  const updateProgress = useUpdateProgress();
  const committer = useProgressCommitter();
  const rateBook = useRateBook();

  /** The book that just reached its last page, held while the stamp and "Rate it" play */
  const [finishing, setFinishing] = useState<{ userBook: UserBook; previousPage: number } | null>(null);
  useFocusEffect(useCallback(() => () => setFinishing(null), []));

  const [shelf, setShelfState] = useState<Shelf>(() => getFromLocalStorage<Shelf>(STORAGE_KEYS.LIBRARY_TAB) ?? "reading");
  const [view, setViewState] = useState<View_>(() => getFromLocalStorage<View_>(STORAGE_KEYS.LIBRARY_VIEW) ?? "grid");
  const [sorts, setSorts] = useState<Partial<Record<Shelf, Sort>>>(
    () => getFromLocalStorage<Partial<Record<Shelf, Sort>>>(STORAGE_KEYS.LIBRARY_SORT) ?? {},
  );
  const [pageSheetOpen, setPageSheetOpen] = useState(false);
  /** The page number is being dragged: hold the scroll view still */
  const [dialActive, setDialActive] = useState(false);

  const setShelf = (next: Shelf) => {
    setFinishing(null);
    setShelfState(next);
    setInLocalStorage(STORAGE_KEYS.LIBRARY_TAB, next);
  };
  const toggleView = () => {
    const next = view === "grid" ? "list" : "grid";
    setViewState(next);
    setInLocalStorage(STORAGE_KEYS.LIBRARY_VIEW, next);
    Haptics.selectionAsync();
  };

  const data = library.data;
  const counts = {
    reading: data?.currentlyReading.length ?? 0,
    want: data?.wantToRead.length ?? 0,
    finished: data?.finished.length ?? 0,
    favourites: data?.favoriteBooks.length ?? 0,
  };
  const hero = heroBook(data);
  // While a book is being stamped finished, every other reading book is "also reading"
  const shownHeroId = finishing ? undefined : hero?.id;
  const alsoReading = useMemo(
    () => [...(data?.currentlyReading ?? [])].filter((b) => b.id !== shownHeroId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [data, shownHeroId],
  );

  const onField = shelf === "reading";
  const sort = shelf === "reading" ? null : (sorts[shelf] ?? DEFAULT_SORT[shelf]);
  const shelfBooks = useMemo(
    () => (shelf === "reading" || !data || !sort ? [] : sortBooks(data[SHELF_KEY[shelf]], sort)),
    [data, shelf, sort],
  );

  const setSort = (next: Sort) => {
    const all = { ...sorts, [shelf]: next };
    setSorts(all);
    setInLocalStorage(STORAGE_KEYS.LIBRARY_SORT, all);
  };

  /** Every page change from the stamp or the stepper; the last page starts the finished moment */
  const setPage = (page: number) => {
    if (!hero) return;
    const total = bookTotal(hero, hero.book);
    const previousPage = hero.currentPage ?? 0;
    if (page === previousPage) return;
    committer.commit(hero.id, page);
    if (total && page === total) {
      setFinishing({ userBook: { ...hero, currentPage: total, status: "finished" }, previousPage });
    }
  };

  const step = (delta: number) => {
    if (!hero) return;
    const total = bookTotal(hero, hero.book);
    const page = hero.currentPage ?? 0;
    const next = Math.max(0, total ? Math.min(total, page + delta) : page + delta);
    if (next === page) return;
    Haptics.selectionAsync();
    if (next % 10 === 0) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPage(next);
  };

  const undoFinish = () => {
    if (!finishing) return;
    // Below the total, the server moves the book back to Reading (finishedAt keeps its date: harmless)
    committer.commit(finishing.userBook.id, finishing.previousPage);
    setFinishing(null);
  };

  const rateFinished = (rating: number) => {
    if (!finishing) return;
    committer.flushNow();
    rateBook.mutate({ userBookId: finishing.userBook.id, rating }, { onError: (e) => Alert.alert(getErrorMessage(e)) });
    // Let the stars land before the next book takes the hero
    setTimeout(() => setFinishing(null), 900);
  };

  // TODO(phase 8): open collection detail
  const openBook = (userBook: UserBook) => router.push({ pathname: "/book/[bookId]", params: { bookId: userBook.bookId } });
  const findBook = () => router.navigate({ pathname: "/search", params: { segment: "books" } });

  const refresh = () => {
    library.refetch();
    collections.refetch();
  };

  const finishedThisYear = data?.finished.filter((b) => b.finishedAt?.startsWith(String(new Date().getFullYear()))).length ?? 0;
  const gridCell = (width - spacing.lg * 2 - 12 * 2) / 3;

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        scrollEnabled={!dialActive}
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
        scrollIndicatorInsets={{ top: insets.top }}
        refreshControl={
          <RefreshControl
            refreshing={library.isRefetching}
            onRefresh={refresh}
            tintColor={onField ? colors.onField : colors.ink2}
            progressViewOffset={insets.top}
          />
        }
      >
        {/* Pink above the top so pull-to-refresh doesn't reveal paper behind the field */}
        {onField && !finishing && <View style={{ position: "absolute", top: -1000, left: 0, right: 0, height: 1000, backgroundColor: colors.field }} />}

        <Top onField={onField} draining={!!finishing && onField} paddingTop={insets.top + 6}>
          <LibraryHeader onField={onField} view={view} onToggleView={toggleView} />
          <ShelfTabs active={shelf} counts={counts} onChange={setShelf} onField={onField} />

          {onField &&
            library.isSuccess &&
            (finishing ? (
              <FinishedMoment userBook={finishing.userBook} onRate={rateFinished} onUndo={undoFinish} />
            ) : hero ? (
              <ReadingHero
                userBook={hero}
                onStep={step}
                onSetPage={setPage}
                onEditPage={() => setPageSheetOpen(true)}
                onDragChange={setDialActive}
                onOpen={() => openBook(hero)}
              />
            ) : (
              <EmptyReading onFindBook={findBook} />
            ))}

          {!onField && library.isSuccess && (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
              <Text style={{ fontSize: 13, color: colors.ink2, fontVariant: ["tabular-nums"] }}>
                {t("library.booksCount", { count: shelfBooks.length })}
                {shelf === "finished" ? ` · ${t("library.thisYear", { count: finishedThisYear })}` : ""}
              </Text>
              <NativeMenu
                accessibilityLabel={t(`library.sort.${sort}`)}
                items={(["recentlyFinished", "recentlyAdded", "title", "author", "rating"] as Array<Sort>)
                  .filter((s) => shelf === "finished" || s !== "recentlyFinished")
                  .map((s) => ({ title: t(`library.sort.${s}`), checked: s === sort, onPress: () => setSort(s) }))}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 2, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: colors.ink }}>{t(`library.sort.${sort}`)}</Text>
                  <SFIcon name="chevron.down" size={11} weight="semibold" />
                </View>
              </NativeMenu>
            </View>
          )}
        </Top>

        {library.isPending && <ActivityIndicator color={colors.ink2} style={{ marginTop: 48 }} />}
        {library.isError && (
          <View style={{ padding: spacing.lg, gap: spacing.md, alignItems: "flex-start" }}>
            <Text style={{ fontSize: 17, color: colors.ink }}>{t("library.error")}</Text>
            <Text style={{ fontSize: 13, color: colors.ink2 }}>{getErrorMessage(library.error)}</Text>
            <CapsuleButton title={t("common.retry")} variant="outline" size="md" onPress={refresh} />
          </View>
        )}

        {library.isSuccess && onField && (
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: 28 }}>
            {!hero && <FindReadersNote onFindReaders={() => router.navigate({ pathname: "/search", params: { segment: "readers" } })} />}

            {alsoReading.length > 0 && (
              <>
                <Text style={{ fontSize: 13, fontWeight: "600", color: colors.ink2, marginBottom: 4 }}>{t("library.alsoReading")}</Text>
                {alsoReading.map((b, i) => (
                  <View key={b.id}>
                    {i > 0 && <Hairline />}
                    <AlsoReadingRow userBook={b} onPress={() => openBook(b)} />
                  </View>
                ))}
              </>
            )}

            {(collections.data?.length ?? 0) > 0 && (
              <View style={{ marginTop: alsoReading.length || !hero ? 32 : 0 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: colors.ink2, marginBottom: 4 }}>{t("library.collections")}</Text>
                {collections.data!.map((c, i) => (
                  <View key={c.id}>
                    {i > 0 && <Hairline />}
                    <CollectionRow collection={c} />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {library.isSuccess && !onField && (
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: 8 }}>
            {shelfBooks.length === 0 ? (
              <Text style={{ fontSize: 15, color: colors.ink2, marginTop: 24 }}>{t("library.empty.shelf")}</Text>
            ) : view === "list" ? (
              shelfBooks.map((b, i) => (
                <View key={b.id}>
                  {i > 0 && <Hairline />}
                  <ShelfListRow userBook={b} onPress={() => openBook(b)} />
                </View>
              ))
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 12, rowGap: 22, paddingTop: 16 }}>
                {shelfBooks.map((b) => (
                  <ShelfGridCell key={b.id} userBook={b} width={gridCell} onPress={() => openBook(b)} />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <PageSheet
        userBook={hero}
        isPresented={pageSheetOpen}
        onDismiss={() => setPageSheetOpen(false)}
        onSave={(change) => {
          if (!hero) return;
          if (change.pageCount === undefined) return setPage(change.currentPage);
          const newTotal = change.pageCount;
          updateProgress.mutate({ userBookId: hero.id, ...change }, { onError: (e) => Alert.alert(getErrorMessage(e)) });
          if (change.currentPage === newTotal) {
            setFinishing({ userBook: { ...hero, pageCount: newTotal, currentPage: newTotal, status: "finished" }, previousPage: hero.currentPage ?? 0 });
          }
        }}
      />
    </View>
  );
}

/** The top block: the pink field for Reading, plain paper for the other shelves */
function Top({
  onField,
  draining,
  paddingTop,
  children,
}: {
  onField: boolean;
  /** The finished moment: the field drains away behind the content */
  draining: boolean;
  paddingTop: number;
  children: React.ReactNode;
}) {
  if (draining) return <DrainingField style={{ paddingTop, paddingBottom: 28, paddingHorizontal: spacing.lg }}>{children}</DrainingField>;
  if (onField) return <FieldBand style={{ paddingTop, paddingBottom: 28 }}>{children}</FieldBand>;
  return <View style={{ paddingTop, paddingHorizontal: spacing.lg }}>{children}</View>;
}
