import { queryKeys } from "@/hooks/query-keys";
import { useProfileApi } from "@/lib/api/profile";
import { PREMIUM_ENTITLEMENT } from "@/lib/purchases";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Purchases, { type CustomerInfo } from "react-native-purchases";

export const useRestorePurchases = () => {
  const { syncSubscription } = useProfileApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const customerInfo: CustomerInfo = await Purchases.restorePurchases();
      // Best effort: the store already charged; if this fails the RevenueCat webhook catches up
      await syncSubscription().catch(() => undefined);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.profile, exact: true }),
        queryClient.invalidateQueries({ queryKey: queryKeys.subscription }),
      ]);
      return { premium: customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined };
    },
  });
};
