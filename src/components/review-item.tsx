import { ReviewWithUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { View } from "react-native";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Text } from "./ui/text";

type ReviewItemProps = {
  review: ReviewWithUser;
  isOwnReview: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
};

export function ReviewItem({
  review,
  isOwnReview,
  onEdit,
  onDelete,
  className,
}: ReviewItemProps) {
  const reviewDate = typeof review.createdAt === "string"
    ? new Date(review.createdAt)
    : review.createdAt;

  const formattedDate = format(reviewDate, "MMM d, yyyy");

  return (
    <Card className={cn("mb-3", className)}>
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <Avatar alt={review.user.username || "User"} className="h-10 w-10">
          <AvatarFallback>
            <Text className="text-sm">
              {review.user.username?.charAt(0).toUpperCase() || "U"}
            </Text>
          </AvatarFallback>
        </Avatar>
        <View className="flex-1">
          <Text className="font-semibold">
            {review.user.username || "Anonymous"}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {formattedDate}
          </Text>
        </View>
      </CardHeader>
      <CardContent className="pt-0">
        <Text className="leading-relaxed">{review.content}</Text>
      </CardContent>
      {isOwnReview && (onEdit || onDelete) && (
        <CardFooter className="flex flex-row gap-2 pt-0">
          {onEdit && (
            <Button variant="ghost" size="sm" onPress={onEdit}>
              <Text>Edit</Text>
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive-outline" size="sm" onPress={onDelete}>
              <Text>Delete</Text>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
