import { LibraryResponse } from "@/lib/schemas";
import {
  getFromLocalStorage,
  setInLocalStorage,
  STORAGE_KEYS,
} from "@/lib/storage";
import { LibraryTabs, LibraryTabsApiMap } from "@/lib/types";
import { useMemo, useState } from "react";

export function useLibraryTab() {
  const storedTab = getFromLocalStorage<LibraryTabs>(
    STORAGE_KEYS.LIBRARY_TAB,
  );

  const [activeTab, setActiveTab] = useState<LibraryTabs>(
    storedTab || "reading",
  );

  const activeDataSource: keyof LibraryResponse | "collection" = useMemo(() => LibraryTabsApiMap[activeTab], [activeTab])

  const changeActiveTab = (newTab: LibraryTabs) => {
    setActiveTab(newTab);
    const valueToStore: LibraryTabs = newTab === "collection" ? "reading" : newTab;
    setInLocalStorage<LibraryTabs>(STORAGE_KEYS.LIBRARY_TAB, valueToStore);
  };

  return {
    activeTab,
    activeDataSource,
    changeActiveTab,
  };
}
