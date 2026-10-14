import { useSubscription } from "@/hooks/api/profile/use-profile-queries";
import { useProfile } from "@/hooks/api/user/use-get-me";
import { useLibraryLayout } from "@/hooks/use-library-layout";
import { useProfileApi } from "@/lib/api/profile";
import { getErrorMessage } from "@/lib/api/errors";
import { displayName } from "@/lib/books";
import { useTheme, type ColorScheme } from "@/lib/theme-context";
import { useClerk } from "@clerk/expo";
import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

const SITE = "https://echobook.club";

/** Everything the Settings screen shows and does, independent of how it's drawn */
export function useProfileQueriesForSettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { signOut } = useClerk();
  const profile = useProfile();
  const subscription = useSubscription();
  const { themeMode, setColorScheme } = useTheme();
  const [layout, setLayout] = useLibraryLayout();
  const { deleteAccount } = useProfileApi();

  const me = profile.data;
  const sub = subscription.data;
  const lifetime = sub?.plan?.interval === "lifetime";
  const fmt = (iso: string | null | undefined) =>
    iso ? new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso)) : "";

  // "Paid once 4 Mar 2026" for lifetime; "Renews"/"Expires" for periodic plans
  const planDate = !me?.isPremium
    ? null
    : lifetime
      ? { label: t("settings.paidOnce"), value: fmt(sub?.subscription?.currentPeriodStart) }
      : sub?.subscription?.currentPeriodEnd
        ? {
            label: sub.subscription.cancelAtPeriodEnd ? t("settings.expires") : t("settings.renews"),
            value: fmt(sub.subscription.currentPeriodEnd),
          }
        : null;

  const open = (path: string) => WebBrowser.openBrowserAsync(`${SITE}${path}`);

  const doSignOut = async () => {
    await signOut();
    queryClient.clear();
  };

  return {
    name: me ? displayName(me) : "",
    email: me?.email ?? "",
    user: me,
    isPremium: !!me?.isPremium,
    planName: me?.planName ?? t("settings.premium"),
    lifetime,
    planDate,
    themeMode,
    setThemeMode: (mode: ColorScheme) => setColorScheme(mode),
    layout,
    setLayout,
    version: t("settings.version", {
      version: Constants.expoConfig?.version ?? "",
      build: Constants.expoConfig?.ios?.buildNumber ?? "1",
    }),
    editProfile: () => router.push("/edit-profile"),
    getPremium: () => router.push("/premium"),
    billing: () => open("/subscription"),
    terms: () => open("/documents/terms-of-service"),
    privacy: () => open("/documents/privacy-policy"),
    signOut: () =>
      Alert.alert(t("settings.signOutConfirm"), undefined, [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("settings.signOut"), style: "destructive", onPress: doSignOut },
      ]),
    deleteAccount: () =>
      Alert.alert(t("settings.deleteTitle"), t("settings.deleteBody"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.deleteConfirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
              await doSignOut();
            } catch (e) {
              Alert.alert(getErrorMessage(e));
            }
          },
        },
      ]),
  };
}
