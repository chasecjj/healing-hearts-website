# Email + Landing Page Conversion Alignment Review

- [x] Read all 7 Spark Challenge email templates (api/emails/spark-day-1.js through spark-day-7.js) and the shared email chrome (api/emails/spark-shared.js)
- [x] Read the Email Copy Agent context files for review framework: ~/.claude/plugins/healing-hearts-email/context/ (anti-shame-rules.md, avnii-framework.md, deliverability-rules.md, email-types.md, sequence-design.md, subject-line-rules.md)
- [x] Read the redesigned Spark Challenge landing page at src/pages/SparkChallenge.jsx — internalize the 10-section structure, messaging, and amber/coral palette
- [x] Audit email subject lines against subject-line-rules.md — 7 critical violations found (descriptive formula, no rotation, no curiosity gap, no preview text, shared-device risk)
- [x] Audit email body content against AVNII framework — Validate/Normalize stages systematically missing across all 7 emails; no solo-subscriber validation; no reply prompts in Phase 1
- [x] Check cross-channel alignment: pain point themes overlap well but landing page is more visceral/poetic vs emails are warm/narrative. Acceptable gap. Objection handling "phone scrolling" comment is slightly shame-adjacent.
- [x] Check the email-to-landing-page handoff: CRITICAL — "View the Challenge" CTA in all emails links to signup page, confusing for already-enrolled subscribers
- [x] Produce a prioritized improvement report with specific rewrites for the top 5 highest-impact changes
- [x] Write all findings to .dispatch/tasks/email-landing-review/output.md
