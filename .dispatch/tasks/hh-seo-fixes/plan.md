# SEO Fixes — P0/P1 (Pre-meeting 2026-04-14)

## Tasks

- [x] 1. Add `X-Robots-Tag: noindex` header for `/upsell` in vercel.json — added noindex,nofollow header before other header rules
- [x] 2. Replace `/physicians` route with `<Navigate to="/physician" replace />` in App.jsx — removed Physicians import
- [x] 3. Verify build passes (`npm run build`) — clean build in 5s, no new warnings
- [x] 4. Write completion marker
