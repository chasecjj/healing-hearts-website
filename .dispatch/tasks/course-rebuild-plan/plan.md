# Course Content Rebuild Plan

## Objective
Restructure seed.sql to match the curriculum registry's 32 sub-module structure and populate stub lessons with real vault content converted to content_json format.

## Phase 1: Structural Alignment
- [x] 1. Restructure Module 1 lessons to match registry (1.1 Making Marriage Work, 1.2 Personality Blueprint, 1.3 The 6 Levels of Intimacy, 1.4 The SPARK of Safety)
- [x] 2. Restructure Module 2 lessons to match registry (2.1 Gaslighting, 2.2 Manipulation, 2.3 Projection, 2.4 Emotional Immaturity)
- [x] 3. Restructure Module 3 lessons to match registry (3.1 From Entangled to Empowered, 3.2 Breaking Free from Enmeshment, 3.3 The Art of Healthy Connection, 3.4 Anxiety and Fear of Abandonment)
- [x] 4. Restructure Module 4 lessons to match registry (4.1 Understanding Attachment Styles, 4.2 My Attachment Map, 4.3 Expressing Needs Without Fear, 4.4 The Art of Active Listening)
- [x] 5. Restructure Module 5 lessons to match registry (5.1-5.2 Meet Your Nervous System, 5.3 Mastering the Flow of Emotion, 5.4 The Nervous System Map) — Note: Combined 5.1-5.2 into one lesson + 5.3 + 5.4 = 3 lessons per registry
- [x] 6. Restructure Module 6 lessons to match registry (6.1 The Connection Map, 6.2 Expanding Your Green Zone, 6.3 The 6 Pillars, 6.4 When Your Green Zone Shrinks)
- [x] 7. Restructure Module 8 to match registry (8.1 Burnout, 8.2 Healthy Coping, 8.3 Financial Freedom w/ F.1-F.4 sub-lessons, 8.4 Future-Proofing) — Changed module_number from 'F' to '8', title from 'Legacy Building' to 'Legacy of Love'

## Phase 2: Vault Content Conversion (real content → content_json)
- [x] 8. Convert Module 6.3 (6 Pillars of Mental Health) — 6 pillars with practices, couples integration, quotes from Trisha. ~30 blocks.
- [x] 9. Convert Module 6.4 (When Your Green Zone Shrinks) — 9 forces that shrink Green Zone, 6 re-expansion steps with practices, closing note. ~40 blocks.
- [x] 10. Convert Module B.1 → 8.1 (Architecture of Exhaustion) — Dr. Mark's story, stress vs burnout, gendered phenotypes, vitals check. ~15 blocks.
- [x] 11. Convert Module F.1 → 8.3 sub-lesson (Financial Nervous System) — Tiger metaphor, attachment styles + money, hidden blueprints, 3-tier practice. ~15 blocks.
- [x] 12. Convert Module F.2 → 8.3 sub-lesson (The Safety Net) — Budget as flashlight, debt snowball/avalanche, Green Zone budget meeting. ~15 blocks.
- [x] 13. Convert Module F.3 → 8.3 sub-lesson (Growing the Oak Tree) — FICO trust score, compound interest, home sanctuary vs investment. ~15 blocks.
- [x] 14. Convert Module F.4 → 8.3 sub-lesson (The Decision Toolbox) — Car lease/buy, mortgage menu, credit card trap, big purchase simulation. ~15 blocks.
- [x] 15. Enhance Module 7.1 (Uncovering the Hidden Blueprint) — 95% vs 5% brain stat, Pink Elephant Principle, 12 Key Principles of the Subconscious. ~20 blocks. Replaced brief "Identifying Core Wounds" stub with full vault content.
- [x] 16. Enhance Module 7.2 (Power of Forgiveness) — Forgiveness ≠ reconciliation, why the system holds on, physical cost of bitterness, forgiveness process practice. ~20 blocks. Enhanced from 4 blocks to ~20.

## Phase 3: Improved Stubs for Modules Without Vault Content
- [x] 17. Write richer stubs for Modules 1.1-1.4 — Used registry metadata for titles/subtitles, key concepts, learning-oriented practices. ~10-15 blocks each.
- [x] 18. Write richer stubs for Modules 2.1-2.4 — Gaslighting, Manipulation, Projection, Emotional Immaturity. Each with core teaching + practice. ~8-10 blocks each.
- [x] 19. Write richer stubs for Modules 3.1-3.4 — Differentiation, Enmeshment, Healthy Connection, Abandonment. 3.3 and 3.4 are MISSING in vault but given substantive stubs.
- [x] 20. Write richer stubs for Modules 4.1-4.4 — Attachment Styles, Attachment Map, Expressing Needs, Active Listening. Each with I Feel/I Need formula, reflective listening. ~10-12 blocks each.
- [x] 21. Write richer stubs for Modules 5.1-5.4 — Critter Brain/CEO Brain, 90-Second Wave, Zones of Resilience. ~10-15 blocks each.
- [x] 22. Write richer stubs for Module 8.2 (Healthy Coping) and 8.4 (Future-Proofing) — Marked as "content being prepared" with meaningful intro + practice.

## Phase 4: Terminology & Finalization
- [x] 23. Fix terminology in all seed.sql content — Zero occurrences of "exercise" as user-facing text (all use "practice"). Zero occurrences of "triggered" (all use "activated"). One "your body" found in "half your body weight" context — literal measurement, not nervous system reference, no change needed.
- [x] 24. Validate seed.sql syntax — All 39 content_json blocks parse as valid JSON. Build succeeds (906KB bundle). 8 modules, 39 lessons total.
- [x] 25. Write completion marker

## Summary
- **File:** `supabase/seed.sql` — 664 lines, 115KB
- **Modules:** 8 (restructured to match curriculum registry)
- **Total lessons:** 39 (up from 26)
- **Real vault content converted:** 9 lessons (~120KB markdown → content_json)
- **Enhanced stubs:** 22 lessons (up from 1-sentence stubs to 8-15 blocks each)
- **Sub-lesson hierarchy:** Module 7.4 (4 sub-lessons), Module 8.3 Financial Freedom (4 sub-lessons)
- **Terminology:** Clean — no banned terms
- **Build status:** Passing
