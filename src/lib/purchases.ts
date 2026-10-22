import { Platform } from "react-native";
import Purchases, { LOG_LEVEL, PURCHASES_ERROR_CODE, type PurchasesError } from "react-native-purchases";

export const PREMIUM_ENTITLEMENT = "premium";

let configured = false;

export function configurePurchases() {
  if (configured || Platform.OS === "web") return;

  const apiKey = Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  });
  if (!apiKey) return;

  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey });
  configured = true;
}

export function purchasesEnabled() {
  return configured;
}

function hasUserCancelled(error: unknown): error is Pick<PurchasesError, "userCancelled"> {
  return typeof error === "object" && error !== null && "userCancelled" in error && typeof error.userCancelled === "boolean";
}

export function isPurchaseCancelled(error: unknown) {
  return (hasUserCancelled(error) && error.userCancelled === true) ||
    (typeof error === "object" && error !== null && "code" in error && error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR);
}
