import { useAddBookToLibrary } from "@/hooks/api/library/use-add-book-to-library";
import { useMyLibrary } from "@/hooks/api/library/use-get-my-library";
import { useToggleFavorite } from "@/hooks/api/library/use-toggle-favorite";
import { useUpdateStatus } from "@/hooks/api/library/use-update-status";
import { useProfile } from "@/hooks/api/user/use-get-me";
import { getErrorMessage } from "@/lib/api/errors";
import { BookOpenIcon, HeartIcon, PlusIcon } from "@/lib/icons";
import { ReadingStatus } from "@/lib/schemas";
import { SearchResult } from "@/lib/types";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { Button } from "./ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Label } from "./ui/label";
import { Text } from "./ui/text";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  searchResult: SearchResult | null;
};

export function AddToLibraryDrawer({ open, setOpen, searchResult }: Props) {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const { data: library } = useMyLibrary();
  const [error, setError] = useState<string | null>(null);

  const { mutate: addBook, isPending: isAdding } = useAddBookToLibrary();

  const isPremium = profile?.isPremium || false;

  // Check if book is already in library and favorited
  const existingUserBook = useMemo(() => {
    if (!searchResult || !library) return null;

    const allBooks = [
      ...library.favoriteBooks,
      ...library.wantToRead,
      ...library.currentlyReading,
      ...library.finished,
    ];

    return allBooks.find((ub) => {
      // Match by ISBN if available
      if (searchResult.isbn && ub.book.isbn) {
        return ub.book.isbn === searchResult.isbn;
      }
      // Otherwise match by title and author
      return (
        ub.book.title.toLowerCase() === searchResult.title.toLowerCase() &&
        ub.book.author.toLowerCase() === searchResult.author.toLowerCase()
      );
    });
  }, [searchResult, library]);

  const isAlreadyFavorite = useMemo(() => existingUserBook?.isFavorite || false, [existingUserBook]);
  const currentStatus = useMemo(() => existingUserBook?.status || null, [existingUserBook]);

  // Hooks for updating existing books
  const { mutate: updateStatusMutation, isPending: isUpdatingStatus } =
    useUpdateStatus(existingUserBook?.id || "");
  const { mutate: toggleFavoriteMutation, isPending: isTogglingFavorite } =
    useToggleFavorite(existingUserBook?.id || "");

  const isPending = isAdding || isUpdatingStatus || isTogglingFavorite;

  const handleAddBookWithStatus = (status: ReadingStatus, favorite = false) => {
    if (!searchResult) return;

    setError(null);

    if (existingUserBook) {
      // Book exists - update status
      updateStatusMutation(status, {
        onError: (err) => {
          setError(getErrorMessage(err));
        },
      });
    } else {
      // New book - add to library
      addBook(
        {
          bookData: searchResult,
          status,
          isFavorite: favorite,
        },
        {
          onSuccess: () => {
            setError(null);
          },
          onError: (err) => {
            setError(getErrorMessage(err));
          },
        }
      );
    }
  };

  const handleFavorite = () => {
    if (!searchResult) return;

    setError(null);

    if (existingUserBook) {
      // Book exists - toggle favorite
      toggleFavoriteMutation(!isAlreadyFavorite, {
        onError: (err) => {
          setError(getErrorMessage(err));
        },
      });
    } else {
      // New book - add to "want to read" and mark as favorite
      handleAddBookWithStatus("want", true);
    }
  };

  // Reset state when drawer closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError(null);
    }
    setOpen(newOpen);
  };

  if (!searchResult) return null;

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="pb-8">
        <DrawerHeader>
          <DrawerTitle>
            <Text className="text-lg font-bold">
              {t("search.addToLibrary.title")}
            </Text>
          </DrawerTitle>
        </DrawerHeader>

        <View className="w-full gap-4 px-4">
          {/* Book Preview */}
          <View className="flex flex-row gap-3 p-3 bg-muted rounded-lg">
            {searchResult.coverUrl ? (
              <Image
                source={searchResult.coverUrl}
                className="rounded-md"
                style={{ height: 80, width: 60 }}
                contentFit="cover"
              />
            ) : (
              <View
                className="bg-background rounded-md flex items-center justify-center"
                style={{ height: 80, width: 60 }}
              >
                <BookOpenIcon size={20} className="text-muted-foreground" />
              </View>
            )}
            <View className="flex-1">
              <Text className="font-bold" numberOfLines={2}>
                {searchResult.title}
              </Text>
              <Text className="text-muted-foreground text-sm" numberOfLines={1}>
                {searchResult.author}
              </Text>
              {searchResult.publishedYear && (
                <Text className="text-muted-foreground text-xs">
                  {searchResult.publishedYear}
                </Text>
              )}
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-destructive/10 p-3 rounded-lg border border-destructive">
              <Text className="text-destructive text-sm">{error}</Text>
            </View>
          )}

          {/* Status Selection */}
          <View className="gap-2">
            <Label>
              {existingUserBook
                ? t("search.addToLibrary.currentStatus")
                : t("search.addToLibrary.selectStatus")}
            </Label>
            <View className="flex flex-col gap-2">
              <Button
                variant={currentStatus === "want" ? "default" : "outline"}
                className="w-full"
                onPress={() => handleAddBookWithStatus("want")}
                disabled={isPending}
              >
                {isPending && isUpdatingStatus ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text>{t("search.addToLibrary.status.want")}</Text>
                )}
              </Button>
              <Button
                variant={currentStatus === "reading" ? "default" : "outline"}
                className="w-full"
                onPress={() => handleAddBookWithStatus("reading")}
                disabled={isPending}
              >
                {isPending && isUpdatingStatus ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text>{t("search.addToLibrary.status.reading")}</Text>
                )}
              </Button>
              <Button
                variant={currentStatus === "finished" ? "default" : "outline"}
                className="w-full"
                onPress={() => handleAddBookWithStatus("finished")}
                disabled={isPending}
              >
                {isPending && isUpdatingStatus ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text>{t("search.addToLibrary.status.finished")}</Text>
                )}
              </Button>
            </View>
          </View>

          {/* Additional Options */}
          <View className="flex flex-row items-center gap-2">
            <Button
              size="icon"
              variant="destructive-outline"
              onPress={handleFavorite}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator size="small" />
              ) : (
                <HeartIcon
                  fill={isAlreadyFavorite ? "#ff6467" : "none"}
                  className="text-destructive"
                />
              )}
            </Button>

            <Button
              variant="outline"
              className="flex-1 relative opacity-50"
              disabled
            >
              <PlusIcon />
              <Text>{t("search.addToLibrary.collection")}</Text>
              <View className="absolute -top-2 -right-2 bg-primary px-2 py-1 rounded-full">
                <Text className="text-primary-foreground text-xs font-bold">
                  {t("search.addToLibrary.premium")}
                </Text>
              </View>
            </Button>
          </View>
        </View>
      </DrawerContent>
    </Drawer>
  );
}
