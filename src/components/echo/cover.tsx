import { fixed, fonts, radius, useColors } from "@/lib/theme";
import { Image } from "expo-image";
import type { ReactNode } from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  uri?: string | null;
  /** A bundled image (require(...)) instead of a URL */
  image?: number;
  title: string;
  author?: string;
  /** Width in points; height follows the 2:3 ratio */
  width: number;
  /** Lift the shadow for tiny thumbnails (feed review rows) */
  flat?: boolean;
  /** Overlays such as a Stamp, positioned by the caller */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * A book cover as an object: 2:3, a smaller radius on the spine side, a sheen
 * along the spine, and the one soft shadow in the app. With no image it becomes
 * the designed fallback: tint ground, a 5pt pink-ink spine, the title in Archivo.
 */
export function Cover({ uri, image, title, author, width, flat, children, style }: Props) {
  const colors = useColors();
  const height = Math.round((width * 3) / 2);
  const corners = {
    borderTopLeftRadius: radius.coverSpine,
    borderBottomLeftRadius: radius.coverSpine,
    borderTopRightRadius: radius.cover,
    borderBottomRightRadius: radius.cover,
  };

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={author ? `${title}, ${author}` : title}
      style={[{ width, height }, corners, { boxShadow: flat ? fixed.thumbShadow : colors.coverShadow }, style]}
    >
      <View style={[{ flex: 1, overflow: "hidden" }, corners]}>
        {uri || image ? (
          <>
            <Image source={image ?? { uri: uri! }} style={{ flex: 1 }} contentFit="cover" transition={150} recyclingKey={uri ?? undefined} />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                inset: 0,
                experimental_backgroundImage: fixed.coverSheen,
              }}
            />
          </>
        ) : (
          <Fallback title={title} author={author} width={width} />
        )}
      </View>
      {children}
    </View>
  );
}

function Fallback({ title, author, width }: { title: string; author?: string; width: number }) {
  const colors = useColors();
  const titleSize = Math.min(28, Math.max(9, Math.round(width * 0.17)));
  const showAuthor = !!author && width >= 56;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.tint,
        borderLeftWidth: width < 40 ? 3 : 5,
        borderLeftColor: colors.pinkInk,
        paddingVertical: Math.max(4, width * 0.06),
        paddingHorizontal: Math.max(3, width * 0.05),
        justifyContent: "space-between",
      }}
    >
      <Text
        allowFontScaling={false}
        numberOfLines={5}
        style={{ fontFamily: fonts.display, fontSize: titleSize, lineHeight: titleSize * 0.98, letterSpacing: -0.2, color: colors.ink }}
      >
        {title}
      </Text>
      {showAuthor && (
        <Text allowFontScaling={false} numberOfLines={2} style={{ fontSize: Math.max(8, Math.round(width * 0.08)), fontWeight: "600", color: colors.ink }}>
          {author}
        </Text>
      )}
    </View>
  );
}
