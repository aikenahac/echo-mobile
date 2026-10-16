import { NativeMenu, SFIcon } from "@/components/echo";
import { useModerationActions } from "@/hooks/use-moderation-actions";
import { useColors } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

/**
 * ⋯ on another reader's review (or the reader themselves): Report review, Report user, Block.
 * Pass `reviewId` when the menu sits on a review.
 */
export function ModerationMenu({ userId, name, reviewId, onField }: { userId: string; name: string; reviewId?: string; onField?: boolean }) {
  const colors = useColors();
  const { t } = useTranslation();
  const { report, confirmBlock } = useModerationActions();

  const reportItems = [
    ...(reviewId ? [{ title: t("moderation.reportReview"), systemImage: "flag" as const, onPress: () => report("review", reviewId, userId) }] : []),
    { title: t("moderation.reportUser"), systemImage: "flag" as const, onPress: () => report("user", userId) },
  ];

  return (
    <NativeMenu
      accessibilityLabel={t("moderation.moreFor", { name })}
      items={[reportItems, [{ title: t("moderation.block"), systemImage: "hand.raised", destructive: true, onPress: () => confirmBlock(userId, name) }]]}
    >
      {/* Drawn, not a Pressable: the native menu owns the tap */}
      <View style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
        <SFIcon name="ellipsis" size={16} weight="semibold" color={onField ? colors.onField2 : colors.ink2} />
      </View>
    </NativeMenu>
  );
}
