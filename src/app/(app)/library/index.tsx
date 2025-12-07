import { FullScreenLoader } from "@/components/full-screen-loader";
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
import { RefreshControl, View } from "react-native";
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

      <LibraryBookListView
        books={getContent()}
        refreshing={isLoading}
        onRefresh={() => refetch()}
      />
    </ScreenContainer>
  );
}

type ListViewProps = {
  books: Array<UserBook> | undefined;
  refreshing: boolean;
  onRefresh: () => void;
};

function LibraryBookListView({ books, refreshing, onRefresh }: ListViewProps) {
  const { t } = useTranslation();

  if (!books || books.length === 0) {
    return (
      <View className="flex flex-col items-center gap-2 text-center text-muted-foreground">
        <Text>{t("library.noContent")}</Text>
        <Text className="text-sm">{t("library.noContentSubtext")}</Text>
      </View>
    );
  }

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
