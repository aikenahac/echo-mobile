import { useAuth } from '@clerk/clerk-expo';
import { useCallback } from 'react';
import { fetch } from 'react-native-nitro-fetch';

interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

/**
 * Base fetch wrapper that adds authorization token
 */
async function fetchWithAuth(url: string, token: string | null, options: FetchOptions = {}) {
  const headers = new Headers(options.headers);

  // Add authorization header if token exists
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Add content-type if not already set and body exists
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Custom hook for authenticated fetch requests
 * Automatically adds the Clerk authentication token to all requests
 *
 * @example
 * const { authenticatedFetch } = useFetch();
 * const response = await authenticatedFetch('/api/user');
 * const data = await response.json();
 */
export function useFetch() {
  const { getToken } = useAuth();

  const authenticatedFetch = useCallback(
    async (endpoint: string, options: FetchOptions = {}) => {
      const token = await getToken();
      console.log({ token });

      const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "https://echobook.club/api";
      const url = baseUrl + endpoint;

      return fetchWithAuth(url, token, options);
    },
    [getToken]
  );

  return { authenticatedFetch };
}
