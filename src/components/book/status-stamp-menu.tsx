import { NativeMenu, SFIcon, Stamp } from "@/components/echo";
import type { ReadingStatus } from "@/lib/schemas";
import { useColors } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

const STATUSES: Array<ReadingStatus> = ["want", "reading", "finished"];
const ICONS = { want: "bookmark", reading: "book", finished: "checkmark.seal" } as const;

type Props = {
  /** null: not in your library — the menu adds it instead */
  status: ReadingStatus | null;
  onChange: (status: ReadingStatus) => void;
};

/**
 * The status as an ink stamp on the cover; tapping it opens the native status menu.
 * A book that isn't in your library gets "Add to library" with the same menu.
 */
export function StatusStampMenu({ status, onChange }: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const items = STATUSES.map((s) => ({
    title: t(`book.status.${s}`),
    systemImage: ICONS[s],
    checked: s === status,
    onPress: () => s !== status && onChange(s),
  }));

  return (
    <NativeMenu
      items={items}
      accessibilityLabel={status ? t("book.statusMenu", { status: t(`book.status.${status}`) }) : t("book.addToLibrary")}
    >
      {status ? (
        <View style={{ padding: 6 }}>
          <Stamp label={t(`stamp.${status}`)} size={22} rotate={-6} trailing={<SFIcon name="chevron.down" size={12} weight="bold" color={colors.ink} />} />
        </View>
      ) : (
        // Drawn, not a Pressable: the native menu owns the tap
        <View
          style={{
            height: 44,
            paddingHorizontal: 16,
            borderRadius: 22,
            backgroundColor: colors.ink,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <SFIcon name="plus" size={15} color={colors.paper} weight="semibold" />
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.paper }}>{t("book.addToLibrary")}</Text>
        </View>
      )}
    </NativeMenu>
  );
}
