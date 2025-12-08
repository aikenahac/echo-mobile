import { BookOpenIcon } from "@/lib/icons";
import { SearchResult } from "@/lib/types";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { Badge } from "./ui/badge";
import { Text } from "./ui/text";

type Props = {
  result: SearchResult;
  onLongPress: () => void;
  viewMode?: "list" | "grid";
};

export function SearchResultItem({
  result,
  onLongPress,
  viewMode = "list",
}: Props) {
  const { t } = useTranslation();

  const handleLongPress = () => {
    Haptics.selectionAsync();
    onLongPress();
  };

  const isGrid = viewMode === "grid";

  return (
    <TouchableOpacity
      onLongPress={handleLongPress}
      className={`rounded-lg bg-card border border-border ${isGrid ? "p-2" : "p-3"}`}
    >
      <View className={`${isGrid ? "flex-col" : "flex-row"} gap-3`}>
        {result.coverUrl ? (
          <Image
            source={result.coverUrl}
            className="rounded-md"
            style={{
              height: isGrid ? 120 : 100,
              width: isGrid ? "100%" : 80,
            }}
            contentFit="cover"
          />
        ) : (
          <View
            className="bg-muted rounded-md flex items-center justify-center"
            style={{
              height: isGrid ? 120 : 100,
              width: isGrid ? "100%" : 80,
            }}
          >
            <BookOpenIcon size={24} className="text-muted-foreground" />
          </View>
        )}

        <View className={`flex flex-col ${isGrid ? "w-full" : "flex-1"} gap-1`}>
          <Text
            className="font-bold text-sm"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {result.title}
          </Text>
          <Text className="text-muted-foreground text-xs" numberOfLines={1}>
            {result.author}
          </Text>

          <View className="flex flex-row items-center gap-2 mt-1">
            {result.publishedYear && (
              <Text className="text-muted-foreground text-xs">
                {result.publishedYear}
              </Text>
            )}
            <Badge
              variant={result.source === "internal" ? "default" : "secondary"}
              className="self-start"
            >
              <Text className="text-xs">
                {t(`search.source.${result.source}`)}
              </Text>
            </Badge>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
