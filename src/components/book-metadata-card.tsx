import { UserBook } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Text } from "./ui/text";

type BookMetadataCardProps = {
  userBook: UserBook;
  className?: string;
};

type MetadataRowProps = {
  label: string;
  value: string | number | React.ReactNode;
};

function MetadataRow({ label, value }: MetadataRowProps) {
  return (
    <View className="flex flex-row justify-between items-center py-2">
      <Text className="text-muted-foreground">{label}</Text>
      {typeof value === "string" || typeof value === "number" ? (
        <Text className="font-medium">{value}</Text>
      ) : (
        value
      )}
    </View>
  );
}

export function BookMetadataCard({ userBook, className }: BookMetadataCardProps) {
  const { t } = useTranslation();

  const formatDate = (date: Date | string | null) => {
    if (!date) return t("bookDetail.metadata.notSet", "N/A");
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "MMM d, yyyy");
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "reading":
        return "default";
      case "finished":
        return "secondary";
      case "want":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`bookDetail.status.${status}`, status);
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>{t("bookDetail.title")}</CardTitle>
      </CardHeader>
      <CardContent className="gap-1">
        <MetadataRow
          label={t("bookDetail.metadata.isbn")}
          value={userBook.book.isbn || "N/A"}
        />
        <MetadataRow
          label={t("bookDetail.metadata.pages")}
          value={userBook.book.pages || "N/A"}
        />
        <MetadataRow
          label={t("bookDetail.metadata.published")}
          value={userBook.book.publishedYear || "N/A"}
        />

        <Separator className="my-3" />

        <MetadataRow
          label={t("bookDetail.metadata.status")}
          value={
            <Badge variant={getStatusBadgeVariant(userBook.status)}>
              <Text>{getStatusLabel(userBook.status)}</Text>
            </Badge>
          }
        />
        <MetadataRow
          label={t("bookDetail.metadata.progress")}
          value={
            userBook.currentPage && userBook.pageCount
              ? `${userBook.currentPage} / ${userBook.pageCount}`
              : "N/A"
          }
        />
        <MetadataRow
          label={t("bookDetail.metadata.started")}
          value={formatDate(userBook.startedAt)}
        />
        <MetadataRow
          label={t("bookDetail.metadata.finished")}
          value={formatDate(userBook.finishedAt)}
        />
      </CardContent>
    </Card>
  );
}
