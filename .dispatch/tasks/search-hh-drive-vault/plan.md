# Search Vault + Google Drive for Healing Hearts Downloadable Resources

We need to find 4 specific downloadable resources referenced on the Healing Hearts website:
1. **90-Second Wave Guide** — printable one-page reference for riding out emotional floods
2. **SPARK Pact** — printable one-page agreement to use SPARK during conflict
3. **Connection Map** — worksheet identifying which Zone (Red/Yellow/Green/Blue) each partner defaults to
4. **Know Your Blueprint** — personality + attachment discovery worksheet for couples

## Checklist

- [x] **Load the PHEDRIS hub context** — Done. PHEDRIS has SSH-based server tools, Mind Vault MCP tools available for vault search. Drive search would need to go through PHEDRIS server API or SSH.

- [x] **Search the Mind Vault thoroughly** — Done. Searched 8+ terms. Key findings: (1) All 4 resources are listed as "REFERENCED in copy" with "Not confirmed as live download" in the customer journey spec. (2) SPARK Pact content exists in Module 1.4 as an in-lesson exercise (fill-in form). (3) Connection Map is a Module 6.1 concept (assessment tool for emotional energy). (4) Know Your Blueprint maps to Module 1.2 (Hartman Color Code + Love Languages). (5) 90-Second Wave is a Module 5.3 concept. (6) No standalone PDF files exist anywhere. (7) Resources.jsx routes all download buttons to /coming-soon.

- [x] **Search Google Drive via PHEDRIS** — Done. Used PHEDRIS GoogleClient.drive_search_all(). KEY FINDINGS: (1) Connection Map EXISTS as PDF: "Module 6.1 - Healing Hearts Connection Map Worksheet.pdf" on Drive. (2) Blueprint-related: "Module 1.2 - Personality & Love Language Worksheet - Copyright.pdf" exists + "Your Guide to a Deeper Connection: Understanding the Blueprints of Love" (Google Doc). (3) SPARK Pact: NO standalone printable — only full Module 1.4 PDF. (4) 90-Second Wave Guide: NOTHING on Drive.

- [x] **Search the coaching transcripts** — Done. Queried PHEDRIS PostgreSQL `transcripts` table (34 sessions, 312K words). Trisha references "handouts" generically in coaching sessions (Desirae designs them), discusses the 90-second wave concept in teaching sessions, mentions a personality test worksheet (Hartman). No transcript mentions a standalone "SPARK Pact" printable, "Connection Map" worksheet, or "90-Second Wave Guide" by name. Team meeting transcripts (Mar 5, 2026) show Chase argued AGAINST downloadable PDFs on website (content theft risk). These 4 items are FREE lead magnets (different concern than paid content).

- [x] **Check Canva** — Done. No canva.com/design links found in vault. No "Canva" results on Drive search. Meeting notes confirm Desirae uses Canva for module PDF design (handouts, formatted course content), but no evidence of standalone lead magnet PDFs designed in Canva for these 4 resources. Desirae has a task to "design 7-day challenge handouts" (separate from these 4 resources).

- [x] **Write findings to .dispatch/tasks/search-hh-drive-vault/output.md** — Done. Comprehensive report with: status per resource, Drive links, source material locations, effort estimates, action matrix, and context on team PDF policy + email capture gap.
