# Billing setup (Google Play + RevenueCat)

Premium is sold in-app through RevenueCat (`react-native-purchases`). The app needs no Android-specific
code: it reads the **current offering**, buys a package, then calls `POST /v1/subscriptions/sync`.
This doc covers the store and dashboard side for Google Play.

What the app expects (keep these in sync with the code):

| Thing | Value | Where in code |
| --- | --- | --- |
| Package name | `app.echoreads.mobile` | `app.json` |
| Entitlement | `premium` | `PREMIUM_ENTITLEMENT` in `src/lib/purchases.ts` |
| Packages in the current offering | `$rc_monthly`, `$rc_annual`, `$rc_lifetime` | `PLAN_TYPES` in `src/components/premium/plan-picker.tsx` |
| SDK key | `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` (`goog_…`) | EAS environment variables (dashboard) + `.env.local` |
| Subscription source | `play_store` | `SubscriptionSourceSchema` in `src/lib/schemas/index.ts` |

Packages with any other identifier are filtered out of the paywall.

## 1. Play Console account

1. Register a developer account and verify identity.
2. **Settings → Payments profile**: set up the merchant account (bank, tax, EU VAT). Nothing can be sold without it.
3. **Create app** with package `app.echoreads.mobile`.
4. Personal accounts created after Nov 2023 must run a closed test with 12+ testers for 14 days before
   production access. Start this early.

## 2. First build

Products can only be created after a build containing the billing permission is uploaded
(`react-native-purchases` adds `com.android.vending.BILLING`).

1. `eas build -p android --profile production` (the production profile builds an AAB).
2. Upload it to **Testing → Internal testing**; opt in to Play App Signing (the EAS keystore is the upload key).
3. Complete the app content declarations (privacy policy, data safety, content rating, ads, target audience).

## 3. Products (Monetize with Play → Products)

**Subscription** — one subscription, two base plans. The backend maps `subscription:basePlan`
(`echo_premium:monthly`) to a plan, so each base plan is its own plan.

- Product ID `echo_premium`
- Base plan `monthly`: auto-renewing, 1 month
- Base plan `yearly`: auto-renewing, 1 year
- Activate both base plans. Offers (e.g. a free trial) are optional.

**Lifetime** — **One-time products**: `echo_premium_lifetime`, activated.

Match the App Store prices. Product IDs allow lowercase letters, digits, `_` and `.`; base plan IDs lowercase
letters, digits and `-`. IDs can't be reused once deleted.

## 4. Service account (RevenueCat ↔ Google)

1. Google Cloud Console: enable **Google Play Android Developer API**, **Google Play Developer Reporting API**
   and **Cloud Pub/Sub**.
2. **IAM → Service accounts**: create one, give it **Pub/Sub Admin**, download a JSON key.
3. Play Console **Users and permissions**: invite the service account email with *View app information and
   download bulk reports*, *View financial data*, *Manage orders and subscriptions*.
4. Google can take up to ~36 h to accept the credentials; RevenueCat shows "invalid credentials" until then.

The same JSON key can be used for `eas submit -p android` (`submit.production.android.serviceAccountKeyPath`).

## 5. RevenueCat

1. In the Echo project: **Apps → + New → Google Play Store**, package `app.echoreads.mobile`, upload the JSON key.
2. Copy the public SDK key (`goog_…`) into the EAS environment variable `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
   (and `.env.local` for local builds). Without it `configurePurchases()` does nothing and the paywall has no plans.
3. **Real-time developer notifications**: connect Google Pub/Sub in the Play app settings in RevenueCat, paste the
   topic ID into Play Console → **Monetize → Monetization setup → Real-time developer notifications**, send a test
   notification.
4. **Products → Import** from Play: `echo_premium:monthly`, `echo_premium:yearly`, `echo_premium_lifetime`.
   Mark the lifetime product **non-consumable**.
5. Attach all three to the `premium` entitlement.
6. In the **current** offering add the Android product to each package:
   - `$rc_monthly` → `echo_premium:monthly`
   - `$rc_annual` → `echo_premium:yearly`
   - `$rc_lifetime` → `echo_premium_lifetime`
7. The RevenueCat → backend webhook is project-wide, so it already covers Android (`src/lib/revenuecat.ts` in
   the `echo` repo handles `play_store`).
8. On echoreads.app, admin → plans: set **Play Store product ID** on each paid plan to `echo_premium:monthly`,
   `echo_premium:yearly` and `echo_premium_lifetime` (subscriptions with the base plan). Without it the sync throws
   "No plan for play_store product …" and the user doesn't get Premium on the server.

## 6. Testing

1. Play Console **Settings → License testing**: add the tester Gmail accounts; also add them to the internal
   track and accept the opt-in link on the device.
2. Install from the internal track (a dev build with the same package name usually works for license testers;
   "item not available" means install from Play).
3. Test purchases are free and renew fast (monthly every 5 min, yearly every 30 min, ~6 renewals).
4. Check: Play prices on the paywall · purchase grants Premium · sync sets `source: "play_store"` · restore after
   reinstall · Settings "Manage" opens Play subscriptions · cancelling flips "Renews" to "Expires".
5. RevenueCat **Customers** should show the purchase under the Clerk user id (`Purchases.logIn` in the root layout).

## 7. Shipping

Promote internal → closed (if required) → production. Billing changes that touch native code ship as a new
store build (bump `version`), not as an OTA update.
