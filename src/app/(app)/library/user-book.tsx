import { BookMetadataCard } from "@/components/book-metadata-card";
import { ReviewDrawer } from "@/components/review-drawer";
import { ReviewItem } from "@/components/review-item";
import { StarRating } from "@/components/star-rating";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useGetUserBook } from "@/hooks/api/library/use-get-my-book";
import { useRateBook } from "@/hooks/api/library/use-rate-book";
import { useDeleteReview } from "@/hooks/api/reviews/use-delete-review";
import { useGetBookReviews } from "@/hooks/api/reviews/use-get-book-reviews";
import { useProfile } from "@/hooks/api/user/use-get-me";
import { useUserBookParams } from "@/hooks/use-typed-search-params";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserBookScreen() {
  const { t } = useTranslation();
  const { userBookId } = useUserBookParams();
  const { data: userBook, isLoading, error, refetch } = useGetUserBook(userBookId);
  const { data: profile } = useProfile();

  // Reviews
  const {
    data: reviews,
    isLoading: reviewsLoading,
    refetch: refetchReviews,
  } = useGetBookReviews(userBook?.book.id || "");

  // Rating state with debounce
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const rateBookMutation = useRateBook(userBookId);

  // Review deletion state
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const deleteMutation = useDeleteReview(
    reviewToDelete || "",
    userBook?.book.id || ""
  );

  // Update selected rating when userBook loads
  useEffect(() => {
    if (userBook?.rating) {
      setSelectedRating(userBook.rating);
    }
  }, [userBook]);

  // Debounced rating submission
  useEffect(() => {
    if (selectedRating === null || selectedRating === userBook?.rating) {
      return;
    }

    const timeout = setTimeout(() => {
      rateBookMutation.mutate(selectedRating);
    }, 300);

    return () => clearTimeout(timeout);
  }, [selectedRating, userBook?.rating, rateBookMutation]);

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      await deleteMutation.mutateAsync();
      setReviewToDelete(null);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  // Find user's own review
  const userReview = reviews?.find((review) => review.userId === profile?.id);

  // Filter out user's own review from public reviews
  const publicReviews = reviews?.filter(
    (review) => review.userId !== profile?.id && !review.isPrivate
  );

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchReviews()]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]} className="bg-background px-6 py-4">
        <View className="gap-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !userBook) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]} className="bg-background px-6 py-4 flex items-center justify-center">
        <Text className="text-destructive">
          {t("common.error", "Error loading book")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]} className="bg-background px-6 py-4">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-6"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Book Header */}
        <View className="flex flex-row gap-4">
          {userBook.book.coverUrl ? (
            <Image
              source={userBook.book.coverUrl}
              className="rounded-lg shadow-md"
              style={{
                width: 120,
                height: 180,
              }}
              contentFit="cover"
            />
          ) : (
            <View className="w-[120px] h-[180px] bg-muted rounded-lg flex items-center justify-center">
              <Text className="text-muted-foreground">No Cover</Text>
            </View>
          )}
          <View className="flex-1 justify-center gap-2">
            <Text className="text-2xl font-bold font-heading">
              {userBook.book.title}
            </Text>
            <Text className="text-lg text-muted-foreground">
              {userBook.book.author}
            </Text>
            <Badge variant={userBook.status === "reading" ? "default" : "outline"}>
              <Text>
                {t(`bookDetail.status.${userBook.status}`, userBook.status)}
              </Text>
            </Badge>
          </View>
        </View>

        {/* Metadata Card */}
        <BookMetadataCard userBook={userBook} />

        <Separator />

        {/* Rating Section */}
        <View className="gap-3">
          <Text className="text-lg font-semibold">
            {t("bookDetail.rateThisBook")}
          </Text>
          <StarRating
            rating={selectedRating || 0}
            onRatingChange={handleRatingChange}
            size="lg"
          />
          {selectedRating ? (
            <Text className="text-sm text-muted-foreground">
              {t("bookDetail.yourRating", { rating: selectedRating })}
            </Text>
          ) : (
            <Text className="text-sm text-muted-foreground">
              {t("bookDetail.noRating")}
            </Text>
          )}
        </View>

        <Separator />

        {/* Review Drawer */}
        <View className="gap-3">
          <Text className="text-lg font-semibold">
            {userReview ? t("bookDetail.yourReview") : t("bookDetail.addReview")}
          </Text>
          <ReviewDrawer
            bookId={userBook.book.id}
            existingReview={userReview}
            onSuccess={() => {
              refetchReviews();
            }}
          />
        </View>

        <Separator />

        {/* Public Reviews */}
        <View className="gap-4">
          <Text className="text-xl font-semibold">{t("bookDetail.reviews")}</Text>

          {reviewsLoading ? (
            <View className="gap-3">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </View>
          ) : publicReviews && publicReviews.length > 0 ? (
            publicReviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                isOwnReview={review.userId === profile?.id}
                onDelete={() => setReviewToDelete(review.id)}
              />
            ))
          ) : (
            <View className="py-8 flex items-center">
              <Text className="text-muted-foreground text-center">
                {t("bookDetail.noReviews")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!reviewToDelete}
        onOpenChange={(open) => !open && setReviewToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("bookDetail.deleteReview")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("bookDetail.confirmDelete")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>{t("bookDetail.cancel")}</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleDeleteReview}>
              <Text>{t("bookDetail.deleteReview")}</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
}
