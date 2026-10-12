import { useProfile } from "@/hooks/api/user/use-get-me";
import { isApiRequestError } from "@/lib/api/errors";
import { useRouter } from "expo-router";
import { useCallback } from "react";

/**
 * Collections are Premium (API.md §8). `guard(action)` runs the action for Premium
 * readers and opens the paywall for everyone else; `isPaywallError` catches a 403 from a
 * collection call (e.g. Premium lapsed) so the caller can open the paywall too.
 */
export function usePremiumGate() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const isPremium = !!profile?.isPremium;

  const openPaywall = useCallback(() => router.push("/premium"), [router]);
  const guard = useCallback(
    (action: () => void) => () => (isPremium ? action() : openPaywall()),
    [isPremium, openPaywall],
  );

  return { isPremium, guard, openPaywall };
}

export const isPaywallError = (e: unknown) => isApiRequestError(e) && e.statusCode === 403;
