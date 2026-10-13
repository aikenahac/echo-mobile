import { CollectionTile, DisplayText, Hairline, SFIcon } from "@/components/echo";
import { ShelfGridCell, ShelfListRow } from "@/components/library/shelf-rows";
import { useCollection, useDeleteCollection, useUpdateCollection } from "@/hooks/api/collections/use-collections";
import { useLibraryLayout } from "@/hooks/use-library-layout";
import { getErrorMessage, isApiRequestError } from "@/lib/api/errors";
import { collectionColor } from "@/lib/collection-style";
import type { UserBook } from "@/lib/schemas";
import { fixed, spacing, useColors } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";



const WHITE = fixed.onColor;
const WHITE_2 = fixed.onColor2;
/**
 * Collection detail (r6 18): a full-bleed banner in the collection's own colour (never the
 * pink field) with its icon tile, Archivo name, description and "Private · 5 books";
 * a cover image fills the banner behind a scrim. Books in a 3-column grid (or the list).
 */
export default function CollectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const collection = useCollection(id);
  const update = useUpdateCollection();
  const remove = useDeleteCollection();
  const [layout, setLayout] = useLibraryLayout();

  if (collection.isPending) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.paper, justifyContent: "center" }}>
        <ActivityIndicator color={colors.ink2} />
      </View>
    );
  }
  if (collection.isError) {
    const notFound = isApiRequestError(collection.error) && collection.error.statusCode === 404;
    return (
      <View style={{ flex: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: insets.top + 64 }}>
        <Text style={{ fontSize: 17, color: colors.ink }}>{notFound ? t("collections.notFound") : getErrorMessage(collection.error)}</Text>
      </View>
    );
  }

  const c = collection.data;
  const banner = collectionColor(c.colorTag);
  const openBook = (b: UserBook) => router.push({ pathname: "/book/[bookId]", params: { bookId: b.bookId } });
  const gridCell = (width - spacing.lg * 2 - 12 * 2) / 3;

  const confirmDelete = () =>
    Alert.alert(t("collections.deleteTitle", { name: c.name }), t("collections.deleteBody"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("collections.delete"),
        style: "destructive",
        onPress: () => remove.mutate(c.id, { onSuccess: () => router.back(), onError: (e) => Alert.alert(getErrorMessage(e)) }),
      },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={layout === "grid" ? "square.grid.2x2" : "list.bullet"}
          tintColor={WHITE}
          accessibilityLabel={layout === "grid" ? t("collections.showList") : t("collections.showGrid")}
          onPress={() => {
            Haptics.selectionAsync();
            setLayout(layout === "grid" ? "list" : "grid");
          }}
        />
        <Stack.Toolbar.Menu icon="ellipsis" tintColor={WHITE} accessibilityLabel={t("collections.more")}>
          <Stack.Toolbar.MenuAction icon="pencil" onPress={() => router.push({ pathname: "/collection-editor", params: { id: c.id } })}>
            {t("collections.edit")}
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon={c.isPublic ? "lock" : "globe"}
            onPress={() => update.mutate({ id: c.id, isPublic: !c.isPublic }, { onError: (e) => Alert.alert(getErrorMessage(e)) })}
          >
            {c.isPublic ? t("collections.makePrivate") : t("collections.makePublic")}
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction icon="trash" destructive onPress={confirmDelete}>
            {t("collections.delete")}
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}>
        {/* The banner colour continues above the top on overscroll */}
        <View style={{ position: "absolute", top: -1000, left: 0, right: 0, height: 1000, backgroundColor: banner }} />
        <View style={{ backgroundColor: banner, paddingTop: insets.top + 64, paddingHorizontal: spacing.lg, paddingBottom: 24 }}>
          {c.coverImageUrl && (
            <>
              <Image source={{ uri: c.coverImageUrl }} style={{ position: "absolute", inset: 0 }} contentFit="cover" />
              <View
                style={{
                  position: "absolute",
                  inset: 0,
                  experimental_backgroundImage: fixed.photoScrim,
                }}
              />
            </>
          )}
          <CollectionTile colorTag={c.colorTag} iconName={c.iconName} size={52} wash />
          <DisplayText style={{ color: WHITE, marginTop: 16 }} accessibilityRole="header">
            {c.name}
          </DisplayText>
          {!!c.description && <Text style={{ fontSize: 15, lineHeight: 20, color: WHITE_2, marginTop: 8 }}>{c.description}</Text>}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 }}>
            <SFIcon name={c.isPublic ? "globe" : "lock"} size={13} color={WHITE_2} weight="regular" />
            <Text style={{ fontSize: 13, color: WHITE_2 }}>
              {c.isPublic ? t("collections.visibilityPublic") : t("collections.visibilityPrivate")} · {t("collections.booksCount", { count: c.bookCount })}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.lg }}>
          {c.books.length === 0 ? (
            <Text style={{ fontSize: 15, lineHeight: 20, color: colors.ink2, marginTop: 24 }}>{t("collections.emptyBooks")}</Text>
          ) : layout === "grid" ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 12, rowGap: 22, paddingTop: 24 }}>
              {c.books.map((b) => (
                <ShelfGridCell key={b.id} userBook={b} width={gridCell} onPress={() => openBook(b)} />
              ))}
            </View>
          ) : (
            <View style={{ paddingTop: 8 }}>
              {c.books.map((b, i) => (
                <View key={b.id}>
                  {i > 0 && <Hairline />}
                  <ShelfListRow userBook={b} onPress={() => openBook(b)} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
