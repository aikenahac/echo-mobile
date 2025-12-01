import * as Crypto from 'expo-crypto';
import * as SecureStore from "expo-secure-store";
import { createMMKV } from "react-native-mmkv";
import { z } from "zod";

/**
 * Gets or creates a new encryption key for the MMKV auth secure storage
 */
function getOrCreateEncryptionKey(): string {
  const KEY_ALIAS = 'mmkv_encryption_key';

  let key = SecureStore.getItem(KEY_ALIAS);

  if (!key) {
    key = Crypto.randomUUID();
    SecureStore.setItem(KEY_ALIAS, key);
  }

  return key;
}

const storage = createMMKV({
  id: "secure",
  encryptionKey: getOrCreateEncryptionKey(),
});

export type AuthStorage = z.infer<typeof authStorageSchema>;
const authStorageSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

const AUTH_STORAGE_KEY = "auth_store";

export function getAuthStorage(): AuthStorage | undefined {
  const rawStored = storage.getString(AUTH_STORAGE_KEY);

  if (!rawStored) {
    return undefined;
  }

  const parsed = authStorageSchema.safeParse(rawStored);

  if (!parsed.success) {
    return undefined;
  }

  return parsed.data;
}

export function setAuthStorage(tokens: AuthStorage) {
  storage.set(AUTH_STORAGE_KEY, JSON.stringify(tokens));
}