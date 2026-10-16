import { Cover, ProgressBar } from "@/components/echo";
import { bookProgress, bookTotal } from "@/lib/books";
import type { UserBook } from "@/lib/schemas";
import { useColors } from "@/lib/theme";
import { Pressable, Text, View } from "react-native";

/** Another book in progress: small cover, title, progress bar and "41 / 136" */
export function AlsoReadingRow({ userBook, onPress }: { userBook: UserBook; onPress?: () => void }) {
  const colors = useColors();
  const total = bookTotal(userBook, userBook.book);
  const page = userBook.currentPage ?? 0;
  const progress = bookProgress(page, total);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, opacity: pressed ? 0.7 : 1 })}
    >
      <Cover uri={userBook.book.coverUrl} title={userBook.book.title} width={40} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={2} style={{ fontSize: 17, lineHeight: 22, fontWeight: "600", letterSpacing: -0.4, color: colors.ink }}>
          {userBook.book.title}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 }}>
          {progress !== null && <ProgressBar value={progress} style={{ flex: 1 }} />}
          <Text style={{ fontSize: 13, color: colors.ink2, fontVariant: ["tabular-nums"] }}>
            {total ? `${page} / ${total}` : page}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
