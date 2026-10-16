import { CircleButton, DisplayText } from "@/components/echo";
import { useColors } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

type Props = {
  onField: boolean;
  /** Current layout of the paper shelves; the button shows the glyph of the active one */
  view: "grid" | "list";
  onToggleView: () => void;
};

/** "Library" in Archivo 44 with the grid/list toggle */
export function LibraryHeader({ onField, view, onToggleView }: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  return (
    <View style={{ minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <DisplayText style={{ flexShrink: 1, color: onField ? colors.onField : colors.ink }}>{t("library.title")}</DisplayText>
      <CircleButton
        icon={view === "grid" ? "square.grid.2x2" : "list.bullet"}
        accessibilityLabel={view === "grid" ? t("library.showList") : t("library.showGrid")}
        onPress={onToggleView}
        onField={onField}
      />
    </View>
  );
}
