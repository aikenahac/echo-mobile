import { DisplayText } from "@/components/echo";
import { spacing } from "@/lib/theme";
import { ScrollView, Text } from "react-native";

/** Temporary tab content until the screen's phase is built */
export function PlaceholderScreen({ title, note }: { title: string; note?: string }) {
  return (
    <ScrollView className="flex-1 bg-paper" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.lg }}>
      <DisplayText className="text-ink">{title}</DisplayText>
      {note && <Text className="text-ink-2 mt-3 text-[15px]">{note}</Text>}
    </ScrollView>
  );
}
