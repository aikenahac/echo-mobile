import { CapsuleButton, Cover, DisplayText, SFIcon, Stamp } from "@/components/echo";
import type { ReadingStatus, SearchResult, UserBook } from "@/lib/schemas";
import { useColors } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

const STATUSES: Array<ReadingStatus> = ["want", "reading", "finished"];

type Props = {
  result: SearchResult;
  /** Your library entry for this book, if you have it */
  owned: UserBook | undefined;
  /** The status being added right now (spinner on that capsule) */
  adding: ReadingStatus | null;
  onAdd: (status: ReadingStatus) => void;
  /** Internal results (and owned ones) open book detail */
  onOpen?: () => void;
};

/**
 * A search result (r6 04): cover, Archivo title, author, "year · pages"; then either the
 * Want / Reading / Finished quick-adds, or "Finished · rated 4" when it's already yours.
 */
export function BookResultRow({ result, owned, adding, onAdd, onOpen }: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const meta = [result.publishedYear, result.pages ? t("book.pages", { count: result.pages }) : null].filter(Boolean).join(" · ");

  return (
    <Pressable
      accessibilityRole={onOpen ? "button" : undefined}
      disabled={!onOpen}
      onPress={onOpen}
      style={({ pressed }) => ({ flexDirection: "row", gap: 14, paddingVertical: 16, opacity: pressed ? 0.7 : 1 })}
    >
      <Cover uri={result.coverUrl} title={result.title} author={result.author} width={64}>
        {owned && (
          <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 8, alignItems: "center" }}>
            <Stamp label={t(`stamp.${owned.status}`)} size={11} rotate={-7} />
          </View>
        )}
      </Cover>
      <View style={{ flex: 1, minWidth: 0 }}>
        <DisplayText variant="listTitle" numberOfLines={3} style={{ color: colors.ink }}>
          {result.title}
        </DisplayText>
        <Text numberOfLines={1} style={{ fontSize: 15, lineHeight: 20, color: colors.ink2, marginTop: 2 }}>
          {result.author}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
          {!!meta && <Text style={{ fontSize: 13, lineHeight: 18, color: colors.ink2 }}>{meta}</Text>}
          {result.source === "external" && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 13, color: colors.ink2 }}>{meta ? " · " : ""}</Text>
              <SFIcon name="globe" size={12} color={colors.ink2} weight="regular" />
              <Text style={{ fontSize: 13, color: colors.ink2 }}>{t("search.openLibrary")}</Text>
            </View>
          )}
        </View>

        {owned ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 }}>
            <SFIcon name="checkmark" size={12} color={colors.pinkInk} weight="semibold" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.pinkInk }}>
              {owned.status === "finished" && owned.rating
                ? t("search.ownedRated", { status: t(`book.status.${owned.status}`), rating: owned.rating })
                : t(`book.status.${owned.status}`)}
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {STATUSES.map((s, i) => (
              <CapsuleButton
                key={s}
                title={t(`search.add.${s}`)}
                variant={i === 0 ? "outline" : "quiet"}
                size="sm"
                loading={adding === s}
                disabled={!!adding}
                accessibilityLabel={t("search.addAs", { title: result.title, status: t(`book.status.${s}`) })}
                onPress={() => onAdd(s)}
                style={i === 0 ? { borderWidth: 1 } : undefined}
              />
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}
