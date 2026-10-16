import { CapsuleButton, Cover, DisplayText, NativeSwitch, Stars, TextField } from "@/components/echo";
import { useCatalogBook } from "@/hooks/api/catalog/use-catalog-book";
import { useRateBook } from "@/hooks/api/library/use-rate-book";
import { useDeleteReview, useSaveReview } from "@/hooks/api/reviews/use-review-mutations";
import { getErrorMessage } from "@/lib/api/errors";
import { shortDate } from "@/lib/dates";
import { REVIEW_MAX_LENGTH } from "@/lib/schemas";
import { radius, spacing, useColors } from "@/lib/theme";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

/**
 * The review editor (r6 20), a large-detent sheet: the book, editable stars (saved through
 * the rating endpoint, separately), the text with its 10,000 counter, the Private switch,
 * and Delete review. ✓ saves: POST /reviews creates or updates.
 */
export default function ReviewEditorScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const detail = useCatalogBook(bookId);
  const colors = useColors();

  if (!detail.data) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator color={colors.ink2} />
      </View>
    );
  }
  return <Editor data={detail.data} />;
}

function Editor({ data }: { data: NonNullable<ReturnType<typeof useCatalogBook>["data"]> }) {
  const { book, userBook, myReview } = data;
  const colors = useColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const saveReview = useSaveReview();
  const deleteReview = useDeleteReview();
  const rateBook = useRateBook();

  const [content, setContent] = useState(myReview?.content ?? "");
  const [isPrivate, setPrivate] = useState(myReview?.isPrivate ?? false);
  const [error, setError] = useState<string | null>(null);
  const dirty = content !== (myReview?.content ?? "") || isPrivate !== (myReview?.isPrivate ?? false);
  const count = new Intl.NumberFormat(i18n.language);

  const save = () => {
    const text = content.trim();
    if (!text) return setError(t("review.empty"));
    saveReview.mutate(
      { bookId: book.id, content: text, isPrivate },
      { onSuccess: () => router.back(), onError: (e) => setError(getErrorMessage(e)) },
    );
  };

  const close = () => {
    if (!dirty) return router.back();
    Alert.alert(t("review.discardTitle"), undefined, [
      { text: t("review.keepEditing"), style: "cancel" },
      { text: t("review.discard"), style: "destructive", onPress: () => router.back() },
    ]);
  };

  const confirmDelete = () => {
    if (!myReview) return;
    Alert.alert(t("review.deleteConfirmTitle"), t("review.deleteConfirmBody"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("review.delete"),
        style: "destructive",
        onPress: () =>
          deleteReview.mutate(
            { reviewId: myReview.id, bookId: book.id },
            { onSuccess: () => router.back(), onError: (e) => Alert.alert(getErrorMessage(e)) },
          ),
      },
    ]);
  };

  const subtitle = [book.author, userBook?.finishedAt ? t("review.finishedOn", { date: shortDate(userBook.finishedAt) }) : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <Stack.Screen.Title>{t("review.title")}</Stack.Screen.Title>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="xmark" accessibilityLabel={t("review.close")} onPress={close} />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="checkmark"
          variant="prominent"
          tintColor={colors.ink}
          accessibilityLabel={t("review.save")}
          disabled={saveReview.isPending}
          onPress={save}
        />
      </Stack.Toolbar>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 8, gap: spacing.lg }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Cover uri={book.coverUrl} title={book.title} width={40} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <DisplayText variant="listTitle" numberOfLines={2} style={{ color: colors.ink }}>
              {book.title}
            </DisplayText>
            <Text numberOfLines={1} style={{ fontSize: 15, color: colors.ink2, marginTop: 2 }}>
              {subtitle}
            </Text>
          </View>
        </View>

        {userBook && (
          <Stars
            value={userBook.rating}
            size={30}
            gap={14}
            accessibilityLabel={t("book.yourRating")}
            onChange={(rating) =>
              rateBook.mutate({ userBookId: userBook.id, rating, bookId: book.id }, { onError: (e) => Alert.alert(getErrorMessage(e)) })
            }
          />
        )}

        <View>
          <TextField
            multiline
            value={content}
            onChangeText={(v) => {
              setContent(v.slice(0, REVIEW_MAX_LENGTH));
              setError(null);
            }}
            placeholder={t("review.placeholder")}
            autoFocus={!myReview}
            error={error}
            style={{ minHeight: 240, lineHeight: 24 }}
          />
          <Text style={{ fontSize: 13, color: colors.ink2, textAlign: "right", marginTop: 6, fontVariant: ["tabular-nums"] }}>
            {t("review.counter", { n: count.format(content.length), max: count.format(REVIEW_MAX_LENGTH) })}
          </Text>
        </View>

        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 52,
              paddingHorizontal: 16,
              borderRadius: radius.field + 4,
              borderCurve: "continuous",
              backgroundColor: colors.surface,
              borderWidth: 0.5,
              borderColor: colors.rule,
            }}
          >
            <Text style={{ fontSize: 17, color: colors.ink }}>{t("review.private")}</Text>
            <NativeSwitch value={isPrivate} onValueChange={setPrivate} accessibilityLabel={t("review.private")} />
          </View>
          <Text style={{ fontSize: 13, lineHeight: 18, color: colors.ink2, marginTop: 8, paddingHorizontal: 16 }}>
            {isPrivate ? t("review.privateOn") : t("review.privateOff")}
          </Text>
        </View>

        {myReview && (
          <View style={{ alignItems: "center", paddingTop: 48 }}>
            <CapsuleButton title={t("review.delete")} variant="plain" size="lg" destructive onPress={confirmDelete} />
          </View>
        )}
      </ScrollView>
    </>
  );
}
