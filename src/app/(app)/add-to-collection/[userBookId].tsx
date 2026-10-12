import { CircleButton, CollectionTile, DisplayText, Hairline, SFIcon } from "@/components/echo";
import { useCollections, useToggleCollectionBook } from "@/hooks/api/collections/use-collections";
import { useLibrary } from "@/hooks/api/library/use-library";
import { isPaywallError } from "@/hooks/use-premium-gate";
import { getErrorMessage } from "@/lib/api/errors";
import { findUserBook } from "@/lib/library-cache";
import { spacing, useColors } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";

/**
 * Add to collection (r6 06): the book's collections with their colour + icon tile,
 * a tick for membership (tap to add or remove), and New collection.
 */
export default function AddToCollectionSheet() {
  const { userBookId } = useLocalSearchParams<{ userBookId: string }>();
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const library = useLibrary();
  const collections = useCollections();
  const toggle = useToggleCollectionBook();

  const userBook = findUserBook(library.data, userBookId);

  return (
    <ScrollView bounces={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: 28, paddingBottom: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <DisplayText variant="sectionHead" style={{ color: colors.ink }} accessibilityRole="header">
          {t("collections.addTitle")}
        </DisplayText>
        <CircleButton icon="checkmark" accessibilityLabel={t("collections.done")} onPress={() => router.back()} style={{ backgroundColor: colors.tint, boxShadow: "none" }} />
      </View>
      {userBook && (
        <Text style={{ fontSize: 15, color: colors.ink2, marginTop: 4 }}>{t("collections.addSubtitle", { title: userBook.book.title })}</Text>
      )}

      <View style={{ marginTop: 12 }}>
        {collections.isPending && <ActivityIndicator color={colors.ink2} style={{ margin: 24 }} />}
        {collections.data?.map((c, i) => {
          const checked = c.books.some((b) => b.id === userBookId);
          return (
            <View key={c.id}>
              {i > 0 && <Hairline />}
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                accessibilityLabel={c.name}
                disabled={!userBook}
                onPress={() => {
                  if (!userBook) return;
                  Haptics.selectionAsync();
                  toggle.mutate(
                    { collectionId: c.id, userBook, add: !checked },
                    {
                      onError: (e) => (isPaywallError(e) ? router.replace("/premium") : Alert.alert(getErrorMessage(e))),
                    },
                  );
                }}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 13, opacity: pressed ? 0.7 : 1 })}
              >
                <CollectionTile colorTag={c.colorTag} iconName={c.iconName} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontSize: 17, fontWeight: "600", letterSpacing: -0.4, color: colors.ink }}>
                    {c.name}
                  </Text>
                  <Text style={{ fontSize: 13, lineHeight: 18, color: colors.ink2 }}>
                    {t("library.collectionMeta", { count: c.bookCount, visibility: c.isPublic ? t("library.public") : t("library.private") })}
                  </Text>
                </View>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    borderWidth: 1.5,
                    borderColor: checked ? colors.ink : colors.ink3,
                    backgroundColor: checked ? colors.ink : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {checked && <SFIcon name="checkmark" size={12} color={colors.paper} weight="bold" />}
                </View>
              </Pressable>
            </View>
          );
        })}
        {(collections.data?.length ?? 0) > 0 && <Hairline />}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: "/collection-editor", params: { addUserBookId: userBookId } })}
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 13, opacity: pressed ? 0.7 : 1 })}
        >
          <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: colors.tint, alignItems: "center", justifyContent: "center" }}>
            <SFIcon name="plus" size={18} />
          </View>
          <Text style={{ fontSize: 17, fontWeight: "600", letterSpacing: -0.4, color: colors.ink }}>{t("collections.new")}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
