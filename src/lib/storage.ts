import { createMMKV } from "react-native-mmkv";

export const STORAGE_KEYS = {
  LANGUAGE: "app_language",
  THEME: "app_theme",
}

const storage = createMMKV({
  id: "default",
});

/**
 * Retrieves a value from local storage by key.
 * Supports strings, numbers, booleans, and objects (via JSON parsing).
 *
 * @param key - The storage key to retrieve
 * @returns The stored value, or undefined if not found
 */
function getFromLocalStorage<T = string>(key: string): T | undefined {
  const value = storage.getString(key);

  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
}

/**
 * Stores a value in local storage with the specified key.
 * Automatically serializes objects and arrays to JSON.
 *
 * @param key - The storage key
 * @param value - The value to store (string, number, boolean, object, or array)
 */
function setInLocalStorage<T>(key: string, value: T): void {
  const stringValue = typeof value === "string" ? value : JSON.stringify(value);
  storage.set(key, stringValue);
}

function removeFromLocalStorage(key: string): void {
  storage.remove(key);
}

/**
 * Clears all values from local storage.
 * Use with caution as this will delete all stored data.
 */
function clearLocalStorage(): void {
  storage.clearAll();
}

/**
 * Retrieves all keys from local storage.
 *
 * @returns An array of all keys currently in storage
 */
function getAllLocalStorageKeys(): string[] {
  return storage.getAllKeys();
}

/**
 * Checks if a key exists in local storage.
 *
 * @param key - The storage key to check
 * @returns True if the key exists, false otherwise
 */
function localStorageContains(key: string): boolean {
  return storage.contains(key);
}

export {
  clearLocalStorage,
  getAllLocalStorageKeys,
  getFromLocalStorage,
  localStorageContains,
  removeFromLocalStorage,
  setInLocalStorage
};

