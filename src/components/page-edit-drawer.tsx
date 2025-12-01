import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { NumberSpinner } from "./number-spinner";
import { Button } from "./ui/button";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Label } from "./ui/label";
import { Text } from "./ui/text";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;

  currentPage: number;
  setCurrentPage: (page: number) => void;

  pageCount: number;
  setPageCount: (pageCount: number) => void;
};

export function PageEditDrawer({
  open,
  setOpen,
  currentPage,
  setCurrentPage,
  pageCount,
  setPageCount,
}: Props) {
  const { t } = useTranslation();

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <Text className="text-lg">{t("library.pageEdit.title")}</Text>
        <View className="w-full gap-4">
          <Label className="mb-2">{t("library.pageEdit.currentPage")}</Label>
          <NumberSpinner value={currentPage} onChange={setCurrentPage} />

          <Label className="mb-2">{t("library.pageEdit.pageCount")}</Label>
          <NumberSpinner value={pageCount} onChange={setPageCount} />

          <Button className="mb-4 mt-2">
            <Text>{t("library.pageEdit.save")}</Text>
          </Button>
        </View>
      </DrawerContent>
    </Drawer>
  );
}
