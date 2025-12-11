import { UserBook } from "@/lib/types";
import { FlatList, View } from "react-native";
import { LibraryBookGridItem } from "./library-book-grid-item";

type Props = {
  books: UserBook[];
  maxBooks?: number;
  numColumns?: number;
};

export function BookGrid({ books, maxBooks = 6, numColumns = 2 }: Props) {
  if (!books || books.length === 0) {
    return null;
  }

  const displayBooks = books.slice(0, maxBooks);

  return (
    <FlatList
      data={displayBooks}
      renderItem={({ item }) => (
        <View className="flex-1 p-1">
          <LibraryBookGridItem userBook={item} />
        </View>
      )}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      scrollEnabled={false}
      columnWrapperStyle={{ gap: 8 }}
    />
  );
}
