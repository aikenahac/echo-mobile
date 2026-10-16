import { storage, STORAGE_KEYS } from "@/lib/storage";
import { useMMKVString } from "react-native-mmkv";

export type LibraryLayout = "grid" | "list";

/** Grid or list for the paper shelves; reactive, so Settings and Library stay in step */
export function useLibraryLayout(): [LibraryLayout, (layout: LibraryLayout) => void] {
  const [value, setValue] = useMMKVString(STORAGE_KEYS.LIBRARY_VIEW, storage);
  return [value === "list" ? "list" : "grid", (layout) => setValue(layout)];
}
