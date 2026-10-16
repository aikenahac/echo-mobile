import {
  Avatar,
  Cover,
  DisplayText,
  FieldBand,
  PlateNumber,
} from "@/components/echo";
import { bookTotal, displayName } from "@/lib/books";
import type { Book, PublicUser, UserBook } from "@/lib/schemas";
import { spacing, useColors } from "@/lib/theme";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

type Person = Pick<
  PublicUser,
  "displayName" | "username" | "profilePictureUrl"
> & { bio?: string | null; email?: string };

/** Square 64pt avatar, the name in Archivo, @username, and the bio (r6 09) */
export function ProfileHead({
  user,
  children,
}: {
  user: Person;
  children?: ReactNode;
}) {
  const colors = useColors();
  const { fontScale } = useWindowDimensions();
  const name = displayName(user);
  const handle = user.displayName && user.username ? `@${user.username}` : null;
  return (
    <View style={{ paddingHorizontal: spacing.lg }}>
      <View
        style={{
          flexDirection: fontScale > 1.6 ? "column" : "row",
          alignItems: fontScale > 1.6 ? "flex-start" : "center",
          gap: 16,
        }}
      >
        <Avatar user={user} size={64} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <DisplayText
            variant="heroTitle"
            numberOfLines={2}
            style={{ fontFamily: "ArchivoCondensed-Black", color: colors.ink }}
            accessibilityRole="header"
          >
            {name}
          </DisplayText>
          {handle && (
            <Text style={{ fontSize: 15, color: colors.ink2, marginTop: 2 }}>
              {handle}
            </Text>
          )}
        </View>
      </View>
      {!!user.bio && (
        <Text
          style={{
            fontSize: 17,
            lineHeight: 24,
            letterSpacing: -0.3,
            color: colors.ink,
            marginTop: 16,
          }}
        >
          {user.bio}
        </Text>
      )}
      {children}
    </View>
  );
}

/** "19 / books finished in 2026 / 6,412 pages", the big number on its pink plate */
export function YearStat({ count, pages }: { count: number; pages?: number }) {
  const colors = useColors();
  const { t, i18n } = useTranslation();
  const { fontScale } = useWindowDimensions();
  const year = new Date().getFullYear();
  // At accessibility text sizes the label goes under the number instead of beside it
  const stacked = fontScale > 1.6;
  return (
    <View
      style={{
        flexDirection: stacked ? "column" : "row",
        alignItems: stacked ? "flex-start" : "flex-end",
        gap: stacked ? 8 : 14,
        marginTop: 30,
        paddingHorizontal: spacing.lg,
      }}
    >
      <PlateNumber
        value={count}
        maxFontSizeMultiplier={1.2}
        style={{ marginLeft: -4 }}
      />
      <View style={{ flex: stacked ? undefined : 1, paddingBottom: 2 }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: "600",
            letterSpacing: -0.3,
            color: colors.ink,
          }}
        >
          {t("profile.booksFinishedIn", { count, year })}
        </Text>
        {pages !== undefined && (
          <Text
            style={{
              fontSize: 15,
              color: colors.ink2,
              fontVariant: ["tabular-nums"],
            }}
          >
            {t("profile.pages", {
              pages: new Intl.NumberFormat(i18n.language).format(pages),
            })}
          </Text>
        )}
      </View>
    </View>
  );
}

/** The books being read, on the field (colour = now), with "p. 168 / 245" under each */
export function ReadingNowBand({
  books,
  onOpen,
}: {
  books: Array<UserBook>;
  onOpen: (bookId: string) => void;
}) {
  const colors = useColors();
  const { t } = useTranslation();
  if (!books.length) return null;
  return (
    <FieldBand
      style={{
        marginTop: 32,
        paddingTop: 20,
        paddingBottom: 24,
        paddingHorizontal: 0,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: colors.onField,
          paddingHorizontal: spacing.lg,
        }}
      >
        {t("profile.readingNow")}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 14,
          paddingHorizontal: spacing.lg,
          paddingTop: 14,
        }}
      >
        {books.map((b) => {
          const total = bookTotal(b, b.book);
          const page = b.currentPage ?? 0;
          return (
            <Pressable
              key={b.id}
              accessibilityRole="button"
              onPress={() => onOpen(b.bookId)}
            >
              <Cover
                uri={b.book.coverUrl}
                title={b.book.title}
                author={b.book.author}
                width={76}
              />
              <Text
                style={{
                  fontSize: 13,
                  color: colors.onField2,
                  marginTop: 8,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {total
                  ? t("profile.pageOf", { page, total })
                  : t("profile.page", { page })}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </FieldBand>
  );
}

/**
 * A shelf as a horizontal strip of covers. `big` titles it in Archivo with a count
 * ("Want to read 7") and a See all link; otherwise a small grey label ("Favourites").
 */
export function ShelfStrip({
  title,
  count,
  books,
  big,
  onOpen,
  onSeeAll,
}: {
  title: string;
  count?: number;
  books: Array<Pick<Book, "id" | "title" | "author" | "coverUrl">>;
  big?: boolean;
  onOpen: (bookId: string) => void;
  onSeeAll?: () => void;
}) {
  const colors = useColors();
  const { t } = useTranslation();
  if (!books.length) return null;
  return (
    <View style={{ marginTop: big ? 36 : 28 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          justifyContent: "space-between",
          paddingHorizontal: spacing.lg,
        }}
      >
        {big ? (
          <DisplayText variant="sectionHead" style={{ color: colors.ink }}>
            {title}
            {count !== undefined && (
              <Text style={{ fontSize: 22 }}> {count}</Text>
            )}
          </DisplayText>
        ) : (
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.ink2 }}>
            {title}
          </Text>
        )}
        {onSeeAll && (
          <Pressable accessibilityRole="link" hitSlop={10} onPress={onSeeAll}>
            <Text
              style={{ fontSize: 15, fontWeight: "600", color: colors.pinkInk }}
            >
              {t("profile.seeAll")}
            </Text>
          </Pressable>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 12,
          paddingHorizontal: spacing.lg,
          paddingTop: 14,
          paddingBottom: 16,
        }}
      >
        {books.map((b) => (
          <Pressable
            key={b.id}
            accessibilityRole="button"
            onPress={() => onOpen(b.id)}
          >
            <Cover
              uri={b.coverUrl}
              title={b.title}
              author={b.author}
              width={58}
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
