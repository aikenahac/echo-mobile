import { Avatar, CapsuleButton } from "@/components/echo";
import type { Reader } from "@/lib/schemas";
import { useColors } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

/**
 * A reader (r6 21): square tile, name, @username, a 2-line bio, and Follow (ink) /
 * Following (outline). Rows aren't tappable until public profiles exist.
 */
export function ReaderRow({ reader, onToggle }: { reader: Reader; onToggle: () => void }) {
  const colors = useColors();
  const { t } = useTranslation();
  const name = reader.displayName || reader.username || "";
  const handle = reader.displayName && reader.username ? `@${reader.username}` : null;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 }}>
      <Avatar user={reader} size={44} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 17, fontWeight: "600", letterSpacing: -0.4, color: colors.ink }}>
          {name}
        </Text>
        {handle && <Text style={{ fontSize: 13, lineHeight: 18, color: colors.ink2 }}>{handle}</Text>}
        {!!reader.bio && (
          <Text numberOfLines={2} style={{ fontSize: 13, lineHeight: 18, color: colors.ink2, marginTop: 2 }}>
            {reader.bio}
          </Text>
        )}
      </View>
      <CapsuleButton
        title={reader.isFollowing ? t("search.following") : t("search.follow")}
        variant={reader.isFollowing ? "quiet" : "primary"}
        size="sm"
        accessibilityLabel={reader.isFollowing ? t("search.unfollowName", { name }) : t("search.followName", { name })}
        onPress={onToggle}
        style={{ minHeight: 34, paddingHorizontal: 14 }}
      />
    </View>
  );
}
