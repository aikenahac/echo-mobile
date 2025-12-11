import { useToggleFavorite } from "@/hooks/api/library/use-toggle-favorite";
import { useUpdateCurrentPage } from "@/hooks/api/library/use-update-current-page";
import { useUpdatePageCount } from "@/hooks/api/library/use-update-page-count";
import { HeartIcon, PlusIcon } from "@/lib/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { NumberSpinner } from "./number-spinner";
import { Button } from "./ui/button";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Label } from "./ui/label";
import { Text } from "./ui/text";

type Props = {
  userBookId: string;
  isFavorite: boolean;

  open: boolean;
  setOpen: (open: boolean) => void;

  currentPage: number;
  setCurrentPage: (page: number) => void;

  pageCount: number;
  setPageCount: (pageCount: number) => void;
};

export function QuickActionsDrawer({
  userBookId,
  isFavorite,
  open,
  setOpen,
  currentPage,
  setCurrentPage,
  pageCount,
  setPageCount,
}: Props) {
  const { t } = useTranslation();
  const { mutateAsync: updateCurrentPage } = useUpdateCurrentPage(userBookId);
  const { mutateAsync: updatePageCount } = useUpdatePageCount(userBookId);
  const { mutateAsync: toggleFavorite } = useToggleFavorite(userBookId);
  const queryClient = useQueryClient();

  // Debounced update for current page
  useEffect(() => {
    const timer = setTimeout(() => {
      updateCurrentPage(currentPage);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPage, updateCurrentPage]);

  // Debounced update for page count
  useEffect(() => {
    const timer = setTimeout(() => {
      updatePageCount(pageCount);
    }, 500);

    return () => clearTimeout(timer);
  }, [pageCount, updatePageCount]);

  const handleToggleFavorite = async () => {
    await toggleFavorite(!isFavorite)
    queryClient.invalidateQueries({ queryKey: ['library'] })
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="pb-8">
        <View className="px-4">
          <Text className="text-lg mb-4">{t("library.quickActions.title")}</Text>
          <View className="w-full gap-4">
            <Label>{t("library.quickActions.currentPage")}</Label>
            <NumberSpinner value={currentPage} onChange={setCurrentPage} />

            <Label>{t("library.quickActions.pageCount")}</Label>
            <NumberSpinner value={pageCount} onChange={setPageCount} />

            <View className="flex flex-row items-center gap-2 my-4">
              <Button size="icon" variant="destructive-outline" onPress={handleToggleFavorite}>
                <HeartIcon fill={isFavorite ? "#ff6467" : "none"} className="text-destructive" />
              </Button>

              <Button variant="outline">
                <PlusIcon />
                <Text>{t("library.quickActions.addToCollection")}</Text>
              </Button>
            </View>
          </View>
        </View>
      </DrawerContent>
    </Drawer>
  );
}
