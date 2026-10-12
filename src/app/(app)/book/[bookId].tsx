import { CapsuleButton, Cover, DisplayText, FieldBand, Hairline, Stars } from "@/components/echo";
import { FollowingReviews, YourReview } from "@/components/book/review-rows";
import { StatusStampMenu } from "@/components/book/status-stamp-menu";
import { PageSheet } from "@/components/library/page-sheet";
import { ReadingHero } from "@/components/library/reading-hero";
import { useCatalogBook } from "@/hooks/api/catalog/use-catalog-book";
import { addBookBody, useAddBook, useRemoveBook, useSetFavorite, useUpdateStatus } from "@/hooks/api/library/use-library-mutations";
import { useProgressCommitter } from "@/hooks/api/library/use-progress-committer";
import { useRateBook } from "@/hooks/api/library/use-rate-book";
import { useUpdateProgress } from "@/hooks/api/library/use-update-progress";
import { usePremiumGate } from "@/hooks/use-premium-gate";
import { getErrorMessage, isApiRequestError } from "@/lib/api/errors";
import { bookTotal } from "@/lib/books";
import { daysBetween, shortDate } from "@/lib/dates";
import type { ReadingStatus, UserBook } from "@/lib/schemas";
import { spacing, useColors } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Space for the transparent header's glass buttons */
const HEADER = 64;

/**
 * Book detail by catalog id (r6 02). A finished or wanted book sits on paper with its
 * status stamped on the cover; a book being read gets the field hero (colour = now).
 */
