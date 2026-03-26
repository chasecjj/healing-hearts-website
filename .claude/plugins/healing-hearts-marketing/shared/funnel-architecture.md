# Healing Hearts Funnel Architecture

Unified funnel and scoring system for both marketing tracks. Both Jeff and Trisha Qualifiers feed into this shared model. A booth QR scan at Be Healthy Utah and a LinkedIn click from a physician both add to the same lead score.

---

## Pricing Model

- **Flagship program:** ~$16K high-ticket
- **Sales path:** Application, then sales conversation, then enrollment (both partners required)
- **Standalone packages:** $29-$197 (digital downloads, mini-courses, standalone workshops)
- **Free entry points:** Module 7 preview (3 lessons, Supabase auth required), 7-Day Spark Challenge, lead magnet quiz
- **Team capacity constraint:** Chase + Makayla execute all lead management. Every system must be automatable with tags and simple rules — no manual judgment calls per lead.

---

## Funnel Stages

### Stage 1: Discovery

Entry points by track:

**Jeff track (digital-first, professional channels):**
- LinkedIn posts and articles (Jeff’s personal account, physician-facing)
- Podcast episodes (guest appearances + future HH podcast)
- Physician referrals (colleagues who’ve seen Jeff speak or know the program)
- Google search (“physician marriage,” “doctor divorce rate,” “medical marriage help”)
- Medical society connections (AMA, state medical associations, specialty societies)
- Jeff-authored guest articles in medical publications or blogs

**Trisha track (in-person + community, wellness channels):**
- Conference booths (Be Healthy Utah Expo, wellness fairs, faith-based conferences)
- Instagram posts and carousels (Trisha’s personal account, spouse-facing)
- Facebook community engagement (marriage groups, physician spouse groups, natural health groups)
- 7-Day Spark Challenge (standalone lead magnet with email drip)
- Natural health community referrals (practitioners, influencers, community leaders)
- Wellness podcasts (guest appearances on holistic health and relationship shows)
- Keynote speaking engagements and workshop presentations
- Print materials (magazine ads, booth handouts, QR code cards)

**Goal:** Get them to ONE piece of owned content — a page on healingheartscourse.com where we can begin the capture process.

### Stage 2: Capture

**Mechanism:** The prospect exchanges their email for something valuable. Every capture mechanism collects email + at least one qualifying signal.

**Jeff track capture points:**
- Lead magnet quiz (“Is Your Marriage in Survival Mode?” — captures role, career stage, pain level, readiness)
- Module 7 signup (Supabase auth — captures email + engagement intent)
- Podcast CTA email signup (captures entry source + content preference)
- LinkedIn lead magnet link (captures professional context)

**Trisha track capture points:**
- Booth QR code scan, then Spark Challenge signup (captures in-person engagement + entry source)
- Instagram bio link, then quiz or Spark Challenge (captures content preference)
- Conference workshop signup sheet (captures email + event context)
- Magazine ad QR code, then landing page with email gate (captures offline-to-online bridge)

**What gets stored at capture:**
- Email address
- Segment tag (role + stage + entry source)
- Initial score (demographic + entry method)
- Timestamp (for sequence timing)
- Track origin (jeff-track or trisha-track — informs voice routing)

**Goal:** Email address + segment tag + initial score. Every lead enters the system as a known entity, not an anonymous subscriber.

### Stage 3: Nurture (Phase 1 — active now)

**Mechanism:** Welcome email sequence, then ongoing weekly value emails. Content teaches HH frameworks (Critter Brain, SPARK, Attachment Styles, Invisible Backpack, Color Code) and builds trust over time. Voice matches the track that captured them.

**Jeff-track nurture:**
- Jeff authority sequence for physicians: peer credibility, data-driven insights, clinical anecdotes
- Physician spouse sequence: emotional validation + Jeff’s clinical framing of what their partner is going through

**Trisha-track nurture:**
- Trisha-voiced nurture for natural health seekers: warm, story-driven, grounded in personal experience
- Conference follow-up sequence (accelerated — they’ve already experienced Trisha live, so skip the “who are we” phase)
- Spark Challenge completers: bridge sequence from challenge to Module 7 preview

