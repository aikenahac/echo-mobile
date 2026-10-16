import i18n from "i18next";
import type { ApiError } from '@/lib/schemas';
import { z } from 'zod';

/**
 * Custom API Error class
 */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseData?: unknown
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Validation Error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Handle fetch response and check for errors
 */
export async function handleApiResponse<T>(
  response: Response,
  schema?: z.ZodSchema<T>
): Promise<T> {
  // Check if response is ok
  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;
    let responseData: unknown;

    try {
      responseData = await response.json();

      // Check if it's an API error response
      if (
        typeof responseData === 'object' &&
        responseData !== null &&
        'error' in responseData
      ) {
        errorMessage = (responseData as ApiError).error;
      }
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }

    throw new ApiRequestError(errorMessage, response.status, responseData);
  }

  // Parse response JSON
  const data = await response.json();

  // Validate with schema if provided
  if (schema) {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.issues);
        throw new ValidationError('Response validation failed', error);
      }
      throw error;
    }
  }

  return data as T;
}

/**
 * Check if error is an ApiRequestError
 */
export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

/**
 * Check if error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isApiRequestError(error)) {
    return error.message;
  }

  if (isValidationError(error)) {
    return 'Invalid data received from server';
  }

  if (error instanceof Error) {
    // The request never got an answer (offline, timed out, server unreachable)
    if (/NSURLErrorDomain|Network request failed|timed out|Failed to fetch/i.test(error.message)) {
      return i18n.t("common.offline");
    }
    return error.message;
  }

  return 'An unknown error occurred';
}
