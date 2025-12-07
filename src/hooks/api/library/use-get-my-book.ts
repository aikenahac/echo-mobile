import { useLibraryApi } from "@/lib/api/library";
import { useQuery } from "@tanstack/react-query";
import { libraryQueryKeys } from "../../query-keys";

export const useGetUserBook = (userBookId: string) => {
  const { getUserBook } = useLibraryApi();

  return useQuery({
    queryKey: libraryQueryKeys.getBook(userBookId),
    queryFn: () => getUserBook(userBookId),
  });
};