**Shared nurture paths:**
- Dual-physician sequence: specialized content addressing unique challenges (scheduling conflicts, career competition dynamics, mutual physician conditioning)
- Solo-seeker sequence (“my partner doesn’t know I’m looking”): normalize seeking help alone, teach “how to bring it up” using Critter Brain framing (approach when nervous systems are calm), provide shareable content they can show their partner. Goal: convert solo-seeker to both-partners-engaged. Do NOT disqualify — nurture toward joint participation.

**Goal:** Build trust, teach frameworks, increase engagement score. Every email should leave the reader knowing something they didn’t know before, feeling understood, and wanting the next one.

### Stage 4: Qualification (Phase 2 — post-Stripe)

**Mechanism:** Score threshold triggers application invitation. The system monitors engagement signals and demographic fit to identify who is ready for a conversation.

**How it works:**
1. Lead score crosses “Hot” threshold (51+)
2. System checks: are both partners identified/engaged? If solo-seeker, continue nurture toward joint participation.
3. If both partners engaged + hot score: application invitation email (personalized to their segment)
4. If only one partner + hot score: targeted content designed to bring the other partner in

**Goal:** Self-selection. Right couples apply, wrong ones don’t. The application itself is a qualification tool — it asks about readiness, both partners’ willingness, and expectations.

### Stage 5: Conversion (Phase 2 — post-Stripe)

**Mechanism:** Application review, then sales conversation, then enrollment. Both partners must participate in the sales conversation.

**Process:**
1. Application submitted (both partners’ names, pain points, what they’ve tried, readiness self-assessment)
2. Chase + Makayla review application against qualification criteria
3. Sales conversation scheduled (video call, both partners present)
4. Enrollment decision + payment via Stripe
5. Onboarding into course cohort

**Disqualification at this stage routes to:**
- Licensed therapist referral (acute crisis cases)
- Continued nurture (not ready yet but not disqualified)
- Solo-seeker path (only one partner willing — nurture toward joint)

**Goal:** Fill cohort with qualified couples who are ready, willing (both partners), and able to invest in the full program.

---

## Unified Scoring Model

All signals accumulate into a single lead score regardless of which track captured the lead. Jeff-track and Trisha-track signals are weighted equally — a conference booth interaction is worth just as much as a LinkedIn engagement.

### Demographic Signals (who they are)

| Points | Signal | Notes |
|--------|--------|-------|
| +20 | Physician or physician spouse (confirmed) | Core target audience. Jeff-track weighted but applies universally. |
| +15 | Early career (residency through year 5) | Highest pain window — long hours, new marriage stress, identity crisis. |
| +10 | Dual-physician couple | Unique challenges, high program fit. |
| +5 | Has children | Higher stakes — marriage affects the whole family. |

Demographic signals set the baseline but never determine qualification alone. Engagement signals must outweigh who they are.

### Engagement Signals (what they’ve done)

| Points | Signal | Track |
|--------|--------|-------|
| +10 | Completed lead magnet quiz | Both |
| +15 | Signed up for Module 7 preview | Both |
| +20 | Completed 2+ Module 7 lessons | Both |
| +10 | Opened 3+ emails in nurture sequence | Both |
| +5 | Each podcast episode listened to completion | Both (future — requires listen tracking) |
| +10 | Replied to an email or DM’d | Both |
| +10 | Signed up for Spark Challenge | Both |
| +15 | Completed Spark Challenge (all 7 days) | Both |
| +15 | Scanned booth QR code | Trisha track |
| +20 | Attended keynote talk | Trisha track |
| +10 | Signed up for Spark Challenge at event | Trisha track (stacks with booth QR) |
| +25 | Both partners visited booth together | Trisha track |
| +10 | Followed on Instagram after event | Trisha track |
| +15 | Engaged with Jeff LinkedIn post (comment, not just like) | Jeff track |
| +10 | Downloaded or shared a Jeff article | Jeff track |

