import { StarIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Pressable, View } from "react-native";

type StarRatingProps = {
  rating: number; // 0-5
  onRatingChange?: (rating: number) => void;
  size?: "sm" | "default" | "lg";
  className?: string;
};

const SIZE_MAP = {
  sm: 16,
  default: 24,
  lg: 32,
};

export function StarRating({
  rating,
  onRatingChange,
  size = "default",
  className,
}: StarRatingProps) {
  const sizeInPixels = SIZE_MAP[size];
  const interactive = !!onRatingChange;

  const handleStarPress = (starIndex: number) => {
    if (!interactive) return;
    onRatingChange(starIndex + 1);
  };

  return (
    <View className={cn("flex flex-row items-center gap-1", className)}>
      {[0, 1, 2, 3, 4].map((starIndex) => {
        const isFilled = starIndex < rating;
        const StarWrapper = interactive ? Pressable : View;

        return (
          <StarWrapper
            key={starIndex}
            onPress={() => handleStarPress(starIndex)}
            className={interactive ? "active:scale-90" : ""}
          >
            <StarIcon
              size={sizeInPixels}
              className={
                isFilled
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300 dark:text-gray-600"
              }
            />
          </StarWrapper>
        );
      })}
    </View>
  );
}
