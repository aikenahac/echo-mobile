import {
  type Collection,
  type CollectionSummary,
  CollectionSchema,
  CollectionSummarySchema,
  CollectionsResponseSchema,
  MutationResponseSchema,
  UploadUrlResponseSchema,
} from "@/lib/schemas";
import { Endpoints } from "./endpoints";
import { ApiRequestError, handleApiResponse } from "./errors";
import { useFetch } from "./fetch-wrapper";
import type { ImageContentType } from "./profile";

export type CollectionFields = {
  name?: string;
  description?: string | null;
  isPublic?: boolean;
  colorTag?: string | null;
  iconName?: string | null;
  coverImageUrl?: string | null;
};

export function useCollectionsApi() {
  const { authenticatedFetch } = useFetch();
  const json = (method: string, body: unknown) => ({ method, body: JSON.stringify(body) });

  /** GET /collections: yours, ordered by sortOrder, each with books and bookCount */
  const getCollections = async (): Promise<Array<Collection>> =>
    handleApiResponse(await authenticatedFetch(Endpoints.collections.getAll), CollectionsResponseSchema);

  /** GET /collections/{id} */
  const getCollection = async (id: string): Promise<Collection> =>
    handleApiResponse(await authenticatedFetch(Endpoints.collections.getById(id)), CollectionSchema);

  /** POST /collections → 201 (403 when not Premium) */
  const createCollection = async (fields: CollectionFields & { name: string }): Promise<CollectionSummary> =>
    handleApiResponse(await authenticatedFetch(Endpoints.collections.create, json("POST", fields)), CollectionSummarySchema);

  /** PUT /collections/{id}; renaming changes the slug */
  const updateCollection = async (id: string, fields: CollectionFields): Promise<CollectionSummary> =>
    handleApiResponse(await authenticatedFetch(Endpoints.collections.update(id), json("PUT", fields)), CollectionSummarySchema);

  /** DELETE /collections/{id}; the books stay in the library */
  const deleteCollection = async (id: string) =>
    handleApiResponse(await authenticatedFetch(Endpoints.collections.delete(id), { method: "DELETE" }), MutationResponseSchema);

  /** POST /collections/{id}/books. "Book already in collection" counts as done. */
  const addBook = async (id: string, userBookId: string) => {
    const response = await authenticatedFetch(Endpoints.collections.addBook(id), json("POST", { userBookId }));
    try {
      await handleApiResponse(response);
    } catch (e) {
      if (e instanceof ApiRequestError && /already in collection/i.test(e.message)) return;
      throw e;
    }
  };

  /** DELETE /collections/{id}/books?userBookId= */
  const removeBook = async (id: string, userBookId: string) => {
    const params = new URLSearchParams({ userBookId });
    await handleApiResponse(await authenticatedFetch(`${Endpoints.collections.removeBook(id)}?${params}`, { method: "DELETE" }));
  };

  /** Cover image: signed URL for this exact type and size, PUT the bytes, return the public URL */
  const uploadCover = async (id: string, uri: string, contentType: ImageContentType): Promise<string> => {
    const blob = await (await fetch(uri)).blob();
    const signed = await handleApiResponse(
      await authenticatedFetch(Endpoints.collections.coverUploadUrl(id), json("POST", { contentType, fileSize: blob.size })),
      UploadUrlResponseSchema,
    );
    const put = await fetch(signed.uploadUrl, { method: "PUT", headers: { "Content-Type": contentType }, body: blob });
    if (!put.ok) throw new ApiRequestError(`Upload failed (${put.status})`, put.status);
    return signed.publicUrl;
  };

  return { getCollections, getCollection, createCollection, updateCollection, deleteCollection, addBook, removeBook, uploadCover };
}
