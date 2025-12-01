# API Implementation Guide

This guide shows you how to implement new API endpoints following the established pattern with Zod validation and error handling.

## Pattern Overview

1. **Define Zod Schema** in `src/lib/schemas/index.ts`
2. **Create API Function** in `src/lib/api/*.ts`
3. **Create React Query Hook** in `src/hooks/api/*/*.ts`
4. **Use in Component** with proper error handling

## Example: Profile API (Reference Implementation)

### Step 1: Define Zod Schema

```typescript
// src/lib/schemas/index.ts

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().nullable(),
  bio: z.string().nullable(),
  role: UserRoleSchema,
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export const ProfileResponseSchema = z.union([UserSchema, UserWithStatsSchema]);

export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
```

### Step 2: Create API Function

```typescript
// src/lib/api/user.ts

import { handleApiResponse } from './errors';
import { useFetch } from './fetch-wrapper';
import { ProfileResponseSchema, type ProfileResponse } from '@/lib/schemas';

export function useUsersApi() {
  const { authenticatedFetch } = useFetch();

  const getMe = async (): Promise<ProfileResponse> => {
    const response = await authenticatedFetch(Endpoints.profile.get);
    return handleApiResponse(response, ProfileResponseSchema);
  };

  return { getMe };
}
```

### Step 3: Create React Query Hook

```typescript
// src/hooks/api/user/use-get-me.ts

import { useUsersApi } from '@/lib/api/user';
import { useQuery } from '@tanstack/react-query';
import { profileQueryKeys } from '../query-keys';

export const useProfile = () => {
  const { getMe } = useUsersApi();

  return useQuery({
    queryKey: profileQueryKeys.get,
    queryFn: getMe,
  });
};
```

### Step 4: Use in Component

```typescript
import { useProfile } from '@/hooks/api/user/use-get-me';
import { getErrorMessage, isApiRequestError } from '@/lib/api/errors';

function MyComponent() {
  const { data: profile, isLoading, error, refetch } = useProfile();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return (
      <View>
        <Text>{getErrorMessage(error)}</Text>
        {isApiRequestError(error) && (
          <Text>Status: {error.statusCode}</Text>
        )}
        <Button onPress={() => refetch()}>Retry</Button>
      </View>
    );
  }

  return (
    <View>
      <Text>{profile.email}</Text>
      <Text>{profile.username}</Text>
    </View>
  );
}
```

## Template for New Endpoints

### 1. Add Schema to `src/lib/schemas/index.ts`

```typescript
// Example: Book creation request/response
export const CreateBookRequestSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().optional(),
});

export const CreateBookResponseSchema = z.object({
  success: z.boolean(),
  book: BookSchema.optional(),
  error: z.string().optional(),
});

export type CreateBookRequest = z.infer<typeof CreateBookRequestSchema>;
export type CreateBookResponse = z.infer<typeof CreateBookResponseSchema>;
```

### 2. Add API Function

```typescript
// src/lib/api/books.ts

import { handleApiResponse } from './errors';
import { useFetch } from './fetch-wrapper';
import {
  CreateBookRequestSchema,
  CreateBookResponseSchema,
  type CreateBookRequest,
  type CreateBookResponse,
} from '@/lib/schemas';

export function useBooksApi() {
  const { authenticatedFetch } = useFetch();

  const createBook = async (
    data: CreateBookRequest
  ): Promise<CreateBookResponse> => {
    // Validate input
    const validatedData = CreateBookRequestSchema.parse(data);

    const response = await authenticatedFetch(Endpoints.books.create, {
      method: 'POST',
      body: JSON.stringify(validatedData),
    });

    return handleApiResponse(response, CreateBookResponseSchema);
  };

  return { createBook };
}
```

### 3. Add React Query Hook

```typescript
// src/hooks/api/books/use-create-book.ts

import { useBooksApi } from '@/lib/api/books';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookQueryKeys } from '../query-keys';
import type { CreateBookRequest } from '@/lib/schemas';

export const useCreateBook = () => {
  const { createBook } = useBooksApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookRequest) => createBook(data),
    onSuccess: () => {
      // Invalidate books list to refetch
      queryClient.invalidateQueries({ queryKey: bookQueryKeys.list });
    },
  });
};
```

### 4. Use in Component

```typescript
import { useCreateBook } from '@/hooks/api/books/use-create-book';

function CreateBookForm() {
  const createBook = useCreateBook();

  const handleSubmit = async () => {
    try {
      const result = await createBook.mutateAsync({
        title: 'My Book',
        author: 'John Doe',
      });

      if (result.success) {
        alert('Book created!');
      }
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  return (
    <Button
      onPress={handleSubmit}
      disabled={createBook.isPending}
    >
      <Text>
        {createBook.isPending ? 'Creating...' : 'Create Book'}
      </Text>
    </Button>
  );
}
```

## Error Handling Utilities

### Available Functions

```typescript
// Get user-friendly error message
const message = getErrorMessage(error);

// Check if it's an API request error
if (isApiRequestError(error)) {
  console.log(error.statusCode);
  console.log(error.responseData);
}

// Check if it's a validation error
if (isValidationError(error)) {
  console.log(error.errors); // Zod errors
}
```

### Error Types

- **ApiRequestError**: HTTP errors (404, 500, etc.)
- **ValidationError**: Zod schema validation failures

## Best Practices

1. **Always validate responses** - Use `handleApiResponse()` with a Zod schema
2. **Handle errors in UI** - Show user-friendly messages with retry options
3. **Type safety** - Use TypeScript types inferred from Zod schemas
4. **Query keys** - Define consistent query keys for cache management
5. **Invalidation** - Invalidate related queries after mutations
6. **Loading states** - Show loaders during API calls
7. **Optimistic updates** - For better UX, update UI before API responds

## Query Keys Pattern

```typescript
// src/hooks/api/query-keys.ts

export const bookQueryKeys = {
  all: ['books'] as const,
  list: () => [...bookQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...bookQueryKeys.all, 'detail', id] as const,
};

export const reviewQueryKeys = {
  all: ['reviews'] as const,
  list: () => [...reviewQueryKeys.all, 'list'] as const,
  byBook: (bookId: string) => [...reviewQueryKeys.all, 'byBook', bookId] as const,
};
```

## Next Steps

Follow this pattern to implement:

1. **Books API** - CRUD operations for user's library
2. **Reviews API** - Create, read, update, delete reviews
3. **Collections API** - Manage book collections
4. **Social API** - Follow/unfollow users
5. **Subscriptions API** - Manage subscription and usage

Each follows the same 4-step pattern!
