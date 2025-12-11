import { Review } from "@/lib/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { ReviewForm } from "./review-form";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Text } from "./ui/text";

type ReviewDrawerProps = {
  bookId: string;
  existingReview?: Review | null;
  onSuccess?: () => void;
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "ghost" | "destructive";
};

export function ReviewDrawer({
  bookId,
  existingReview,
  onSuccess,
  triggerText,
  triggerVariant = "default",
}: ReviewDrawerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant={triggerVariant}>
          <Text>
            {triggerText ||
              (existingReview
                ? t("bookDetail.editReview")
                : t("bookDetail.addReview"))}
          </Text>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <DrawerHeader>
            <DrawerTitle>
              <Text>
                {existingReview
                ? t("bookDetail.editReview")
                : t("bookDetail.yourReview")}
              </Text>
            </DrawerTitle>
          </DrawerHeader>
          <ReviewForm
            bookId={bookId}
            existingReview={existingReview}
            onSuccess={handleSuccess}
          />
        </ScrollView>
      </DrawerContent>
    </Drawer>
  );
}
