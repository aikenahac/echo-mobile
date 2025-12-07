import { FullScreenLoader } from "@/components/full-screen-loader";
import { LibraryBookGridItem } from "@/components/library-book-grid-item";
import { LibraryBookListItem } from "@/components/library-book-list-item";
import { LibraryDrawer } from "@/components/library-drawer";
import { LibraryViewSwitcher } from "@/components/library-view-switcher";
import { ScreenContainer } from "@/components/screen-container";
import { Text } from "@/components/ui/text";
import { useMyLibrary } from "@/hooks/api/library/use-get-my-library";
import { useLibraryTab } from "@/hooks/use-library-tab";
import { useLibraryView } from "@/hooks/use-library-view";
import { UserBook } from "@/lib/types";
import { useTranslation } from "react-i18next";
import { FlatList, RefreshControl, useWindowDimensions, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function LibraryScreen() {
  const { t } = useTranslation();

  const { activeView, changeActiveView } = useLibraryView();
  const { activeTab, activeDataSource, changeActiveTab } = useLibraryTab();

  const { data: library, isLoading, error, refetch } = useMyLibrary();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  const getContent = () => {
    if (activeDataSource === "collection") {
      return undefined;
    }

    return library?.[activeDataSource];
  };

  return (
    <ScreenContainer className="flex flex-col  w-screen h-screen mt-8 mb-12">
      <Text className="font-extrabold text-4xl">{t("library.title")}</Text>

      <View className="w-full flex flex-row items-center justify-between my-4">
        <LibraryDrawer
          activeTab={activeTab}
          changeActiveTab={changeActiveTab}
        />
        <LibraryViewSwitcher
          activeView={activeView}
          changeActiveView={changeActiveView}
        />
      </View>

      <LibraryBookView
        books={getContent()}
        refreshing={isLoading}
        onRefresh={() => refetch()}
        activeView={activeView}
      />
    </ScreenContainer>
  );
}

type BookViewProps = {
  books: Array<UserBook> | undefined;
  refreshing: boolean;
  onRefresh: () => void;
  activeView: "grid" | "list";
};

function LibraryBookView({ books, refreshing, onRefresh, activeView }: BookViewProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  // Calculate columns based on screen width
  const numColumns = width > 768 ? 3 : 2;

  if (!books || books.length === 0) {
    return (
      <View className="flex flex-col items-center gap-2 text-center text-muted-foreground">
        <Text>{t("library.noContent")}</Text>
        <Text className="text-sm">{t("library.noContentSubtext")}</Text>
      </View>
    );
  }

  // Grid View
  if (activeView === "grid") {
    return (
      <FlatList
        key={numColumns}
        data={books}
        renderItem={({ item }) => <LibraryBookGridItem userBook={item} />}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={{ gap: 16 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    );
  }

  // List View
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {books.map((book) => (
        <LibraryBookListItem key={book.id} userBook={book} />
      ))}
    </ScrollView>
  );
}
