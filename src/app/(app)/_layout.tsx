import { useColors } from "@/lib/theme";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";

/**
 * Library · Friends · You, plus Search as the separate search-role tab.
 * The iOS 26 glass tab bar is the system's; tint is pink-ink.
 */
export default function AppTabsLayout() {
  const { isSignedIn } = useAuth();
  const { t } = useTranslation();
  const colors = useColors();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // TODO(phase 9): blocking username onboarding modal when profile.username is null

  return (
    <NativeTabs tintColor={colors.pinkInk}>
      <NativeTabs.Trigger name="library">
        <NativeTabs.Trigger.Icon sf="books.vertical" md="library_books" />
        <NativeTabs.Trigger.Label>{t("tabs.library")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="friends">
        <NativeTabs.Trigger.Icon sf="person.2" md="group" />
        <NativeTabs.Trigger.Label>{t("tabs.friends")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="you">
        <NativeTabs.Trigger.Icon sf="person" md="person" />
        <NativeTabs.Trigger.Label>{t("tabs.you")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      {/* TODO(phase 5): confirm the system separates this into its own glass button once the
          search screen has a native search bar (r6 shows it apart from the three tabs) */}
      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Label>{t("tabs.search")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
