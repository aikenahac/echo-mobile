import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Card, CardContent } from "./ui/card";
import { Text } from "./ui/text";

type Props = {
  booksThisYear: number;
  totalPages: number;
  currentStreak: number;
};

export function ProfileStats({ booksThisYear, totalPages, currentStreak }: Props) {
  const { t } = useTranslation();

  const stats = [
    {
      label: t("profile.stats.booksThisYear"),
      value: booksThisYear,
    },
    {
      label: t("profile.stats.pagesRead"),
      value: totalPages.toLocaleString(),
    },
    {
      label: t("profile.stats.dayStreak"),
      value: currentStreak,
    },
  ];

  return (
    <View className="flex-row gap-2">
      {stats.map((stat, index) => (
        <Card key={index} className="flex-1">
          <CardContent className="items-center justify-center py-4">
            <Text className="text-4xl font-bold text-primary">{stat.value}</Text>
            <Text className="text-sm text-muted-foreground text-center mt-1">
              {stat.label}
            </Text>
          </CardContent>
        </Card>
      ))}
    </View>
  );
}
