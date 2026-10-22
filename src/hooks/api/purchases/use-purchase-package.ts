import { queryKeys } from "@/hooks/query-keys";
import { useProfileApi } from "@/lib/api/profile";
import { isPurchaseCancelled, PREMIUM_ENTITLEMENT } from "@/lib/purchases";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Purchases, { type PurchasesPackage } from "react-native-purchases";

export const usePurchasePackage = () => {
  const { syncSubscription } = useProfileApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pkg: PurchasesPackage): Promise<{ cancelled: true } | { cancelled: false; premium: boolean }> => {
      // Only SDK cancellation is a successful no-op; sync errors must still propagate.
      const purchase = await Purchases.purchasePackage(pkg).catch((error: unknown) => {
        if (isPurchaseCancelled(error)) return null;
        throw error;
      });
      if (purchase === null) return { cancelled: true };

      // Best effort: the store already charged; if this fails the RevenueCat webhook catches up
      await syncSubscription().catch(() => undefined);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.profile, exact: true }),
        queryClient.invalidateQueries({ queryKey: queryKeys.subscription }),
      ]);
      return { cancelled: false, premium: purchase.customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined };
    },
  });
};
