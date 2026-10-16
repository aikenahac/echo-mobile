import { CapsuleButton } from "@/components/echo";
import { queryKeys } from "@/hooks/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AppState } from "react-native";

const SUBSCRIBE_URL = "https://echoreads.app/subscription";

/**
 * The one place the Premium purchase happens (HANDOFF.md open decision 1).
 * For now: "Continue on echoreads.app" in the browser, then refresh /profile when the
 * app comes back so isPremium updates. Swap this component's body for in-app purchase
 * (or the external-purchase link entitlement) without touching the paywall.
 */
export function PremiumCTA() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const opened = useRef(false);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && opened.current) {
        opened.current = false;
        queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      }
    });
    return () => sub.remove();
  }, [queryClient]);

  return (
    <CapsuleButton
      title={t("premium.continue")}
      icon="arrow.up.right"
      iconTrailing
      variant="field"
      onPress={async () => {
        opened.current = true;
        await WebBrowser.openBrowserAsync(SUBSCRIBE_URL);
        // The in-app browser returns without an AppState change; refresh here too
        queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      }}
      style={{ minHeight: 56 }}
    />
  );
}
