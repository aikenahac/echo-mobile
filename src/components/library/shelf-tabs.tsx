import type { Shelf } from "@/lib/library-cache";
import { useColors } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";

const SHELVES: Array<Shelf> = ["reading", "want", "finished", "favourites"];

type Props = {
  active: Shelf;
  counts: Record<Shelf, number>;
  onChange: (shelf: Shelf) => void;
  /** Printed on the pink field (Reading) or on paper (the other shelves) */
  onField: boolean;
};

/** Reading · Want · Finished · Favourites, with counts; the shelf switch under the title */
export function ShelfTabs({ active, counts, onChange, onField }: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const on = onField ? colors.onField : colors.ink;
  const off = onField ? colors.onField2 : colors.ink2;

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: onField ? colors.onFieldRule : colors.rule, marginTop: 10 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 18 }}>
        <View accessibilityRole="tablist" style={{ flexDirection: "row", gap: 18 }}>
          {SHELVES.map((shelf) => {
            const selected = shelf === active;
            return (
              <Pressable
                key={shelf}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => {
                  if (selected) return;
                  Haptics.selectionAsync();
                  onChange(shelf);
                }}
                style={{ paddingTop: 10, paddingBottom: 11, borderBottomWidth: 2, borderBottomColor: selected ? on : "transparent", marginBottom: -1 }}
              >
                <Text style={{ fontSize: 15, color: selected ? on : off, fontWeight: selected ? "600" : "400" }}>
                  {t(`library.shelves.${shelf}`)}
                  <Text style={{ fontSize: 13, fontVariant: ["tabular-nums"] }}> {counts[shelf]}</Text>
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
