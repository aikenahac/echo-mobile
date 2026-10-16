import { CollectionTile } from "@/components/echo";
import type { Collection } from "@/lib/schemas";
import { useColors } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

/** Colour + icon tile, name, "4 books · public" */
export function CollectionRow({ collection, onPress }: { collection: Collection; onPress?: () => void }) {
  const colors = useColors();
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 13, opacity: pressed ? 0.7 : 1 })}
    >
      <CollectionTile colorTag={collection.colorTag} iconName={collection.iconName} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 17, fontWeight: "600", letterSpacing: -0.4, color: colors.ink }}>
          {collection.name}
        </Text>
        <Text style={{ fontSize: 13, lineHeight: 18, color: colors.ink2 }}>
          {t("library.collectionMeta", {
            count: collection.bookCount,
            visibility: collection.isPublic ? t("library.public") : t("library.private"),
          })}
        </Text>
      </View>
    </Pressable>
  );
}
