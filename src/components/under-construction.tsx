import { Construction } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "./ui/text";

type Props = {
  title?: string;
  message?: string;
};

export function UnderConstruction({
  title = "Under Construction",
  message = "This feature is coming soon!"
}: Props) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Construction size={64} className="text-muted-foreground mb-4" />
      <Text className="text-2xl font-bold mb-2 text-center">{title}</Text>
      <Text className="text-muted-foreground text-center">{message}</Text>
    </View>
  );
}
