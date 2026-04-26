# Post-Webinar Cleanup Handoff — Apr 23 2026

**Date generated:** 2026-04-25  
**Webinar:** Spark Challenge Live Q&A with Trisha — Apr 23 7 PM MT  
**Webinar ID:** `cf709b00-a5c8-4313-a668-0211a5775a29`

## Summary

A post-webinar cleanup agent was invoked to flip the webinar status to `completed`, unblock the follow-up drip, clean up 35 orphaned registrations, and add a cascade-delete FK to prevent future orphans. The agent has **no Supabase MCP access**, so it generated SQL scripts and a migration file for Chase to apply locally. Nothing was executed against the database.

**Why status flip matters:** The webinar-cron (daily at 5 PM MT) only fires follow-ups for webinars with `status IN ('completed', 'evergreen')`. If the Apr 23 webinar is still `'scheduled'`, templates 1 and 2 never fired. Template 3 (afterDays=3) is due tonight (~5 PM MT Apr 26). Flipping status now unblocks it.

## Files Generated

| File | Purpose |
|------|-------|
| `scripts/post-webinar-apr23-cleanup.sql` | Status flip + drip-state report + orphan-cleanup options |
| `supabase/migrations/034_webinar_cascade_delete_fk.sql` | Drops/recreates FK with ON DELETE CASCADE |
| `docs/handoffs/2026-04-25-post-webinar-cleanup.md` | This file |

## Actions Chase Must Take (Next Local Session)

1. **Run the status flip + verification** via Supabase MCP:
   ```
   Run scripts/post-webinar-apr23-cleanup.sql (Steps 1 + 2 only)
   ```
   Confirm the `status` column now reads `completed` and review the follow-up counts.

2. **Read the follow-up counts output.** Expect the bulk of rows at `followup_day = 2`. If you see many rows stuck at `followup_day = 0` or `1` with `followup_completed = false`, those contacts missed templates 1 and 2 — you may want to manually trigger those sends via Resend or accept the gap.

3. **Decide on orphan cleanup** (Step 3 of the SQL file). Two options:
   - **Delete** (`OPTION A`) — recommended; these contacts registered for deleted webinars months ago and have never received any drip email.
   - **Migrate** (`OPTION B`) — re-attaches all 35 to the Apr 23 webinar so they receive template 3 tonight. Only do this if the contact lists are related to this event.

   Uncomment the chosen block in `scripts/post-webinar-apr23-cleanup.sql` and run it.

4. **Apply the cascade-delete migration:**
   ```bash
   supabase migration up
   ```
   This runs `034_webinar_cascade_delete_fk.sql` against the linked project (`qleojrlqnbiutyhfnqgb`).

5. **Verify template 3 fires tonight.** After 5 PM MT, check Vercel logs for `[webinar-cron]` entries confirming emails were dispatched.

## Open Questions

- **replay_url**: Does a recording exist? If yes, set it manually:
  ```sql
  UPDATE public.webinars SET replay_url = '<your-url>'
  WHERE id = 'cf709b00-a5c8-4313-a668-0211a5775a29';
  ```
  The follow-up email templates likely reference `replay_url` — leaving it null may produce broken links in template 2/3.

- **Orphan decision**: Delete or migrate the 35 stranded rows? (See Step 3 above.)

- **Missed templates 1 & 2**: If many rows show `followup_day < 2`, how do you want to handle the contacts who never got the first two follow-ups? Manual Resend send? Accept the gap?

## Verification Checklist

- [ ] Supabase: `webinars.status = 'completed'` for Apr 23 webinar
- [ ] Supabase: follow-up counts show expected distribution (most at `followup_day = 2`)
- [ ] Resend dashboard: outbound emails for template 1 (Apr 23 evening) and template 2 (Apr 24 evening) — check delivery counts
- [ ] Vercel logs: `[webinar-cron]` entries present for Apr 23–24 (if status was already correct) or absent (confirming drip was blocked)
- [ ] Migration 034 applied (`supabase migration list` shows it as applied)
- [ ] Orphan rows resolved (0 rows returned by the orphan-count query)
