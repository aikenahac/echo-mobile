import { queryKeys } from "@/hooks/query-keys";
import { purchasesEnabled } from "@/lib/purchases";
import { useQuery } from "@tanstack/react-query";
import Purchases from "react-native-purchases";

export const useOfferings = () => {
  return useQuery({
    queryKey: queryKeys.offerings,
    queryFn: async () => (await Purchases.getOfferings()).current,
    enabled: purchasesEnabled(),
    staleTime: 60 * 60 * 1000,
  });
};
