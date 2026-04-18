# Analytics Swap-In Guide — Meta Pixel + Google Analytics 4

Branch: `feature/pixel-ga-wiring-ready`  
Status: **DO NOT MERGE until real IDs are provisioned**  
Target date: 2026-04-24

---

## What's already done (this branch)

- `src/lib/pixels.js` — tracking helpers with sentinel guards (no network calls when placeholders present)
- `index.html` — Meta Pixel + GA4 script tags gated behind runtime sentinel checks
- `src/main.jsx` — calls `initPixels()` on app boot
- `src/pages/CheckoutSuccess.jsx` — calls `trackPurchase()` after `verifyCheckoutSession` resolves
- `src/pages/SparkChallenge.jsx` — calls `trackLeadSignup({ source: 'spark-challenge' })` on successful form submit
- `src/pages/ConferenceHome.jsx` — calls `trackLeadSignup({ source: 'expo-...' })` on successful form submit

---

## Step 1 — Provision Meta Pixel

1. Go to [Meta Business Manager](https://business.facebook.com) and sign in with the Healing Hearts business account.
2. Navigate to **Events Manager** (left sidebar or via business.facebook.com/events_manager).
3. Click **Connect Data Sources** > **Web** > **Meta Pixel** > **Connect**.
4. Name it `Healing Hearts Website`. Click **Create Pixel**.
5. Copy the **Pixel ID** (15–16 digit number, e.g. `1234567890123456`).
6. Choose **Conversions API + Meta Pixel** if prompted (can add Conversions API later).

---

## Step 2 — Provision Google Analytics 4

1. Go to [Google Analytics](https://analytics.google.com) and sign in with the Healing Hearts Google account.
2. Click **Admin** (gear icon, bottom left).
3. Under **Account**, click **Create Account** if none exists. Name: `Healing Hearts`.
4. Under **Property**, click **Create Property**. Name: `healingheartscourse.com`.
   - Timezone: Mountain Time (US & Canada)
   - Currency: USD
5. Under **Data Collection and Modification** > **Data Streams**, click **Add stream** > **Web**.
6. Enter URL: `https://healingheartscourse.com`, Stream name: `Healing Hearts Web`.
7. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`).

---

## Step 3 — Set Vercel Environment Variables

In Vercel dashboard (vercel.com), navigate to the **healing-hearts-website** project:

1. Go to **Settings** > **Environment Variables**.
2. Add two variables for **Production** AND **Preview** environments:

   | Name | Value |
   |------|-------|
   | `VITE_META_PIXEL_ID` | `1234567890123456` (your real pixel ID) |
   | `VITE_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` (your real measurement ID) |

3. Click **Save** for each.

---

## Step 4 — Update index.html with Real IDs

In `index.html`, the script tags currently contain runtime sentinel guards. After setting env vars, you have two options:

**Option A (recommended) — let Vite inject at build time:**

In `vite.config.js`, add:
```js
define: {
  '__META_PIXEL_ID__': JSON.stringify(process.env.VITE_META_PIXEL_ID || '__META_PIXEL_ID__'),
  '__GA_MEASUREMENT_ID__': JSON.stringify(process.env.VITE_GA_MEASUREMENT_ID || '__GA_MEASUREMENT_ID__'),
}
```

Then update `index.html` script tag sentinels to use the define'd constants.

**Option B (simpler) — replace directly in index.html:**

Replace the two sentinel strings `__META_PIXEL_ID__` and `__GA_MEASUREMENT_ID__` in `index.html` with the real IDs before merging. Also uncomment the `<noscript>` Meta Pixel image tag.

---

## Step 5 — Remove DO NOT MERGE guards

1. Delete the `// [BRANCH_DO_NOT_MERGE_UNTIL_IDS_PROVISIONED]` comment block at the top of `src/lib/pixels.js`.
2. Remove the `[BRANCH_DO_NOT_MERGE_UNTIL_IDS_PROVISIONED]` comment block from `index.html`.
3. Merge to master.

---

## Step 6 — Verify via Meta Event Test Tool

1. In Meta Events Manager, go to your Pixel > **Test Events** tab.
2. Enter your Vercel preview URL (or production URL) and click **Open Website**.
3. Browse to `/spark-challenge` and submit the form.
4. In Event Test Tool, you should see:
   - `PageView` — fires on any page load
   - `Lead` — fires after successful Spark Challenge signup
5. Complete a test purchase (use Stripe test mode) and navigate to `/checkout/success`.
6. Confirm `Purchase` event appears in Event Test Tool with correct value.

---

## Step 7 — Verify via GA4 DebugView

1. In Google Analytics, go to **Admin** > **DebugView**.
2. Install the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension and enable it.
3. Navigate to your site. DebugView should show:
   - `page_view` on every route
   - `generate_lead` after Spark Challenge signup
   - `purchase` after checkout success (with transaction_id, value, items)

---

## Verification Checklist

- [ ] Meta Pixel ID provisioned in Meta Business Manager
- [ ] GA4 Measurement ID provisioned in Google Analytics
- [ ] Both IDs set in Vercel env (Production + Preview)
- [ ] `index.html` sentinel strings replaced with real IDs
- [ ] Preview deployment tested — no 404s or JS errors in console
- [ ] Meta Event Test Tool: PageView, Lead, Purchase all fire correctly
- [ ] GA4 DebugView: page_view, generate_lead, purchase all fire correctly
- [ ] DO NOT MERGE comment blocks removed from `src/lib/pixels.js` and `index.html`
- [ ] Branch merged to master

---

## Conversion Events Summary

| Event | Platform | Trigger | Call Site |
|-------|----------|---------|-----------|
| `PageView` | Meta | App boot | `src/main.jsx` via `initPixels()` |
| `page_view` | GA4 | App boot | `src/main.jsx` via `initPixels()` |
| `Lead` | Meta | Spark Challenge signup success | `src/pages/SparkChallenge.jsx` |
| `generate_lead` | GA4 | Spark Challenge signup success | `src/pages/SparkChallenge.jsx` |
| `Lead` | Meta | Expo email capture success | `src/pages/ConferenceHome.jsx` |
| `generate_lead` | GA4 | Expo email capture success | `src/pages/ConferenceHome.jsx` |
| `Purchase` | Meta | Checkout session verified | `src/pages/CheckoutSuccess.jsx` |
| `purchase` | GA4 | Checkout session verified | `src/pages/CheckoutSuccess.jsx` |
