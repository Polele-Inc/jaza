# In-app purchases (RevenueCat)

Host apps that sell credit packs through Apple / Google should:

1. Use **RevenueCat** (`react-native-purchases` / Purchases) in the app.
2. `Purchases.logIn(jazaCustomerId)` so webhook `app_user_id` matches the Jaza customer.
3. Map store product ids to Jaza bundle `revenueCatProductId`.
4. Point RevenueCat’s server webhook at Jaza `POST /v1/webhooks/revenuecat`.

Jaza credits the wallet and emits `jaza.webhook.topUp.completed`. It does **not** credit the app settlement wallet — store payouts go to the host app.

See `jaza-dev-docs/guides/iap-revenuecat.mdx`. This package does not depend on RevenueCat; compose it in the host app (future public SDK docs will describe the same pattern).
