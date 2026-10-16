import { Cover, Stars } from "@/components/echo";
import { shortDate } from "@/lib/dates";
import type { UserBook } from "@/lib/schemas";
import { useColors } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

/** List layout (r6 17): 44pt cover, title, author; ink stars and the finish date on the right */
export function ShelfListRow({ userBook, onPress }: { userBook: UserBook; onPress?: () => void }) {
  const colors = useColors();
  const { t } = useTranslation();
  const finished = userBook.status === "finished";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 10, opacity: pressed ? 0.7 : 1 })}
    >
      <Cover uri={userBook.book.coverUrl} title={userBook.book.title} width={44} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 17, fontWeight: "600", letterSpacing: -0.4, color: colors.ink }}>
          {userBook.book.title}
        </Text>
        <Text numberOfLines={1} style={{ fontSize: 15, lineHeight: 20, color: colors.ink2 }}>
          {userBook.book.author}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 4 }}>
        {finished &&
          (userBook.rating ? (
            <Stars value={userBook.rating} accessibilityLabel={`${userBook.rating} / 5`} />
          ) : (
            <Text style={{ fontSize: 13, color: colors.ink2 }}>{t("library.notRated")}</Text>
          ))}
        <Text style={{ fontSize: 13, color: colors.ink2, fontVariant: ["tabular-nums"] }}>
          {finished ? shortDate(userBook.finishedAt) : t("library.added", { date: shortDate(userBook.createdAt) })}
        </Text>
      </View>
    </Pressable>
  );
}

/** Grid layout (not drawn; follows the collection grid): 3 columns, cover, 2-line title, author */
export function ShelfGridCell({ userBook, width, onPress }: { userBook: UserBook; width: number; onPress?: () => void }) {
  const colors = useColors();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ width, opacity: pressed ? 0.7 : 1 })}>
      <Cover uri={userBook.book.coverUrl} title={userBook.book.title} author={userBook.book.author} width={width} />
      <Text numberOfLines={2} style={{ fontSize: 13, lineHeight: 17, fontWeight: "600", letterSpacing: -0.1, color: colors.ink, marginTop: 8 }}>
        {userBook.book.title}
      </Text>
      <Text numberOfLines={1} style={{ fontSize: 13, color: colors.ink2 }}>
        {userBook.book.author}
      </Text>
      {userBook.status === "finished" && userBook.rating ? <Stars value={userBook.rating} size={11} style={{ marginTop: 4 }} /> : null}
    </Pressable>
  );
}
