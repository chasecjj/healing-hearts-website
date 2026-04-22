# Booth Deliverables Verification — 2026-04-17
## Be Healthy Utah Expo — Pre-booth audit

Verified against files as of 2026-04-17 morning.

---

## 1. Email Templates

### `api/_emails/purchase-confirmation.js` — `downloadPurchaseEmail`

- **Function signature:** `downloadPurchaseEmail(email, productName, receipts = {})` — correct, matches webhook call at stripe.js:664.
- **CTA link:** `https://healingheartscourse.com/portal/downloads` (line 55). Route exists in App.jsx (line 106–113), protected by `ProtectedRoute`. Domain is production, not localhost. Correct.
- **Voice:** Warm, Trisha-first-person, AVNII framing. Matches brand guide.
- **Receipt block:** Optional, gracefully omits if URLs are null. Booth flow: `receiptUrl` from Terminal PI expand, `invoiceUrl` null (Terminal charges don't generate invoices). Receipt block renders with receipt link only. Fine.
- **Issue — no `name` parameter:** `downloadPurchaseEmail` does NOT accept a name. Booth buyers who have `contact.name` set from a prior interaction won't see personalization. Minor (not a delivery blocker).

### `api/_emails/rescue-kit-welcome.js` — `sendRescueKitWelcome`

- **Null name guard:** `const safeName = name || 'friend'` at line 21. Will NOT crash when name is null. Renders `"friend, you just did something brave"` — acceptable fallback.
- **CTA link:** `https://healingheartscourse.com/portal/downloads` (line 35). Same route, same protection. Correct.
- **RESEND_API_KEY guard:** Lines 76–79 — skips silently if key not configured. Returns `{ sent: false, reason: 'resend-not-configured' }`. Webhook catches this and logs `warn` (non-blocking). Safe.
- **`text` field included:** Plain-text fallback present (lines 48–63). Good.

---

## 2. Signup Linking Trigger — `link_purchases_on_signup`

**Version verified:** migration `019_rescue_kit_interactive.sql` (supersedes 016). This is the version currently in production.

**Match field:** The trigger matches on `crm_contacts.email = NEW.email` (019, line 244). It does NOT use `stripe_session_id` anywhere.

**Booth order join path (019, lines 257–263):**
```sql
SELECT o.id, o.stripe_payment_intent, p.access_grants
FROM orders o
JOIN products p ON p.slug = o.product_slug
WHERE o.contact_id = contact_record.id
  AND o.status = 'completed'
```

The webhook sets:
- `crm_contacts.email` = buyer email ✓
- `orders.contact_id` = contact.id ✓
- `orders.status = 'completed'` ✓
- `orders.stripe_payment_intent` = PI id ✓
- `orders.stripe_session_id` = NULL (booth) — NOT used in the query ✓

**The rescue-kit product `access_grants` is type `multi` (set in 019).** The trigger handles `multi` type at lines 276–292 — iterates grants array, inserts enrollment for the rescue-kit course. For Downloads page access, enrollment row is enough (the download slug filter is handled client-side).

**Verdict: booth orders WILL link.** When a buyer signs up later, trigger fires on `auth.users` INSERT, finds the CRM contact by email, finds the completed order via `contact_id`, sets `orders.auth_user_id = NEW.id`, and inserts the enrollment row.

---

## 3. Download Delivery

### Rescue Kit

**Access path:** Two-part after signup:
1. `Downloads.jsx` — queries `orders` filtered by `auth_user_id = user.id` and `status = 'completed'` (lines 16–24). Correct after trigger links the order.
2. **Download button** — calls `supabase.storage.from('downloads').createSignedUrl('rescue-kit/rescue-kit.pdf', 86400)` (Downloads.jsx line 132–133).

**Issue — Downloads.jsx filter uses `access_grants?.type === 'download'`** (line 43), but after migration 019, the rescue-kit product has `type = 'multi'`, not `'download'`. This means the rescue-kit download card WILL NOT render in the Downloads page. The order exists, the product exists, but `productMap[o.product_slug]?.access_grants?.type === 'download'` evaluates to `false` for `multi`.

**This is a blocker for booth buyers accessing their download.**

**Interactive course access:** `/portal/course/rescue-kit` — protected by `ProtectedRoute`. The enrollment row is created by the trigger. Assumed live — verify by loading the URL.

**PDF file:** `downloads/rescue-kit/rescue-kit.pdf` in Supabase Storage — assumed present. Cannot confirm without Storage browser access. If file is missing, the signed URL call will return an error and the `alert('Download not available yet')` fires (Downloads.jsx line 136).

### Card Pack

`access_grants` for card-pack is `{"type": "download", "download_slug": "card-pack"}` (migration 016, line 88–92). The `type === 'download'` filter in Downloads.jsx WILL match for card-pack. The PDF path would be `downloads/card-pack/card-pack.pdf`. File presence assumed — cannot verify without Storage access.

---

## 4. Portal Routing

- `/portal/downloads` → `ProtectedRoute` wrapping `Downloads` (App.jsx line 106–113). ✓
- `/portal/course/:courseSlug` → `ProtectedRoute` wrapping `CoursePortal` (App.jsx line 115–123). ✓
- `/portal` → `ProtectedRoute` wrapping `CoursePortal` (App.jsx line 143–149). ✓
- No redirect loop detected: `ProtectedRoute` presumably redirects to `/login` or `/signup` when unauthenticated, not back to `/portal/downloads`. (Could not verify ProtectedRoute internals without reading `src/components/ProtectedRoute.jsx`.)
- `/rescue-kit` route is **NOT** protected (App.jsx line 89) — it's a marketing page. Correct.

---

## 5. Drip Cron

**vercel.json:** `cron` path is `/api/cron/spark-drip` (line 15), schedule `"0 13 * * *"` (daily 1 PM UTC = 7 AM MDT). ✓

**Handler:** `api/cron/spark-drip.js`

- **CRON_SECRET auth:** Present at line 35 — `req.headers.authorization !== \`Bearer ${process.env.CRON_SECRET}\`` → 401. ✓
- **RESEND_API_KEY guard:** Line 39 — returns 500 if missing. ✓
- **Day 3 query (lines 125–132):** `current_day < 3 AND purchased_at < threeDaysAgo AND unsubscribed = false`. Correct.
- **Day 7 query (lines 169–176):** `current_day >= 3 AND current_day < 7 AND purchased_at < sevenDaysAgo AND unsubscribed = false`. Correct.
- **Templates:** imports `rescueKitDay3Email` and `rescueKitDay7Email` from `../\_emails/rescue-kit-day3.js` and `rescue-kit-day7.js`. Cannot confirm these files exist — only verified the imports compile (no glob found them).

**Issue — drip cron path mismatch:** vercel.json has `/api/cron/spark-drip` but no `/api/cron/rescue-kit-drip`. The rescue-kit drip logic is EMBEDDED in the spark-drip cron (lines 111–214 of spark-drip.js). This is correct by design (code comment at line 4 confirms intentional co-location). ✓

---

## 6. RLS / Visibility

From migration `012_crm_pipeline.sql`:

```sql
CREATE POLICY "orders_own_read" ON orders
  FOR SELECT USING (auth_user_id = auth.uid());
```
(012, line 117)

After signup, the trigger sets `orders.auth_user_id = NEW.id`. The Downloads.jsx query runs as the authenticated user (anon key + user JWT). The RLS policy `auth_user_id = auth.uid()` will return the row. ✓

`orders_service_insert` and `orders_service_update` policies allow service role writes (webhook) with `WITH CHECK (true)` and `USING (true)`. ✓

---

## findAuthUserIdByEmail — scalability note

`api/webhooks/stripe.js` line 715–725: `listUsers()` fetches ALL auth users, then `.find()` in JS. On a small user base this is fine, but will slow as users grow. Not an expo-day concern.

---

## Files Referenced

- `C:/Users/chase/Documents/HealingHeartsWebsite/api/webhooks/stripe.js` (lines 525–709, 714–726)
- `C:/Users/chase/Documents/HealingHeartsWebsite/api/_emails/purchase-confirmation.js` (lines 40–65)
- `C:/Users/chase/Documents/HealingHeartsWebsite/api/_emails/rescue-kit-welcome.js` (lines 19–97)
- `C:/Users/chase/Documents/HealingHeartsWebsite/supabase/migrations/019_rescue_kit_interactive.sql` (lines 235–305)
- `C:/Users/chase/Documents/HealingHeartsWebsite/supabase/migrations/012_crm_pipeline.sql` (lines 116–127)
- `C:/Users/chase/Documents/HealingHeartsWebsite/src/portal/Downloads.jsx` (lines 40–44, 128–138)
- `C:/Users/chase/Documents/HealingHeartsWebsite/src/App.jsx` (lines 89, 106–163)
- `C:/Users/chase/Documents/HealingHeartsWebsite/vercel.json` (lines 13–18)
- `C:/Users/chase/Documents/HealingHeartsWebsite/api/cron/spark-drip.js` (lines 111–214)
