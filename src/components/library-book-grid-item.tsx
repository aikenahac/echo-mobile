import { QuickActionsDrawer } from "@/components/quick-actions-drawer";
import { Text } from "@/components/ui/text";
import { HeartIcon } from "@/lib/icons";
import { UserBook } from "@/lib/types";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export function LibraryBookGridItem({ userBook }: { userBook: UserBook }) {
  const router = useRouter();

  const [pageEditOpen, setPageEditOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(userBook.currentPage || 0);
  const [pageCount, setPageCount] = useState(userBook.pageCount || 0);

  return (
    <View className="mb-4">
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/(app)/library/user-book",
            params: {
              userBookId: userBook.id,
            },
          });
        }}
        onLongPress={() => {
          Haptics.selectionAsync();
          setPageEditOpen(true);
        }}
      >
        {/* Book Cover with Favorite Badge */}
        <View className="relative rounded-lg overflow-hidden">
          {userBook.book.coverUrl ? (
            <Image
              source={userBook.book.coverUrl}
              style={{
                height: 170,
                width: 136,
              }}
              contentFit="contain"
            />
          ) : (
            <View className="w-full h-full bg-muted flex items-center justify-center">
              <Text className="text-muted-foreground text-xs">No Cover</Text>
            </View>
          )}

          {/* Favorite Badge */}
          {userBook.isFavorite && (
            <View className="absolute top-2 right-2 bg-destructive/90 rounded-full p-1">
              <HeartIcon fill="white" className="text-white" size={14} />
            </View>
          )}
        </View>

        {/* Book Info */}
        <View className="mt-2 gap-1">
          <Text className="font-semibold text-sm" numberOfLines={2}>
            {userBook.book.title}
          </Text>
          <Text className="text-muted-foreground text-xs" numberOfLines={1}>
            {userBook.book.author}
          </Text>
          {currentPage !== null && pageCount !== null && pageCount > 0 && (
            <Text className="text-muted-foreground text-xs">
              {currentPage} / {pageCount}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Quick Actions Drawer */}
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