### Readiness Signals (how they talk)

| Points | Signal |
|--------|--------|
| +25 | Self-identified as “I need something now” (quiz or email reply) |
| +15 | Asked about pricing or program details |
| +10 | Mentioned prior failed attempts (therapy, books, other programs) |
| +30 | Both partners engaged (not just one seeking) |
| +20 | Used language indicating urgency (“we’re at a breaking point,” “last resort,” “running out of time”) |
| +10 | Referenced a specific HH framework by name (indicates deep content engagement) |

### Thresholds

| Range | Label | Action |
|-------|-------|--------|
| 0-20 | Cold | Stay in content nurture. Weekly value emails. No direct outreach. |
| 21-50 | Warm | Move to deeper email sequence + personal touchpoint (handwritten-style email from Trisha or Jeff). Increase content frequency. |
| 51+ | Hot | Route to application invitation. Personalized outreach. If both partners engaged, send application link. If solo-seeker, send targeted content to bring partner in. |

### Disqualifiers

These remove a lead from the sales pipeline. They do NOT remove the lead from the email list (unless requested) — disqualified leads may still benefit from free content and may re-qualify later.

| Disqualifier | Action |
|--------------|--------|
| Currently in acute crisis (suicidal ideation, domestic violence, active substance abuse) | Immediate referral to licensed therapist or crisis hotline. Do not sell. Do not nurture toward purchase. Provide resources and remove from sales pipeline. |
| Looking for free therapy (not a coaching fit) | Continue in free content nurture but do not route to application. The program is educational coaching, not therapy. |
| Only one partner willing at application stage | Do not proceed to sales conversation. Route to solo-seeker nurture path. The program requires both partners — but solo-seekers are nurtured, not rejected. |
| Adversarial toward partner | Needs therapy first, not coaching. The program requires both partners to be willing participants, not one dragging the other. Refer to couples therapy. |
| Explicitly seeking clinical/diagnostic help | Redirect to appropriate licensed professional. HH is educational, not clinical. Use “explore,” “understand,” “recognize” — never “heal,” “treat,” or “diagnose.” |

---

## Segmentation Tags

Tags are specific enough to route content but simple enough for Chase + Makayla to maintain without manual judgment calls. All tags are automatable via email platform rules.

### Primary Tags

```
role: physician | spouse | dual-physician | natural-health-seeker
stage: residency | early-career | mid-career | late-career
entry: quiz | module-7 | podcast | referral | organic | conference | instagram | spark-challenge | magazine-ad | linkedin | booth-qr
track: jeff | trisha
```

### Behavioral Tags

```
engagement: cold | warming | engaged | hot
content-preference: jeff-teaching | trisha-teaching | emotional-spouse | practical-tools
readiness: exploring | considering | urgent
partner-status: both-engaged | solo-seeker | partner-aware | partner-unaware
```

### Sequence Routing

| Segment Combination | Route To | Rationale |
|---------------------|----------|-----------|
| physician + exploring | Jeff authority sequence | Peer credibility, data-driven, clinical anecdotes. Physicians respond to physician voice. |
| spouse + urgent | Empathy-first sequence + fast-track to Module 7 | Emotional validation, hope-forward, practical first steps. Spouse in pain needs to feel seen before anything else. |
| spouse + exploring | Trisha-voiced nurture sequence | Warm, story-driven, personal. Low pressure. |
| dual-physician | Specialized dual-physician sequence | Unique challenges: scheduling, career competition, mutual conditioning. Neither standard physician nor spouse path fits. |
| solo-seeker (any role) | Solo validation sequence | Normalize seeking help alone. Teach “how to bring it up” using Critter Brain framing. Provide shareable content. Goal: convert to both-partners-engaged. |
| natural-health-seeker + exploring | Trisha-voiced nurture sequence | Community alignment, holistic framing, wellness language. |
| conference + engaged | Accelerated nurture | They’ve already seen Trisha live — skip the “who are we” phase. Go straight to framework teaching and Module 7. |
| conference + hot | Application invitation | High-intent in-person leads. Both partners at booth = strongest signal. Route to application quickly. |
| booth-qr + any readiness | Conference follow-up sequence | Time-sensitive — follow up within 24 hours of event. Reference the specific event by name. |
| any + hot | Application invitation sequence (Phase 2) | Score threshold crossed. Check partner-status before sending application. |

