import { initialOf } from "@/lib/books";
import type { PublicUser } from "@/lib/schemas";
import { fonts, useColors } from "@/lib/theme";
import { Image } from "expo-image";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  user: Pick<PublicUser, "displayName" | "username" | "profilePictureUrl"> & Partial<Pick<PublicUser, "profilePictureBlurhash">> & { email?: string };
  /** Tile size: 36 in rows, 44 in reader rows, 64 on the profile, 96 in edit */
  size?: number;
  /** Tile ground; on the field the tile is a lighter wash */
  background?: string;
  style?: StyleProp<ViewStyle>;
};

/** A square tile with the photo, or the Archivo initial on tint */
export function Avatar({ user, size = 36, background, style }: Props) {
  const colors = useColors();
  const corner = size >= 64 ? 6 : 4;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width: size,
          height: size,
          borderRadius: corner,
          borderCurve: "continuous",
          backgroundColor: background ?? colors.tint,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        },
        style,
      ]}
    >
      {user.profilePictureUrl ? (
        <Image
          source={{ uri: user.profilePictureUrl }}
          placeholder={user.profilePictureBlurhash ? { blurhash: user.profilePictureBlurhash } : undefined}
          transition={200}
          style={{ width: size, height: size }}
          contentFit="cover"
        />
      ) : (
        <Text style={{ fontFamily: fonts.displayXB, fontSize: Math.round(size * 0.44), color: colors.ink }} allowFontScaling={false}>
          {initialOf(user)}
        </Text>
      )}
    </View>
  );
}
