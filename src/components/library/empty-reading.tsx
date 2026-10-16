import { CapsuleButton, DisplayText, SFIcon } from "@/components/echo";
import { useColors } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { Pressable, Text, useWindowDimensions, View } from "react-native";

/** Nothing being read (r6 16): a dashed empty cover slot, the question, and Find a book */
export function EmptyReading({ onFindBook }: { onFindBook: () => void }) {
  const colors = useColors();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 20, marginTop: 24 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("library.empty.findBook")}
          onPress={onFindBook}
          style={{
            width: 120,
            aspectRatio: 2 / 3,
            borderWidth: 2,
            borderStyle: "dashed",
            borderColor: colors.onField2,
            borderRadius: 3,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SFIcon name="plus" size={20} color={colors.onField} weight="regular" />
        </Pressable>
        <DisplayText style={{ flex: 1, color: colors.onField, lineHeight: 42, fontSize: width < 380 ? 38 : 44 }}>
          {t("library.empty.title")}
        </DisplayText>
      </View>
      <Text style={{ fontSize: 17, lineHeight: 23, letterSpacing: -0.3, color: colors.onField2, marginTop: 20 }}>
        {t("library.empty.body")}
      </Text>
      <CapsuleButton icon="magnifyingglass" title={t("library.empty.findBook")} variant="field" onPress={onFindBook} style={{ marginTop: 24 }} />
    </View>
  );
}

/** The paper note under the empty hero, pointing at Find readers */
export function FindReadersNote({ onFindReaders }: { onFindReaders: () => void }) {
  const colors = useColors();
  const { t } = useTranslation();
  return (
    <View>
      <Text style={{ fontSize: 13, fontWeight: "600", color: colors.ink2 }}>{t("library.empty.friendsLabel")}</Text>
      <Text style={{ fontSize: 17, lineHeight: 23, letterSpacing: -0.3, color: colors.ink, marginTop: 6 }}>
        {t("library.empty.friendsBody")}
      </Text>
      <Pressable accessibilityRole="link" onPress={onFindReaders} hitSlop={8} style={{ marginTop: 10, alignSelf: "flex-start" }}>
        <Text style={{ fontSize: 17, fontWeight: "600", color: colors.pinkInk }}>{t("library.empty.findReaders")}</Text>
      </Pressable>
    </View>
  );
}
