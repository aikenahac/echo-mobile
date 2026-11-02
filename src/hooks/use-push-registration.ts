import { useNotificationsApi } from "@/lib/api/notifications";
import { Sentry } from "@/lib/sentry";
import { STORAGE_KEYS, storage } from "@/lib/storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { type Href, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

type PushPermissionStatus = Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>["status"];

const permissionListeners = new Set<(status: PushPermissionStatus) => void>();

function publishPermissionStatus(status: PushPermissionStatus) {
  permissionListeners.forEach((listener) => listener(status));
}

export async function requestPushPermission(): Promise<PushPermissionStatus> {
  storage.set(STORAGE_KEYS.PUSH_PERMISSION_ASKED, true);
  const { status } = await Notifications.requestPermissionsAsync();
  publishPermissionStatus(status);
  return status;
}

export function usePushPermission() {
  const [status, setStatus] = useState<PushPermissionStatus | null>(null);

  useEffect(() => {
    permissionListeners.add(setStatus);
    Notifications.getPermissionsAsync()
      .then((permissions) => setStatus(permissions.status))
      .catch((error: unknown) => Sentry.captureException(error));
    return () => {
      permissionListeners.delete(setStatus);
    };
  }, []);

  const request = useCallback(async () => {
    try {
      return await requestPushPermission();
    } catch (error: unknown) {
      Sentry.captureException(error);
      return null;
    }
  }, []);

  return { status, request };
}

const CHANNELS = ["follows", "activity", "reviews", "collectionFollows", "announcements"] as const;

export function usePushRegistration() {
  const { t } = useTranslation();
  const router = useRouter();
  const lastResponse = Notifications.useLastNotificationResponse();
  const handledResponseIds = useRef(new Set<string>());
  const { registerToken } = useNotificationsApi();
  const permission = usePushPermission();

  const handleResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const id = response.notification.request.identifier;
      if (handledResponseIds.current.has(id)) return;
      handledResponseIds.current.add(id);

      // So a later launch doesn't open the same notification again
      Notifications.clearLastNotificationResponse();

      const url = response.notification.request.content.data?.url;
      if (typeof url === "string" && url.startsWith("/")) router.push(url as Href);
    },
    [router],
  );

  useEffect(() => {
    if (lastResponse) handleResponse(lastResponse);
  }, [handleResponse, lastResponse]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
    return () => subscription.remove();
  }, [handleResponse]);

  useEffect(() => {
    if (!Device.isDevice || permission.status === null) return;
    if (Platform.OS !== "ios" && Platform.OS !== "android") return;
    const platform = Platform.OS;

    let cancelled = false;
    const register = async () => {
      try {
        if (platform === "android") {
          await Promise.all(
            CHANNELS.map((channel) =>
              Notifications.setNotificationChannelAsync(channel, {
                name: t(`settings.notificationChannels.${channel}`),
                importance: Notifications.AndroidImportance.DEFAULT,
              }),
            ),
          );
        }

        if (
          permission.status === "undetermined" &&
          !storage.getBoolean(STORAGE_KEYS.PUSH_PERMISSION_ASKED)
        ) {
          await requestPushPermission();
          return;
        }
        if (permission.status !== "granted" || cancelled) return;

        const token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
          })
        ).data;
        if (cancelled) return;

        await registerToken(token, platform);
        if (!cancelled) storage.set(STORAGE_KEYS.EXPO_PUSH_TOKEN, token);
      } catch (error: unknown) {
        Sentry.captureException(error);
      }
    };

    void register();
    return () => {
      cancelled = true;
    };
  }, [permission.status, registerToken, t]);

  return permission;
}
