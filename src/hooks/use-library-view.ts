import {
  getFromLocalStorage,
  setInLocalStorage,
  STORAGE_KEYS,
} from "@/lib/storage";
import { LibraryViews } from "@/lib/types";
import { useState } from "react";

export function useLibraryView() {
  const storedView = getFromLocalStorage<LibraryViews>(
    STORAGE_KEYS.LIBRARY_VIEW,
  );

  const [activeView, setActiveView] = useState<LibraryViews>(
    storedView || "list",
  );

  const changeActiveView = (newView: LibraryViews) => {
    setActiveView(newView);
    setInLocalStorage<LibraryViews>(STORAGE_KEYS.LIBRARY_VIEW, newView);
  };

  return {
    activeView,
    changeActiveView,
  };
}
