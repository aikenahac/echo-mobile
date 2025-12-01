import { UserBook } from "@/lib/types";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { PageEditDrawer } from "./page-edit-drawer";
import { Separator } from "./ui/separator";
import { Text } from "./ui/text";

export function LibraryBookListItem({ userBook }: { userBook: UserBook }) {
  const [pageEditOpen, setPageEditOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(userBook.currentPage || 0);
  const [pageCount, setPageCount] = useState(userBook.pageCount || 0);

  return (
    <View>
      <TouchableOpacity
        onLongPress={() => {
          Haptics.selectionAsync();
          setPageEditOpen(true);
        }}
        className="flex flex-row items-center gap-4 w-full px-4 py-3 rounded-lg"
      >
        <Image
          source={userBook.book.coverUrl}
          className="h-full w-full flex-1"
          style={{
            height: 100,
            width: 80,
          }}
          contentFit="contain"
        />
        <View className="flex flex-col">
          <Text className="font-bold">{userBook.book.title}</Text>
          <Text className="text-muted-foreground">{userBook.book.author}</Text>
          <Text className="text-muted-foreground">{currentPage} / {pageCount}</Text>
        </View>
      </TouchableOpacity>
      <Separator className="my-2" />
      <Text>{JSON.stringify(userBook, null, 2)}</Text>

      <PageEditDrawer
        open={pageEditOpen}
        setOpen={setPageEditOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageCount={pageCount}
        setPageCount={setPageCount}
      />
    </View>
  );
}
