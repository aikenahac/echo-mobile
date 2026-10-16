import { CapsuleButton, DisplayText, Hairline, SFIcon, TextField } from "@/components/echo";
import { useBlockUser, useReport } from "@/hooks/api/moderation/use-moderation";
import { getErrorMessage } from "@/lib/api/errors";
import { REPORT_REASONS, ReportTargetTypeSchema, type ReportReason } from "@/lib/schemas";
import { spacing, useColors } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

/**
 * Report a reader or a review: pick a reason, add details if you like. After reporting a
 * reader (or a review's author) you're offered to block them too.
 */
export default function ReportSheet() {
  const { type, id, userId } = useLocalSearchParams<{ type: string; id: string; userId?: string }>();
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const report = useReport();
  const block = useBlockUser();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");

  const targetType = ReportTargetTypeSchema.safeParse(type);
  const blockId = userId ?? (type === "user" ? id : undefined);

  const submit = () => {
    if (!reason || !targetType.success) return;
    report.mutate(
      { targetType: targetType.data, targetId: id, reason, details: details.trim() || undefined },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          const done = { text: t("moderation.done"), onPress: () => router.back() };
          Alert.alert(
            t("moderation.reportedTitle"),
            t("moderation.reportedBody"),
            blockId
              ? [
                  done,
                  {
                    text: t("moderation.block"),
                    style: "destructive",
                    onPress: () =>
                      block.mutate(blockId, { onSuccess: () => router.back(), onError: (e) => Alert.alert(getErrorMessage(e)) }),
                  },
                ]
              : [done],
          );
        },
        onError: (e) => Alert.alert(getErrorMessage(e)),
      },
    );
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: 28, paddingBottom: 32 }}>
      <DisplayText variant="sectionHead" style={{ color: colors.ink }} accessibilityRole="header">
        {type === "review" ? t("moderation.reportReview") : t("moderation.reportUser")}
      </DisplayText>
      <Text style={{ fontSize: 15, color: colors.ink2, marginTop: 4 }}>{t("moderation.reportBody")}</Text>

      <View style={{ marginTop: 12 }}>
        {REPORT_REASONS.map((value, i) => {
          const checked = reason === value;
          return (
            <View key={value}>
              {i > 0 && <Hairline />}
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked }}
                onPress={() => {
                  Haptics.selectionAsync();
                  setReason(value);
                }}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, opacity: pressed ? 0.7 : 1 })}
              >
                <Text style={{ flex: 1, fontSize: 17, letterSpacing: -0.4, color: colors.ink }}>{t(`moderation.reasons.${value}`)}</Text>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    borderWidth: 1.5,
                    borderColor: checked ? colors.ink : colors.ink3,
                    backgroundColor: checked ? colors.ink : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {checked && <SFIcon name="checkmark" size={12} color={colors.paper} weight="bold" />}
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>

      <TextField
        label={t("moderation.details")}
        placeholder={t("moderation.detailsPlaceholder")}
        value={details}
        onChangeText={setDetails}
        multiline
        maxLength={500}
        containerStyle={{ marginTop: 16 }}
        style={{ minHeight: 88 }}
      />

      <CapsuleButton
        title={t("moderation.submit")}
        disabled={!reason || !targetType.success}
        loading={report.isPending}
        onPress={submit}
        style={{ marginTop: 20 }}
      />
    </ScrollView>
  );
}
