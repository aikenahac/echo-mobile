import { useSubscription } from "@/hooks/api/profile/use-profile-queries";
import { useProfile } from "@/hooks/api/user/use-get-me";
import { useUpdateProfile } from "@/hooks/api/user/use-update-me";
import { queryKeys } from "@/hooks/query-keys";
import { useLibraryLayout } from "@/hooks/use-library-layout";
import { useProfileApi } from "@/lib/api/profile";
import { getErrorMessage } from "@/lib/api/errors";
import { displayName, isAdmin } from "@/lib/books";
import { AUDIENCES, type Audience, type User } from "@/lib/schemas";
import { useTheme, type ColorScheme } from "@/lib/theme-context";
import { useClerk } from "@clerk/expo";
import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useTranslation } from "react-i18next";
import { Alert, Linking, Platform } from "react-native";
import Purchases from "react-native-purchases";

const SITE = "https://echoreads.app";

export type PrivacySetting = "profileVisibility" | "activityVisibility" | "reviewVisibility";
export const PRIVACY_SETTINGS: Array<PrivacySetting> = ["profileVisibility", "activityVisibility", "reviewVisibility"];

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
  const updateProfile = useUpdateProfile();

  const me = profile.data;
  const sub = subscription.data;
  // A promo code grants the plan for the code's term, not the plan's interval
  const promo = sub?.subscription?.source === "promo";
  const lifetime = promo ? !sub?.subscription?.currentPeriodEnd : sub?.plan?.interval === "lifetime";
  const fmt = (iso: string | null | undefined) =>
    iso ? new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso)) : "";

  // "Paid once 4 Mar 2026" for lifetime; "Renews"/"Expires" for periodic plans
  const planDate = !me?.isPremium
    ? null
    : lifetime
      ? { label: promo ? t("settings.promoGrant") : t("settings.paidOnce"), value: fmt(sub?.subscription?.currentPeriodStart) }
      : sub?.subscription?.currentPeriodEnd
        ? {
            label: promo || sub.subscription.cancelAtPeriodEnd ? t("settings.expires") : t("settings.renews"),
            value: fmt(sub.subscription.currentPeriodEnd),
          }
        : null;

  const open = (path: string) => WebBrowser.openBrowserAsync(`${SITE}${path}`);

  // Store purchases are managed in the store that sold them; web ones on echoreads.app
  const source = sub?.subscription?.source;
  const storeName =
    source === "app_store" ? t("settings.appStore") : source === "play_store" ? t("settings.playStore") : null;
  const billing = () => {
    switch (source) {
      case "app_store":
        return Platform.OS === "ios"
          ? Purchases.showManageSubscriptions()
          : Linking.openURL("https://apps.apple.com/account/subscriptions");
      case "play_store":
        return Linking.openURL("https://play.google.com/store/account/subscriptions?package=app.echoreads.mobile");
      default:
        return open("/subscription");
    }
  };
  // A store lifetime purchase or a promo grant has nothing to manage
  const canManageBilling = !!me?.isPremium && !promo && !(lifetime && storeName);
  const storeSubscribed = !!storeName && !lifetime && sub?.isActive && !sub.subscription?.cancelAtPeriodEnd;

  // Saved straight away, optimistic on the cached profile
  const setPrivacy = (setting: PrivacySetting, value: Audience) => {
    const previous = me?.[setting];
    const set = (v: Audience | undefined) =>
      queryClient.setQueryData<User>(queryKeys.profile, (data) => (data ? { ...data, [setting]: v } : data));
    set(value);
    updateProfile.mutate({ [setting]: value }, {
      onError: (e) => {
        set(previous);
        Alert.alert(getErrorMessage(e));
      },
    });
  };
  const audienceLabel = (setting: PrivacySetting, value: Audience) => {
    switch (value) {
      case "public":
        return t("settings.audiencePublic");
      case "followers":
        return t("settings.audienceFollowers");
      case "friends":
        return t("settings.audienceFriends");
      case "private":
        return setting === "activityVisibility" ? t("settings.audienceNoOne") : t("settings.audiencePrivate");
    }
  };

  const doSignOut = async () => {
    await signOut();
    queryClient.clear();
  };

  return {
    name: me ? displayName(me) : "",
    isAdmin: !!me && isAdmin(me),
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
    // Absent until the server has privacy settings; the section is hidden then
    privacySettings: me?.profileVisibility && me.activityVisibility && me.reviewVisibility
      ? { profileVisibility: me.profileVisibility, activityVisibility: me.activityVisibility, reviewVisibility: me.reviewVisibility }
      : null,
    setPrivacy,
    audienceLabel,
    audiences: AUDIENCES,
    version: t("settings.version", {
      version: Constants.expoConfig?.version ?? "",
      build: Constants.expoConfig?.ios?.buildNumber ?? "1",
    }),
    editProfile: () => router.push("/edit-profile"),
    blockedUsers: () => router.push("/blocked-users"),
    getPremium: () => router.push("/premium"),
    canManageBilling,
    billing,
    terms: () => open("/documents/terms-of-service"),
    privacy: () => open("/documents/privacy-policy"),
    signOut: () =>
      Alert.alert(t("settings.signOutConfirm"), undefined, [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("settings.signOut"), style: "destructive", onPress: doSignOut },
      ]),
    deleteAccount: () =>
      Alert.alert(
        t("settings.deleteTitle"),
        storeSubscribed ? `${t("settings.deleteBody")}\n\n${t("settings.deleteStoreNote", { store: storeName })}` : t("settings.deleteBody"),
        [
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
