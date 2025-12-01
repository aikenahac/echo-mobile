import { LayoutGridIcon, ListIcon } from "@/lib/icons";
import { LibraryViews } from "@/lib/types";
import { View } from "react-native";
import { Button } from "./ui/button";

type Props = {
  activeView: LibraryViews;
  changeActiveView: (newView: LibraryViews) => void;
};

export function LibraryViewSwitcher({ activeView, changeActiveView }: Props) {
  return (
    <View className="flex flex-row items-center">
      <Button
        size="icon"
        onPress={() => changeActiveView("grid")}
        variant={activeView === "grid" ? "default" : "outline"}
      >
        <LayoutGridIcon className="text-primary-foreground" />
      </Button>
      <Button
        size="icon"
        onPress={() => changeActiveView("list")}
        variant={activeView === "list" ? "default" : "outline"}
      >
        <ListIcon className="text-primary-foreground" />
      </Button>
    </View>
  );
}
