import { collectionColor, lucideExportName } from "@/lib/collection-style";
import type { LucideIcon } from "lucide-react-native";
import * as icons from "lucide-react-native/icons";
import { View, type StyleProp, type ViewStyle } from "react-native";

const ICONS = icons as unknown as Record<string, LucideIcon | undefined>;

type Props = {
  colorTag: string | null;
  iconName: string | null;
  /** 40 in rows, 44 in the editor, 52 in the collection banner */
  size?: number;
  /** A translucent wash instead of the colour (on the collection's own banner) */
  wash?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** The collection's colour tile with its user-chosen Lucide icon (user data, so not an SF Symbol) */
export function CollectionTile({ colorTag, iconName, size = 40, wash, style }: Props) {
  const Icon = ICONS[lucideExportName(iconName)] ?? ICONS.Book!;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width: size,
          height: size,
          borderRadius: size * 0.2,
          borderCurve: "continuous",
          backgroundColor: wash ? "rgba(255,255,255,0.16)" : collectionColor(colorTag),
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Icon size={size * 0.5} color="#FFFFFF" strokeWidth={1.8} />
    </View>
  );
}
