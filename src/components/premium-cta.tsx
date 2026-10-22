import { CapsuleButton } from "@/components/echo";
import { usePurchasePackage } from "@/hooks/api/purchases/use-purchase-package";
import { getErrorMessage } from "@/lib/api/errors";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { PACKAGE_TYPE, type PurchasesPackage } from "react-native-purchases";

type Props = {
  pkg: PurchasesPackage | undefined;
  onPurchased: () => void;
};

/**
 * The one place the Premium purchase happens: StoreKit / Google Play Billing through
 * RevenueCat. The backend learns about it from the sync call (and the RevenueCat webhook).
 */
export function PremiumCTA({ pkg, onPurchased }: Props) {
  const { t } = useTranslation();
  const purchase = usePurchasePackage();

  const title = !pkg
    ? t("premium.subscribe")
    : pkg.packageType === PACKAGE_TYPE.LIFETIME
      ? t("premium.buyLifetime", { price: pkg.product.priceString })
      : t("premium.subscribeFor", { price: pkg.product.priceString });

  return (
    <CapsuleButton
      title={title}
      variant="field"
      loading={purchase.isPending}
      disabled={!pkg}
      onPress={() => {
        if (!pkg) return;
        purchase.mutate(pkg, {
          onSuccess: (result) => {
            if (!result.cancelled) onPurchased();
          },
          onError: (error) => Alert.alert(t("premium.purchaseFailed"), getErrorMessage(error)),
        });
      }}
      style={{ minHeight: 56 }}
    />
  );
}