export default function BookDetailScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const colors = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const detail = useCatalogBook(bookId);
  const updateStatus = useUpdateStatus();
  const setFavorite = useSetFavorite();
  const removeBook = useRemoveBook();
  const addBook = useAddBook();
  const rateBook = useRateBook();
  const committer = useProgressCommitter();
  const updateProgress = useUpdateProgress();
  const { guard } = usePremiumGate();
  const [pageSheetOpen, setPageSheetOpen] = useState(false);
  const [dialActive, setDialActive] = useState(false);

  const alert = (e: unknown) => Alert.alert(getErrorMessage(e));

  if (detail.isPending) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.paper, justifyContent: "center" }}>
        <ActivityIndicator color={colors.ink2} />
      </View>
    );
  }
  if (detail.isError) {
    const notFound = isApiRequestError(detail.error) && detail.error.statusCode === 404;
    return (
      <View style={{ flex: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: insets.top + HEADER, gap: spacing.md }}>
        <Text style={{ fontSize: 17, color: colors.ink }}>{notFound ? t("book.notFound") : t("book.error")}</Text>
        {!notFound && <CapsuleButton title={t("common.retry")} variant="outline" size="md" onPress={() => detail.refetch()} style={{ alignSelf: "flex-start" }} />}
      </View>
    );
  }

  const { book, userBook, myReview, followingReviews } = detail.data;
  const ids = userBook ? { userBookId: userBook.id, bookId: book.id } : null;
  const total = bookTotal(userBook, book);
  const reading = userBook?.status === "reading";
  const asUserBook: UserBook | null = userBook ? { ...userBook, book } : null;

  const changeStatus = (status: ReadingStatus) => {
    Haptics.selectionAsync();
    if (ids) {
      updateStatus.mutate({ ...ids, status }, { onError: alert });
    } else {
      addBook.mutate(addBookBody(book, status), {
        onError: (e) => {
          // "Book already in your library": our copy was stale
          detail.refetch();
          alert(e);
        },
        onSettled: () => detail.refetch(),
      });
    }
  };

  const confirmRemove = () => {
    if (!ids) return;
    Alert.alert(t("book.removeConfirmTitle", { title: book.title }), t("book.removeConfirmBody"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("book.remove"),
        style: "destructive",
        onPress: () => removeBook.mutate(ids, { onSuccess: () => router.back(), onError: alert }),
      },
    ]);
  };

  const setPage = (page: number) => ids && committer.commit(ids.userBookId, page, ids.bookId);
  const step = (delta: number) => {
    if (!userBook) return;
    const page = userBook.currentPage ?? 0;
    const next = Math.max(0, total ? Math.min(total, page + delta) : page + delta);
    if (next === page) return;
    Haptics.selectionAsync();
    if (next % 10 === 0) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPage(next);
  };

  const meta = [book.publishedYear, total ? t("book.pages", { count: total }) : null].filter(Boolean).join(" · ");
  const readIn = userBook?.status === "finished" && userBook.startedAt && userBook.finishedAt ? daysBetween(userBook.startedAt, userBook.finishedAt) : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <Stack.Toolbar placement="right">
        {userBook && (
          <Stack.Toolbar.Button
            icon={userBook.isFavorite ? "heart.fill" : "heart"}
            tintColor={userBook.isFavorite ? colors.pinkInk : colors.ink}
            accessibilityLabel={userBook.isFavorite ? t("book.unfavourite") : t("book.favourite")}
            onPress={() => {
              Haptics.selectionAsync();
              setFavorite.mutate({ ...ids!, isFavorite: !userBook.isFavorite }, { onError: alert });
            }}
          />
        )}
        {userBook && (
          <Stack.Toolbar.Button
            icon="folder"
            tintColor={colors.ink}
            accessibilityLabel={t("book.addToCollection")}
            onPress={guard(() => router.push({ pathname: "/add-to-collection/[userBookId]", params: { userBookId: userBook.id } }))}
          />
        )}
        {userBook && (
          <Stack.Toolbar.Menu icon="ellipsis" tintColor={colors.ink} accessibilityLabel={t("book.more")}>
            <Stack.Toolbar.MenuAction icon="trash" destructive onPress={confirmRemove}>
              {t("book.remove")}
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        )}
      </Stack.Toolbar>

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        scrollEnabled={!dialActive}
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
      >
        {reading && asUserBook ? (
          <FieldBand style={{ paddingTop: insets.top + HEADER, paddingBottom: 28 }}>
            {/* Pink above the top so overscroll doesn't show paper behind the field */}
            <View style={{ position: "absolute", top: -1000, left: 0, right: 0, height: 1000, backgroundColor: colors.field }} />
            <ReadingHero
              userBook={asUserBook}
              onStep={step}
              onSetPage={setPage}
              onEditPage={() => setPageSheetOpen(true)}
              onDragChange={setDialActive}
            />
            <View style={{ marginTop: 20, alignSelf: "flex-start", marginLeft: -6 }}>
              <StatusStampMenu status="reading" onChange={changeStatus} />
            </View>
          </FieldBand>
        ) : (
          <View style={{ paddingTop: insets.top + HEADER, paddingHorizontal: spacing.lg }}>
            <View style={{ flexDirection: "row", gap: 18, alignItems: "flex-start" }}>
              <View>
                <Cover uri={book.coverUrl} title={book.title} author={book.author} width={150} />
                <View style={{ position: userBook ? "absolute" : "relative", left: 6, top: userBook ? 194 : 0, marginTop: userBook ? 0 : 16 }}>
                  <StatusStampMenu status={userBook?.status ?? null} onChange={changeStatus} />
                </View>
              </View>
              <View style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                <DisplayText numberOfLines={4} style={{ color: colors.ink, lineHeight: 42 }} accessibilityRole="header">
                  {book.title}
                </DisplayText>
                <Text style={{ fontSize: 15, color: colors.ink, marginTop: 10 }}>{book.author}</Text>
                {!!meta && <Text style={{ fontSize: 13, lineHeight: 18, color: colors.ink2 }}>{meta}</Text>}
                {userBook?.status === "finished" && (
                  <>
                    <Stars
                      value={userBook.rating}
                      size={20}
                      gap={4}
                      style={{ marginTop: 18 }}
                      accessibilityLabel={t("book.yourRating")}
                      onChange={(rating) => rateBook.mutate({ userBookId: userBook.id, rating, bookId: book.id }, { onError: alert })}
                    />
                    <Text style={{ fontSize: 13, color: colors.ink2, marginTop: 6 }}>
                      {userBook.rating ? t("book.yourRating") : t("book.notRatedYet")}
                    </Text>
                  </>
                )}
                {readIn && (
                  <Text style={{ fontSize: 13, lineHeight: 18, color: colors.ink2, marginTop: 14 }}>
                    {t("book.readIn", { count: readIn })}
                    {"\n"}
                    {t("book.dateRange", { from: shortDate(userBook!.startedAt), to: shortDate(userBook!.finishedAt) })}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        <View style={{ paddingHorizontal: spacing.lg, marginTop: reading ? 0 : 40 }}>
          {!reading && <Hairline />}
          <YourReview review={myReview} onEdit={() => router.push({ pathname: "/review/[bookId]", params: { bookId: book.id } })} />
          {followingReviews.length > 0 && <Hairline />}
          <FollowingReviews reviews={followingReviews} />
        </View>
      </ScrollView>

      <PageSheet
        userBook={asUserBook ?? undefined}
        isPresented={pageSheetOpen}
        onDismiss={() => setPageSheetOpen(false)}
        onSave={(change) => {
          if (!ids) return;
          if (change.pageCount === undefined) return setPage(change.currentPage);
          updateProgress.mutate({ userBookId: ids.userBookId, ...change }, { onError: alert });
        }}
      />
    </View>
  );
}
