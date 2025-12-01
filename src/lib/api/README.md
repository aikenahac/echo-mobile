# API Integration Guide

## Overview

This directory contains the fetch wrapper and TypeScript types for integrating with the Echo API.

## Usage Examples

### 1. Fetching User's Library

```tsx
import { useFetch } from '@/lib/api/fetch-wrapper';
import type { UserBookWithBook, ApiError } from '@/lib/types';

function LibraryScreen() {
  const { authenticatedFetch } = useFetch();
  const [books, setBooks] = useState<UserBookWithBook[]>([]);

  useEffect(() => {
    async function fetchLibrary() {
      try {
        const response = await authenticatedFetch(
          'https://api.echo.com/library'
        );
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error('Failed to fetch library:', error);
      }
    }
    fetchLibrary();
  }, [authenticatedFetch]);

  return (
    <View>
      {books.map((userBook) => (
        <Text key={userBook.id}>{userBook.book.title}</Text>
      ))}
    </View>
  );
}
```

### 2. Adding a Book to Library

```tsx
import { useFetch } from '@/lib/api/fetch-wrapper';
import type {
  AddBookToLibraryRequest,
  AddBookToLibraryResponse,
  isApiError,
} from '@/lib/types';

function AddBookButton({ book }: { book: NormalizedBook }) {
  const { authenticatedFetch } = useFetch();

  async function handleAddBook() {
    try {
      const response = await authenticatedFetch(
        'https://api.echo.com/books/add',
        {
          method: 'POST',
          body: JSON.stringify({
            bookData: book,
            status: 'want',
          } as AddBookToLibraryRequest),
        }
      );

      const data: AddBookToLibraryResponse = await response.json();

      if (isApiError(data)) {
        if (data.limitReached) {
          alert(`Limit reached: ${data.error}`);
        } else {
          alert(data.error);
        }
        return;
      }

      alert('Book added successfully!');
    } catch (error) {
      console.error('Failed to add book:', error);
    }
  }

  return <Button onPress={handleAddBook}>Add to Library</Button>;
}
```

### 3. Creating a Review

```tsx
import { useFetch } from '@/lib/api/fetch-wrapper';
import type { CreateReviewRequest, Review } from '@/lib/types';

function CreateReviewForm({ bookId }: { bookId: string }) {
  const { authenticatedFetch } = useFetch();
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  async function handleSubmit() {
    try {
      const response = await authenticatedFetch(
        'https://api.echo.com/reviews',
        {
          method: 'POST',
          body: JSON.stringify({
            bookId,
            content,
            isPrivate,
          } as CreateReviewRequest),
        }
      );

      const review: Review = await response.json();
      alert('Review created!');
    } catch (error) {
      console.error('Failed to create review:', error);
    }
  }

  return (
    <View>
      <TextInput value={content} onChangeText={setContent} />
      <Switch value={isPrivate} onValueChange={setIsPrivate} />
      <Button onPress={handleSubmit}>Submit Review</Button>
    </View>
  );
}
```

### 4. Following a User

```tsx
import { useFetch } from '@/lib/api/fetch-wrapper';
import type { FollowUserResponse } from '@/lib/types';

function FollowButton({ userId }: { userId: string }) {
  const { authenticatedFetch } = useFetch();
  const [isFollowing, setIsFollowing] = useState(false);

  async function handleFollow() {
    try {
      const response = await authenticatedFetch(
        `https://api.echo.com/users/${userId}/follow`,
        {
          method: 'POST',
        }
      );

      const data: FollowUserResponse = await response.json();

      if (data.success) {
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  }

  return (
    <Button onPress={handleFollow} disabled={isFollowing}>
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}
```

### 5. Creating a Collection

```tsx
import { useFetch } from '@/lib/api/fetch-wrapper';
import type { CreateCollectionRequest, Collection } from '@/lib/types';

function CreateCollectionForm() {
  const { authenticatedFetch } = useFetch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  async function handleCreate() {
    try {
      const response = await authenticatedFetch(
        'https://api.echo.com/collections',
        {
          method: 'POST',
          body: JSON.stringify({
            name,
            description,
            isPublic,
          } as CreateCollectionRequest),
        }
      );

      const collection: Collection = await response.json();
      alert(`Collection "${collection.name}" created!`);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  }

  return (
    <View>
      <TextInput
        placeholder="Collection name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <Switch value={isPublic} onValueChange={setIsPublic} />
      <Button onPress={handleCreate}>Create Collection</Button>
    </View>
  );
}
```

### 6. Checking Subscription Limits

```tsx
import { useFetch } from '@/lib/api/fetch-wrapper';
import type { SubscriptionUsageCheck } from '@/lib/types';

function AddBookWithLimitCheck({ book }: { book: NormalizedBook }) {
  const { authenticatedFetch } = useFetch();

  async function checkAndAddBook() {
    try {
      // Check if user can add more books
      const checkResponse = await authenticatedFetch(
        'https://api.echo.com/subscriptions/can-add-book'
      );
      const canAdd: SubscriptionUsageCheck = await checkResponse.json();

      if (!canAdd.allowed) {
        alert(
          `Cannot add book: ${canAdd.reason}\nUsage: ${canAdd.usage?.current}/${canAdd.usage?.limit}`
        );
        return;
      }

      // Proceed with adding the book
      const addResponse = await authenticatedFetch(
        'https://api.echo.com/books/add',
        {
          method: 'POST',
          body: JSON.stringify({
            bookData: book,
            status: 'want',
          }),
        }
      );

      const result = await addResponse.json();
      alert('Book added successfully!');
    } catch (error) {
      console.error('Failed to add book:', error);
    }
  }

  return <Button onPress={checkAndAddBook}>Add Book</Button>;
}
```

## Type Guards

Use the provided type guards to safely check API responses:

```tsx
import { isApiError, hasLimitReached } from '@/lib/types';

const response = await authenticatedFetch('/api/endpoint');
const data = await response.json();

if (isApiError(data)) {
  console.error('API Error:', data.error);

  if (hasLimitReached(data)) {
    console.log('Usage:', data.usage.current, '/', data.usage.limit);
  }
}
```

## Available Types

### Database Models
- `User`, `Book`, `UserBook`, `Review`, `Follow`
- `SubscriptionPlan`, `UserSubscription`, `SubscriptionUsage`
- `Collection`, `CollectionBook`, `CollectionFollow`
- `AuditLog`

### Composite Types
- `UserBookWithBook` - UserBook with book details
- `UserBookWithDetails` - UserBook with book and user
- `ReviewWithUser` - Review with user info
- `ReviewWithBook` - Review with book info
- `ReviewWithDetails` - Review with user and book
- `UserWithStats` - User with follower/book counts
- `CollectionWithBooks` - Collection with books
- `UserSubscriptionWithPlan` - Subscription with plan details

### Enums
- `ReadingStatus`: `'want' | 'reading' | 'finished'`
- `UserRole`: `'user' | 'moderator' | 'admin'`
- `BillingInterval`: `'month' | 'year' | 'lifetime' | 'free'`
- `SubscriptionStatus`: `'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete'`

### API Types
- Request/Response types for all major operations
- `ApiError` and `ApiResponse<T>` for error handling
- `PaginatedResponse<T>` for paginated endpoints
