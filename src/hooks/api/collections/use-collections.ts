import { queryKeys } from "@/hooks/query-keys";
import { type CollectionFields, useCollectionsApi } from "@/lib/api/collections";
import type { Collection, UserBook } from "@/lib/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** GET /collections */
export const useCollections = () => {
  const { getCollections } = useCollectionsApi();
  return useQuery({ queryKey: queryKeys.collections, queryFn: getCollections });
};

/** GET /collections/{id} */
export const useCollection = (id: string) => {
  const { getCollection } = useCollectionsApi();
  return useQuery({ queryKey: queryKeys.collection(id), queryFn: () => getCollection(id), enabled: !!id });
};

const refresh = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: queryKeys.collections });

/** Toggle a book in a collection, optimistic on the collections list */
export const useToggleCollectionBook = () => {
  const { addBook, removeBook } = useCollectionsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, userBook, add }: { collectionId: string; userBook: UserBook; add: boolean }) =>
      add ? addBook(collectionId, userBook.id) : removeBook(collectionId, userBook.id),
    onMutate: async ({ collectionId, userBook, add }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.collections });
      const previous = queryClient.getQueryData<Array<Collection>>(queryKeys.collections);
      if (previous) {
        queryClient.setQueryData<Array<Collection>>(
          queryKeys.collections,
          previous.map((c) => {
            if (c.id !== collectionId) return c;
            const books = add ? [...c.books.filter((b) => b.id !== userBook.id), userBook] : c.books.filter((b) => b.id !== userBook.id);
            return { ...c, books, bookCount: books.length };
          }),
        );
      }
      return { previous };
    },
    onError: (_e, _v, ctx) => ctx?.previous && queryClient.setQueryData(queryKeys.collections, ctx.previous),
    onSettled: () => refresh(queryClient),
  });
};

export const useCreateCollection = () => {
  const { createCollection } = useCollectionsApi();
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (fields: CollectionFields & { name: string }) => createCollection(fields), onSettled: () => refresh(queryClient) });
};

export const useUpdateCollection = () => {
  const { updateCollection } = useCollectionsApi();
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...fields }: CollectionFields & { id: string }) => updateCollection(id, fields), onSettled: () => refresh(queryClient) });
};

export const useDeleteCollection = () => {
  const { deleteCollection } = useCollectionsApi();
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => deleteCollection(id), onSettled: () => refresh(queryClient) });
};
