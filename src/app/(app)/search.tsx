import { AddToLibraryDrawer } from "@/components/add-to-library-drawer";
import { FullScreenLoader } from "@/components/full-screen-loader";
import { ScreenContainer } from "@/components/screen-container";
import { SearchResultItem } from "@/components/search-result-item";
import { SetUsernameDrawer } from "@/components/set-username-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useSearchBooks } from "@/hooks/api/search/use-search-books";
import { useProfile } from "@/hooks/api/user/use-get-me";
import { getErrorMessage } from "@/lib/api/errors";
import { LayoutGridIcon, ListIcon } from "@/lib/icons";
import { getFromLocalStorage, setInLocalStorage, STORAGE_KEYS } from "@/lib/storage";
import { LibraryViews, SearchResult } from "@/lib/types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, View } from "react-native";

export default function SearchScreen() {
  const { t } = useTranslation();
  const [usernameDrawerOpen, setUsernameDrawerOpen] = useState(false);

  // Fetch user profile with error handling and validation
  const { data: profile, isLoading: profileLoading } = useProfile();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null
  );
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);

  // View mode state
  const [view, setView] = useState<LibraryViews>(
    getFromLocalStorage<LibraryViews>(STORAGE_KEYS.SEARCH_VIEW) ?? "list"
  );

  // Search query with debouncing
  const {
    data,
    isLoading: searchLoading,
    error: searchError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchBooks(debouncedQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Show username drawer if needed
  useEffect(() => {
    if (profile && (!profile.username || profile.username.length === 0)) {
      setUsernameDrawerOpen(true);
    }
  }, [profile]);

  // Toggle view mode
  const toggleView = () => {
    const newView: LibraryViews = view === "list" ? "grid" : "list";
    setView(newView);
    setInLocalStorage(STORAGE_KEYS.SEARCH_VIEW, newView);
  };

  // Handle long press on search result
  const handleResultLongPress = (result: SearchResult) => {
    setSelectedResult(result);
    setAddDrawerOpen(true);
  };

  // Flatten all results from pages (API returns array directly)
  const allResults = data?.pages.flatMap((page) => page) ?? [];

  if (profileLoading) {
    return <FullScreenLoader />;
  }

  return (
    <ScreenContainer className="flex flex-col h-full mb-12">
      {/* Header with Search Input and View Toggle */}
      <View className="py-4 gap-3">
        <View className="flex flex-row items-center gap-2">
          <Input
            placeholder={t("search.placeholder")}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1"
          />
          <Button size="icon" variant="outline" onPress={toggleView}>
            {view === "list" ? <LayoutGridIcon /> : <ListIcon />}
          </Button>
        </View>
      </View>

      {/* Search Results */}
      <View className="flex-1">
        {!debouncedQuery.trim() ? (
          // Empty state - no search query
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-muted-foreground text-center">
              {t("search.emptyState")}
            </Text>
          </View>
        ) : searchLoading ? (
          // Loading state
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        ) : searchError ? (
          // Error state
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-destructive text-center mb-4">
              {getErrorMessage(searchError)}
            </Text>
          </View>
        ) : allResults.length === 0 ? (
          // No results found
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-muted-foreground text-center">
              {t("search.noResults", { query: debouncedQuery })}
            </Text>
          </View>
        ) : (
          // Results list
          <FlatList
            data={allResults}
            keyExtractor={(item, index) =>
              item.id || item.key || `${item.isbn}-${index}`
            }
            numColumns={view === "grid" ? 2 : 1}
            key={view}
            contentContainerClassName="gap-3"
            columnWrapperClassName={view === "grid" ? "gap-3" : undefined}
            renderItem={({ item }) => (
              <View className={view === "grid" ? "flex-1" : "w-full"}>
                <SearchResultItem
                  result={item}
                  onLongPress={() => handleResultLongPress(item)}
                  viewMode={view}
                />
              </View>
            )}
            ListFooterComponent={
              hasNextPage ? (
                <View className="py-4">
                  <Button
                    variant="outline"
                    onPress={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <View className="flex flex-row items-center gap-2">
                        <ActivityIndicator size="small" />
                        <Text>{t("search.loadMore")}</Text>
                      </View>
                    ) : (
                      <Text>{t("search.loadMore")}</Text>
                    )}
                  </Button>
                </View>
              ) : null
            }
          />
        )}
      </View>

      {/* Drawers */}
      <SetUsernameDrawer
        open={usernameDrawerOpen}
        setOpen={setUsernameDrawerOpen}
      />
      <AddToLibraryDrawer
        open={addDrawerOpen}
        setOpen={setAddDrawerOpen}
        searchResult={selectedResult}
      />
    </ScreenContainer>
  );
}

