import {
  BookmarkIcon,
  BookOpenIcon,
  CheckCircleIcon,
  HeartIcon,
  MenuIcon,
} from "@/lib/icons";
import { LibraryTabs } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { LucideProps } from "lucide-react-native";
import { useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { Button } from "./ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { Text } from "./ui/text";

type Props = {
  activeTab: LibraryTabs;
  changeActiveTab: (newTab: LibraryTabs) => void;
};

type Tab = {
  tab: LibraryTabs;
  Icon: ComponentType<LucideProps & { className?: string }>;
};

export function LibraryDrawer({ activeTab, changeActiveTab }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const tabs: Array<Tab> = [
    {
      tab: "favorites",
      Icon: HeartIcon,
    },
    {
      tab: "want",
      Icon: BookmarkIcon,
    },
    {
      tab: "reading",
      Icon: BookOpenIcon,
    },
    {
      tab: "finished",
      Icon: CheckCircleIcon,
    },
  ];

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="icon" onPress={() => setOpen(true)}>
          <MenuIcon className="text-primary-foreground" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <View className="gap-2">
          {tabs.map(({ tab, Icon }) => (
            <TouchableOpacity
              key={tab}
              onPress={() => {
                changeActiveTab(tab);
                setOpen(false);
              }}
              className={cn("flex flex-row items-center gap-4 px-2 py-2 rounded-lg", {
                "bg-primary text-primary-foreground": tab === activeTab,
              })}
            >
              <Icon className="text-primary-foreground" size={20} />
              <Text>{t(`library.tabs.${tab}`)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContent>
    </Drawer>
  );
}
