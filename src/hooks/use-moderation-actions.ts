import { useBlockUser } from "@/hooks/api/moderation/use-moderation";
import { getErrorMessage } from "@/lib/api/errors";
import type { ReportTargetType } from "@/lib/schemas";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

/** Report (opens the reason sheet) and Block (confirms first) for another reader */
export function useModerationActions() {
  const { t } = useTranslation();
  const router = useRouter();
  const block = useBlockUser();

  /** `userId` is the review's author, so a review report can still offer to block them */
  const report = (type: ReportTargetType, id: string, userId?: string) =>
    router.push({ pathname: "/report/[type]/[id]", params: { type, id, ...(userId ? { userId } : {}) } });

  const confirmBlock = (userId: string, name: string, onBlocked?: () => void) =>
    Alert.alert(t("moderation.blockTitle", { name }), t("moderation.blockBody"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("moderation.block"),
        style: "destructive",
        onPress: () =>
          block.mutate(userId, {
            onSuccess: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onBlocked?.();
            },
            onError: (e) => Alert.alert(getErrorMessage(e)),
          }),
      },
    ]);

  return { report, confirmBlock };
}
