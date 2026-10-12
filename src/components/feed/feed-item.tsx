import { Avatar, Cover, DisplayText, Stamp, Stars } from "@/components/echo";
import { displayName } from "@/lib/books";
import { relativeTime } from "@/lib/dates";
import type { FeedItem } from "@/lib/schemas";
import { PLATE_OFFSET, spacing, useColors } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

type Props = {
  item: FeedItem;
  onOpenBook: (bookId: string) => void;
  onOpenUser: (userId: string) => void;
};

/**
 * One feed item (r6 03). "Started reading" is a full-bleed field band — the pink means
 * "now" — with a 92pt cover and the plate title. Finished items get a mini stamp and
 * stars; reviews are clamped to three lines with a small cover underneath.
 */
export function FeedItemView({ item, onOpenBook, onOpenUser }: Props) {
  const { t } = useTranslation();
  const colors = useColors();
  const when = relativeTime(item.date, t);
  const name = displayName(item.user);
  const open = () => onOpenBook(item.book.id);
  const openUser = () => onOpenUser(item.user.id);

  if (item.type === "book" && item.data.status === "reading") {
    return (
      <View
        style={{
          backgroundColor: colors.field,
          paddingHorizontal: spacing.lg,
          paddingTop: 18,
          paddingBottom: 22,
          flexDirection: "row",
          gap: 12,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={name}
          onPress={openUser}
          hitSlop={6}
        >
          <Avatar user={item.user} background="rgba(255,235,243,0.6)" />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Who
            name={name}
            verb={t("friends.startedReading")}
            when={when}
            onField
            onPressName={openUser}
          />
          <Pressable
            accessibilityRole="button"
            onPress={open}
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              gap: 12,
              marginTop: 10,
            }}
          >
            <Cover
              uri={item.book.coverUrl}
              title={item.book.title}
              author={item.book.author}
              width={92}
            />
            <View style={{ flex: 1, minWidth: 0 }}>
              <DisplayText
                variant="heroTitle"
                numberOfLines={3}
                style={{
                  fontFamily: "ArchivoCondensed-Black",
                  color: colors.onField,
                  textShadowColor: colors.plate,
                  textShadowOffset: {
                    width: PLATE_OFFSET - 1,
                    height: PLATE_OFFSET - 1,
                  },
                  textShadowRadius: 0.01,
                  paddingRight: PLATE_OFFSET,
                }}
              >
                {item.book.title}
              </DisplayText>
              <Text
                numberOfLines={1}
                style={{ fontSize: 13, lineHeight: 18, color: colors.onField2 }}
              >
                {[
                  item.book.author,
                  item.book.pages
                    ? t("book.pages", { count: item.book.pages })
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: spacing.lg }}>
      <View style={{ flexDirection: "row", gap: 12, paddingVertical: 18 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={name}
          onPress={openUser}
          hitSlop={6}
        >
          <Avatar user={item.user} />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          {item.type === "book" ? (
            <>
              <Who
                name={name}
                verb={t("friends.finished")}
                when={when}
                onPressName={openUser}
              />
              <Pressable
                accessibilityRole="button"
                onPress={open}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  gap: 12,
                  marginTop: 10,
                }}
              >
                <Cover
                  uri={item.book.coverUrl}
                  title={item.book.title}
                  width={56}
                >
                  <View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 8,
                      alignItems: "center",
                    }}
                  >
                    <Stamp label={t("stamp.finished")} size={11} rotate={-7} />
                  </View>
                </Cover>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <DisplayText
                    variant="listTitle"
                    numberOfLines={2}
                    style={{ color: colors.ink }}
                  >
                    {item.book.title}
                  </DisplayText>
                  <Text
                    numberOfLines={1}
                    style={{ fontSize: 15, lineHeight: 20, color: colors.ink2 }}
                  >
                    {item.book.author}
                  </Text>
                  {item.data.rating ? (
                    <Stars
                      value={item.data.rating}
                      size={13}
                      style={{ marginTop: 6 }}
                      accessibilityLabel={t("friends.rated", {
                        count: item.data.rating,
                      })}
                    />
                  ) : null}
                </View>
              </Pressable>
            </>
          ) : (
            <>
              <Who
                name={name}
                verb={t("friends.reviewed")}
                when={when}
                onPressName={openUser}
              />
              <Pressable accessibilityRole="button" onPress={open}>
                <Text
                  numberOfLines={3}
                  style={{
                    fontSize: 17,
                    lineHeight: 24,
                    letterSpacing: -0.3,
                    color: colors.ink,
                    marginTop: 8,
                  }}
                >
                  {item.data.content}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 14,
                  }}
                >
                  <Cover
                    uri={item.book.coverUrl}
                    title={item.book.title}
                    width={24}
                    flat
                  />
                  <Text
                    numberOfLines={1}
                    style={{ flex: 1, fontSize: 13, color: colors.ink2 }}
                  >
                    <Text style={{ fontWeight: "600", color: colors.ink }}>
                      {item.book.title}
                    </Text>{" "}
                    · {item.book.author}
                  </Text>
                </View>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

function Who({
  name,
  verb,
  when,
  onField,
  onPressName,
}: {
  name: string;
  verb: string;
  when: string;
  onField?: boolean;
  onPressName: () => void;
}) {
  const colors = useColors();
  const ink = onField ? colors.onField : colors.ink;
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
      <Text style={{ flex: 1, fontSize: 15, lineHeight: 20, color: ink }}>
        <Text
          style={{ fontWeight: "600" }}
          onPress={onPressName}
          suppressHighlighting
        >
          {name}
        </Text>{" "}
        {verb}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: onField ? colors.onField2 : colors.ink2,
          paddingLeft: 8,
        }}
      >
        {when}
      </Text>
    </View>
  );
}
