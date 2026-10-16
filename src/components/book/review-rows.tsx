import { AdminBadge, Avatar, DisplayText, Hairline } from "@/components/echo";
import { displayName, isAdmin } from "@/lib/books";
import { shortDate } from "@/lib/dates";
import type { Review, ReviewWithUser } from "@/lib/schemas";
import { useColors } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

/** "Your review" with its visibility and date, and Edit (or the empty prompt with Write) */
export function YourReview({ review, onEdit }: { review: Review | null; onEdit: () => void }) {
  const colors = useColors();
  const { t } = useTranslation();
  return (
    <View style={{ paddingTop: 32, paddingBottom: 28 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <DisplayText variant="sectionHead" style={{ color: colors.ink }} accessibilityRole="header">
          {t("book.yourReview")}
        </DisplayText>
        <Pressable accessibilityRole="button" hitSlop={10} onPress={onEdit}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.pinkInk }}>{review ? t("book.edit") : t("book.write")}</Text>
        </Pressable>
      </View>
      {review ? (
        <>
          <Text style={{ fontSize: 13, color: colors.ink2, marginTop: 4 }}>
            {review.isPrivate ? t("book.private") : t("book.public")} · {shortDate(review.updatedAt)}
          </Text>
          <Text style={{ fontSize: 17, lineHeight: 24, letterSpacing: -0.3, color: colors.ink, marginTop: 10 }}>{review.content}</Text>
        </>
      ) : (
        <Text style={{ fontSize: 15, lineHeight: 20, color: colors.ink2, marginTop: 8 }}>{t("book.noReview")}</Text>
      )}
    </View>
  );
}

/** Public reviews by people you follow, newest first */
export function FollowingReviews({ reviews }: { reviews: Array<ReviewWithUser> }) {
  const colors = useColors();
  const { t } = useTranslation();
  if (!reviews.length) return null;
  return (
    <View style={{ paddingTop: 32 }}>
      <DisplayText variant="sectionHead" style={{ color: colors.ink, marginBottom: 6 }} accessibilityRole="header">
        {t("book.fromFollowing")}
      </DisplayText>
      {reviews.map((r, i) => (
        <View key={r.id}>
          {i > 0 && <Hairline />}
          <View style={{ flexDirection: "row", gap: 12, paddingVertical: 14 }}>
            <Avatar user={r.user} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 15, color: colors.ink2 }}>
                <Text style={{ fontWeight: "600", color: colors.ink }}>{displayName(r.user)}</Text>
                {isAdmin(r.user) && <>{" "}<AdminBadge /></>} · {shortDate(r.createdAt)}
              </Text>
              <Text style={{ fontSize: 15, lineHeight: 21, color: colors.ink, marginTop: 3 }}>{r.content}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
