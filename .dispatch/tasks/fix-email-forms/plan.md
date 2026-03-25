# Fix Email Forms — Plan

**Task:** Fix broken email forms and incorrect email addresses on the Healing Hearts website.
**Date:** 2026-03-23

## Issues Found

1. **Wrong email domain in Contact.jsx** — 4 instances of `hello@healingheartscoaching.com` (wrong domain, doesn't exist) should be `hello@healingheartscourse.com`
2. **Contact form API doesn't send emails** — `api/contact.js` has Resend integration commented out as TODO. Form returns success but never actually delivers the message.
3. **MagneticButton submit behavior** — Need to verify the MagneticButton wrapper in the contact form actually triggers form submission.

## Checklist

- [x] Fix wrong email domain in Contact.jsx (4 occurrences: line 57, 64, 275, 303-304) — replaced `healingheartscoaching.com` → `healingheartscourse.com`. Also fixed 2 in Layout.jsx (footer) and 2 in Privacy.jsx. Total: 8 occurrences fixed across 3 files.
- [x] Wire up Resend email sending in api/contact.js — added team notification email (with replyTo) + confirmation email to submitter, with HTML templates matching spark-signup style
- [x] Verify MagneticButton submit behavior in contact form — renders native `<button>` which defaults to type="submit" inside form, works correctly
- [x] Verify Spark Challenge form and API are working correctly — API uses Resend correctly with guard on API key, sends welcome email + team notification. Form handles idle/loading/success/error states. No issues found.
- [x] Run build to confirm no errors — `npm run build` passes, 1897 modules transformed, 2.50s build time
- [x] Write output.md summary
