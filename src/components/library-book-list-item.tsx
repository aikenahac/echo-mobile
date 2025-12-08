import { HeartIcon } from "@/lib/icons";
import { UserBook } from "@/lib/types";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { QuickActionsDrawer } from "./quick-actions-drawer";
import { Separator } from "./ui/separator";
import { Text } from "./ui/text";

export function LibraryBookListItem({ userBook }: { userBook: UserBook }) {
  const router = useRouter();

  const [pageEditOpen, setPageEditOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(userBook.currentPage || 0);
  const [pageCount, setPageCount] = useState(userBook.pageCount || 0);

  return (
    <View>
      <TouchableOpacity
        onPress={() =>{
          router.push({
            pathname: "/(app)/library/user-book",
            params: {
              userBookId: userBook.id,
            },
          })
        }}
        onLongPress={() => {
          Haptics.selectionAsync();
          setPageEditOpen(true);
        }}
        className="flex flex-row items-center gap-4 w-full px-4 py-3 rounded-lg"
      >
        {userBook.book.coverUrl ? (
          <Image
            source={userBook.book.coverUrl}
            className="rounded-md"
            style={{
              height: 100,
              width: 80,
            }}
            contentFit="cover"
          />
        ) : (
          <View
            className="bg-muted rounded-md flex items-center justify-center"
            style={{
              height: 100,
              width: 80,
            }}
          >
            <Text className="text-muted-foreground text-xs">No Cover</Text>
          </View>
        )}
        <View className="flex flex-col flex-1">
          <Text className="font-bold">{userBook.book.title}</Text>
          <Text className="text-muted-foreground">{userBook.book.author}</Text>
          <View className="flex flex-row items-center gap-2">
            <Text className="text-muted-foreground">
              {currentPage} / {pageCount}
            </Text>
            {userBook.isFavorite ? (
              <HeartIcon
                fill="#ff6467"
                className="text-destructive"
                size={18}
              />
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
      <Separator className="my-2" />

      <QuickActionsDrawer
        userBookId={userBook.id}
        open={pageEditOpen}
        setOpen={setPageEditOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageCount={pageCount}
        setPageCount={setPageCount}
        isFavorite={userBook.isFavorite}
      />
    </View>
  );
}