---

## Phase 1 / Phase 2 Boundary

**Phase 1 (NOW):** Audience building, capture, segmentation, nurture content. All funnel stages 1-3 are active. The goal is to build a qualified email list, not to sell.

**Phase 2 activates when ALL of the following criteria are met:**

1. **Course content written** — enough modules to deliver on the enrollment promise. Currently: M1-2 rebuilt (needs fixes), M7 live (free preview), M8 migrated. M3-6 not yet written.
2. **Stripe integrated** — HH website Phase 3 (payment processing, enrollment flow, access control beyond preview).
3. **Email list has 100+ qualified subscribers** — “qualified” means tagged, scored, and in active nurture. Not just email addresses.
4. **Content performance baseline exists** — 4+ weeks of Phase 1 data: open rates, click rates, quiz completion rates, Module 7 engagement. Enough data to know what is working.
5. **CRM lead pipeline built and live** — lead storage, scoring automation, event tracking, and application flow all functional. Not spreadsheets.

Until ALL five criteria are met, do not build conversion content, application flows, or sales sequences. Phase 1 work is valuable on its own — a well-segmented, well-nurtured list converts better when Phase 2 activates than a rushed list that was sold to too early.

---

## Inter-Agent Handoffs

Every agent in the marketing system has defined inputs and outputs. These contracts ensure no agent operates in a vacuum and no lead falls through a gap between agents.

| From | To | What Passes | Format |
|------|-----|-------------|--------|
| jeff-scout | jeff-storyteller | Community maps, audience language, trending topics in physician spaces | Structured briefs (tables with community name, size, language patterns, content gaps) |
| trisha-scout | trisha-storyteller | Community maps, audience language, trending topics in wellness/spouse spaces | Structured briefs (tables with community name, size, language patterns, content gaps) |
| jeff-scout | partnership-scout | Vetted influencer/org targets from physician networks | Influencer briefs (name, platform, audience size, alignment score, suggested approach) |
| trisha-scout | partnership-scout | Vetted influencer/org targets from wellness/spouse networks | Influencer briefs (name, platform, audience size, alignment score, suggested approach) |
| jeff-storyteller | jeff-qualifier | Content pieces with CTAs designed for physician audience | Content blocks with CTA type + buyer path tagged (which segment this content targets) |
| trisha-storyteller | trisha-qualifier | Content pieces with CTAs designed for spouse/wellness audience | Content blocks with CTA type + buyer path tagged (which segment this content targets) |
| jeff-qualifier | nurture-writer | Segmented physician-track leads with scores | Segment + score + entry source + track origin + recommended sequence |
| trisha-qualifier | nurture-writer | Segmented trisha-track leads with scores | Segment + score + entry source + track origin + recommended sequence |
| jeff-qualifier | jeff-storyteller | Content gap analysis for physician segments | Segment gap reports (underserved segments, overserved segments, content type gaps) |
| trisha-qualifier | trisha-storyteller | Content gap analysis for spouse/wellness segments | Segment gap reports (underserved segments, overserved segments, content type gaps) |
| nurture-writer | jeff-qualifier | Email engagement data from jeff-track sequences | Open/click/reply signals, then score updates per lead |
| nurture-writer | trisha-qualifier | Email engagement data from trisha-track sequences | Open/click/reply signals, then score updates per lead |
| partnership-scout | jeff-storyteller | Co-branded content needs from physician partnerships | Partnership content specs (partner name, audience, format, deadlines, brand guidelines) |
| partnership-scout | trisha-storyteller | Co-branded content needs from wellness partnerships | Partnership content specs (partner name, audience, format, deadlines, brand guidelines) |
| campaign-analyst | All agents | Performance data + recommendations | Weekly/monthly reports (metrics by segment, by track, by content type, with recommendations) |
