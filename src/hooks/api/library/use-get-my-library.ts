import { useLibraryApi } from "@/lib/api/library";
import { useQuery } from "@tanstack/react-query";
import { libraryQueryKeys } from "../../query-keys";

export const useMyLibrary = () => {
  const { getMyLibrary } = useLibraryApi();

  return useQuery({
    queryKey: libraryQueryKeys.get,
    queryFn: getMyLibrary,
  });
};
