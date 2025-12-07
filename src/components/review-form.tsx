import { useCreateReview } from "@/hooks/api/reviews/use-create-review";
import { useUpdateReview } from "@/hooks/api/reviews/use-update-review";
import { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Text } from "./ui/text";
import { Textarea } from "./ui/textarea";

type ReviewFormProps = {
  bookId: string;
  existingReview?: Review | null;
  onSuccess?: () => void;
  className?: string;
};

const MAX_LENGTH = 5000;

export function ReviewForm({
  bookId,
  existingReview,
  onSuccess,
  className,
}: ReviewFormProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState(existingReview?.content || "");
  const [isPrivate, setIsPrivate] = useState(existingReview?.isPrivate || false);

  const isEditing = !!existingReview;

  const createMutation = useCreateReview(bookId);
  const updateMutation = useUpdateReview(
    existingReview?.id || "",
    bookId
  );

  useEffect(() => {
    if (existingReview) {
      setContent(existingReview.content);
      setIsPrivate(existingReview.isPrivate);
    }
  }, [existingReview]);

  const handleSubmit = async () => {
    if (content.trim().length === 0 || content.length > MAX_LENGTH) {
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ content, isPrivate });
      } else {
        await createMutation.mutateAsync({ content, isPrivate });
      }

      if (!isEditing) {
        // Clear form only if creating new review
        setContent("");
        setIsPrivate(false);
      }

      onSuccess?.();
    } catch (error) {
      // Error handling is managed by React Query
      console.error("Review submission error:", error);
    }
  };

  const handleCancel = () => {
    if (existingReview) {
      setContent(existingReview.content);
      setIsPrivate(existingReview.isPrivate);
    }
    onSuccess?.();
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isValid = content.trim().length > 0 && content.length <= MAX_LENGTH;

  return (
    <View className={cn("p-4 gap-4", className)}>
      <View className="gap-2">
        <Label nativeID="review-content">
          {t("bookDetail.reviewPlaceholder")}
        </Label>
        <Textarea
          aria-labelledby="review-content"
          value={content}
          onChangeText={setContent}
          placeholder={t("bookDetail.reviewPlaceholder")}
          className="min-h-[100px]"
          maxLength={MAX_LENGTH}
        />
        <Text className="text-sm text-muted-foreground text-right">
          {t("bookDetail.characterCount", {
            count: content.length,
            max: MAX_LENGTH,
          })}
        </Text>
      </View>
      <View className="flex flex-row items-center gap-2">
        <Switch
          checked={isPrivate}
          onCheckedChange={setIsPrivate}
          nativeID="review-privacy"
        />
        <Label nativeID="review-privacy" onPress={() => setIsPrivate(!isPrivate)}>
          {isPrivate
            ? t("bookDetail.privateReview")
            : t("bookDetail.publicReview")}
        </Label>
      </View>
      <View className="flex flex-row gap-2">
        {isEditing && (
          <Button variant="outline" onPress={handleCancel} disabled={isSubmitting}>
            <Text>{t("bookDetail.cancel")}</Text>
          </Button>
        )}
        <Button
          onPress={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="flex-1"
        >
          <Text>
            {isEditing
              ? t("bookDetail.updateReview")
              : t("bookDetail.submitReview")}
          </Text>
        </Button>
      </View>
    </View>
  );
}
