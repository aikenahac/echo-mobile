import { CapsuleButton, Cover, DisplayText, PlateNumber } from "@/components/echo";
import { bookTotal } from "@/lib/books";
import { pagesToday } from "@/lib/daily-pages";
import type { UserBook } from "@/lib/schemas";
import { useColors } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { Pressable, Text, useWindowDimensions, View } from "react-native";

type Props = {
  userBook: UserBook;
  /** −1 / +1 from the stepper */
  onStep: (delta: number) => void;
  /** Tap on the number: the sheet with current page and page count */
  onEditPage: () => void;
};

/**
 * The book you're reading, on the field: cover, the 120pt page number (editable),
 * "of 245 pages / 77 to go · +12 today", title, author, and −/Next page.
 */
export function ReadingHero({ userBook, onStep, onEditPage }: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  // Small phones: the mockup shrinks the cover and numeral below 760pt of height
  const compact = height < 760;

  const page = userBook.currentPage ?? 0;
  const total = bookTotal(userBook, userBook.book);
  const today = pagesToday(userBook.id, page);
  const meta = total
    ? [t("library.toGo", { count: total - page }), today ? t("library.today", { count: today }) : null].filter(Boolean).join(" · ")
    : null;

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 20, marginTop: compact ? 16 : 24 }}>
        <Cover uri={userBook.book.coverUrl} title={userBook.book.title} author={userBook.book.author} width={compact ? 104 : 140} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("library.editPage", { page })}
            onPress={() => {
              Haptics.selectionAsync();
              onEditPage();
            }}
            style={{ alignSelf: "flex-start" }}
          >
            <PlateNumber
              value={page}
              size={compact ? 96 : 120}
              color={colors.onField}
              // Already far above the largest text size; let it grow a little, not 3×
              maxFontSizeMultiplier={1.2}
              style={{ marginLeft: -4 }}
            />
            <View style={{ height: 2, backgroundColor: colors.onField, marginTop: 12 }} />
          </Pressable>
          {total ? (
            <Text style={{ fontSize: 17, fontWeight: "600", letterSpacing: -0.3, color: colors.onField, marginTop: 12 }}>
              {t("library.ofPages", { count: total })}
            </Text>
          ) : (
            <Text style={{ fontSize: 15, color: colors.onField2, marginTop: 12 }}>{t("library.noTotal")}</Text>
          )}
          {meta && (
            <Text style={{ fontSize: 15, color: colors.onField2, marginTop: 2, fontVariant: ["tabular-nums"] }}>{meta}</Text>
          )}
        </View>
      </View>

      <DisplayText variant="heroTitle" numberOfLines={2} style={{ color: colors.onField, marginTop: 18 }}>
        {userBook.book.title}
      </DisplayText>
      <Text style={{ fontSize: 15, color: colors.onField2, marginTop: 2 }}>{userBook.book.author}</Text>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
        <CapsuleButton
          icon="minus"
          variant="fieldOutline"
          accessibilityLabel={t("library.previousPage")}
          disabled={page <= 0}
          onPress={() => onStep(-1)}
          style={{ width: 52 }}
        />
        <CapsuleButton
          icon="plus"
          title={t("library.nextPage")}
          variant="field"
          disabled={!!total && page >= total}
          onPress={() => onStep(1)}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
