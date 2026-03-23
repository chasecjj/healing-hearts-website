-- =====================================================
-- Healing Hearts — Seed Data
-- Run AFTER 001_initial_schema.sql
-- Restructured to match curriculum registry (32 sub-modules)
-- Vault content converted to content_json where available
-- =====================================================

-- =====================================================
-- FLAGSHIP COURSE
-- =====================================================

INSERT INTO courses (slug, title, description, price_cents, course_type) VALUES
(
  'healing-hearts-journey',
  'Healing Hearts Program',
  'Our complete 8-module program takes you from the foundations of understanding yourself and your partner all the way through nervous system regulation, subconscious healing, and building a legacy marriage.',
  19700,
  'flagship'
);

-- Get the course ID for FK references
DO $$
DECLARE
  flagship_id uuid;
  mod_id uuid;
  parent_lesson_id uuid;
BEGIN
  SELECT id INTO flagship_id FROM courses WHERE slug = 'healing-hearts-journey';

  -- =====================================================
  -- MODULE 1: LOVE'S FOUNDATION
  -- Understanding Your Unique Design
  -- Registry: 1.1 Making Marriage Work, 1.2 Personality Blueprint,
  --           1.3 The 6 Levels of Intimacy, 1.4 The SPARK of Safety
  -- =====================================================
  INSERT INTO modules (course_id, module_number, title, description, sort_order)
  VALUES (flagship_id, '1', 'Love''s Foundation', 'Understanding your unique design — personality blueprint, attachment style, and the SPARK of Safety.', 1)
  RETURNING id INTO mod_id;

  INSERT INTO lessons (module_id, title, sort_order, content_json) VALUES
  (mod_id, 'Making Marriage Work', 1, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"Making Marriage Work"},
    {"type":"subheading","content":"What the Research Actually Says About Why Couples Succeed or Fail"},
    {"type":"text","content":"Welcome to the very first lesson of Healing Hearts. Before we dive into the deeper work of understanding your nervous system, your subconscious patterns, and the wounds that shape your relationship — we need to start with something powerful and practical: what does the research actually tell us about why some marriages thrive while others slowly erode?"},
    {"type":"text","content":"Dr. John Gottman spent over 40 years studying thousands of couples, and his research revealed something remarkable: he could predict with over 90% accuracy which couples would stay together and which would divorce — just by watching them interact for a few minutes."},
    {"type":"callout","icon":"lightbulb","content":"The difference between couples who last and those who don''t isn''t the absence of conflict. It''s how they handle it. Masters of relationships turn toward each other. Disasters turn away."},
    {"type":"subheading","content":"The Four Horsemen"},
    {"type":"text","content":"Gottman identified four destructive communication patterns that predict relationship failure. He calls them The Four Horsemen:"},
    {"type":"list","items":["Criticism — Attacking your partner''s character instead of addressing a specific behavior. ''You never help around the house'' vs. ''I felt overwhelmed today and could use your help.''","Contempt — Expressing disgust, mockery, or superiority. Eye-rolling, name-calling, sarcasm designed to wound. This is the single greatest predictor of divorce.","Defensiveness — Deflecting responsibility. ''That''s not my fault'' or ''Well, you do it too.'' It shuts down repair.","Stonewalling — Withdrawing completely. Going silent, leaving the room, emotionally checking out. Often a sign of nervous system flooding."],"ordered":false},
    {"type":"callout","icon":"heart","content":"If you recognize these patterns in your relationship, you are not broken. You are human. And the antidotes are learnable skills, not personality transplants."},
    {"type":"subheading","content":"Bids for Connection"},
    {"type":"text","content":"One of Gottman''s most beautiful discoveries is the concept of ''bids for connection'' — the small, everyday moments when one partner reaches out for attention, affirmation, or affection. A bid can be as simple as ''Look at that sunset'' or ''How was your day?''"},
    {"type":"text","content":"Masters of relationships turn toward these bids 86% of the time. Disasters turn toward them only 33% of the time. It''s not the grand gestures that build a marriage — it''s the thousands of tiny moments where you choose to show up."},
    {"type":"exercise","title":"Practice: Bids for Connection","prompt":"This week, pay attention to the small bids your partner makes — and practice turning toward them.","steps":["Notice when your partner says something, shows you something, or reaches for your attention.","Pause what you are doing and give them your presence — even for 10 seconds.","Respond with warmth: eye contact, a smile, a genuine ''Tell me more.''","At the end of each day, reflect: How many bids did I notice today? How many did I turn toward?"]}
  ]}'),
  (mod_id, 'Your Personality Blueprint', 2, '{"estimated_minutes":90,"blocks":[
    {"type":"heading","content":"Your Personality Blueprint"},
    {"type":"subheading","content":"Understanding Your Wiring and Your Partner''s"},
    {"type":"text","content":"Every person walks into a relationship carrying a unique personality blueprint — a combination of core motivations, communication styles, and emotional needs that were shaped long before you said ''I do.''"},
    {"type":"text","content":"In this lesson, you will explore the Hartman Color Code personality framework and the Five Love Languages. Together, these tools help you understand not just what you do, but why — and more importantly, why your partner does things so differently."},
    {"type":"callout","icon":"lightbulb","content":"Understanding your personality type isn''t about putting yourself in a box. It''s about understanding the box you''ve been living in — so you can step out of it when it no longer serves you."},
    {"type":"subheading","content":"The Four Personality Colors"},
    {"type":"list","items":["Red — Driven by power. Direct, decisive, action-oriented. In conflict: can bulldoze. In love: fiercely protective.","Blue — Driven by intimacy. Emotional, detail-oriented, deeply caring. In conflict: can take things personally. In love: profoundly loyal.","White — Driven by peace. Calm, patient, accepting. In conflict: may withdraw or go silent. In love: steady and dependable.","Yellow — Driven by fun. Enthusiastic, social, spontaneous. In conflict: may deflect with humor. In love: brings lightness and joy."],"ordered":false},
    {"type":"text","content":"Most people have a primary and a secondary color. Knowing your partner''s combination helps you understand their motivations — not just their behavior."},
    {"type":"subheading","content":"The Five Love Languages"},
    {"type":"text","content":"Gary Chapman''s Five Love Languages help you understand how you and your partner give and receive love. When you speak your partner''s language, they feel loved. When you don''t, they feel empty — even if you''re trying hard."},
    {"type":"list","items":["Words of Affirmation — ''I appreciate you.'' ''You are doing an amazing job.''","Acts of Service — Doing the dishes. Filling the car with gas. Taking something off their plate.","Receiving Gifts — Thoughtful tokens that say ''I was thinking about you.''","Quality Time — Undivided attention. Phone down. Eyes up.","Physical Touch — A hug, a hand on the shoulder, sitting close."],"ordered":false},
    {"type":"exercise","title":"Practice: Personality & Love Language Discovery","prompt":"Explore your unique design together — without judgment.","steps":["Take the free Hartman Color Code assessment (search ''Hartman Color Code test''). Share your primary and secondary colors with your partner.","Take the Five Love Languages quiz at 5lovelanguages.com. Share your top two languages.","Discuss together: ''Knowing this about you helps me understand why you need _____.''","Identify one recurring conflict pattern that might be explained by your personality or love language differences."]}
  ]}'),
  (mod_id, 'The 6 Levels of Intimacy', 3, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"The 6 Levels of Intimacy"},
    {"type":"subheading","content":"Where Are You Two, Really?"},
    {"type":"text","content":"Intimacy is not a single destination. It is a spectrum — a layered experience that deepens as trust, vulnerability, and safety grow between two people. Most couples know they want to feel ''closer,'' but they struggle to name what''s actually missing."},
    {"type":"text","content":"In this lesson, you will learn to identify the six levels of intimacy so you can see clearly where you are right now — and what the next step forward looks like for your relationship."},
    {"type":"callout","icon":"heart","content":"Intimacy doesn''t start in the bedroom. It starts in the moments when you feel safe enough to be fully seen — and your partner doesn''t look away."},
    {"type":"subheading","content":"The Six Levels"},
    {"type":"list","items":["Level 1: Surface Intimacy — Small talk, logistics, weather. Safe but shallow. This is where roommates live.","Level 2: Intellectual Intimacy — Sharing ideas, opinions, and beliefs. You learn how each other thinks.","Level 3: Emotional Intimacy — Sharing feelings, fears, and dreams. This requires vulnerability and trust.","Level 4: Spiritual Intimacy — Sharing meaning, purpose, and faith. Praying together, dreaming together, aligning on what matters most.","Level 5: Physical Intimacy — Safe touch, affection, and closeness. This includes non-sexual touch that communicates ''You are safe with me.''","Level 6: Sexual Intimacy — The deepest physical expression of trust and connection. This level requires all the others to be healthy."],"ordered":true},
    {"type":"text","content":"Most couples in crisis are living at Levels 1–2. They share a home but not their hearts. The path forward isn''t a giant leap — it''s one level at a time."},
    {"type":"exercise","title":"Practice: Intimacy Level Assessment","prompt":"Honestly assess where you are on the intimacy spectrum — individually and together.","steps":["Read through the six levels above. Privately mark which level feels most true for your relationship right now.","Share your answer with your partner. Listen without defending or correcting.","Ask each other: ''What would it look like to move up just one level?''","Identify one specific action you can take this week to deepen your connection by one level."]}
  ]}'),
  (mod_id, 'The SPARK of Safety', 4, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"The SPARK of Safety"},
    {"type":"subheading","content":"A Step-by-Step System for Repairing After Conflict"},
    {"type":"text","content":"Every couple fights. That is not the problem. The problem is what happens after the fight — or more often, what doesn''t happen. Most couples never fully repair. They just wait until the tension fades, sweep it under the rug, and move on. But the nervous system doesn''t forget."},
    {"type":"text","content":"The SPARK Method\u2122 is a five-step repair framework designed to help you move from conflict to connection — quickly, safely, and with compassion."},
    {"type":"callout","icon":"lightbulb","content":"SPARK stands for: See \u2192 Pause & Probe \u2192 Acknowledge \u2192 Reconnect \u2192 Kindle. Each step is designed to bring your nervous system back into the Green Zone."},
    {"type":"subheading","content":"S — See"},
    {"type":"text","content":"Notice what is happening — in your system and in the room. Name the emotion without blame. ''I notice I''m getting activated right now.'' This is the moment of awareness that changes everything."},
    {"type":"subheading","content":"P — Pause & Probe"},
    {"type":"text","content":"Pause the conversation before it escalates. Use your Pause Number — a predetermined signal (1–10) that tells your partner how close you are to your limit. Then probe gently: ''What am I really feeling underneath this reaction?''"},
    {"type":"subheading","content":"A — Acknowledge"},
    {"type":"text","content":"Acknowledge your partner''s experience without defending yourself. ''I hear you. That hurt. I understand why you feel that way.'' Acknowledgment doesn''t mean agreement. It means ''I see you.''"},
    {"type":"subheading","content":"R — Reconnect"},
    {"type":"text","content":"Once both systems have calmed, reach back toward each other. A soft tone. A gentle touch. A shared breath. ''I don''t want to be on opposite sides of this.''"},
    {"type":"subheading","content":"K — Kindle"},
    {"type":"text","content":"Kindle the flame of connection. Revisit what you love about each other. Make a plan to prevent the same rupture. ''What can we do differently next time?'' This step turns repair into growth."},
    {"type":"divider"},
    {"type":"bold_text","content":"The SPARK Pact"},
    {"type":"text","content":"Consider making a SPARK Pact with your partner: a mutual agreement that when conflict arises, you will both commit to using the SPARK process before the conversation continues. Write it down. Sign it. Put it on the fridge."},
    {"type":"exercise","title":"Practice: Your First SPARK","prompt":"Use the SPARK Method on a low-stakes disagreement this week — something small enough to practice safely.","steps":["Choose a recent minor frustration (not the biggest issue in your marriage).","Walk through each step together, out loud: See, Pause & Probe, Acknowledge, Reconnect, Kindle.","After the practice, debrief: Which step was easiest? Which was hardest?","Identify your Pause Number — the number (1–10) where you need to take a break before continuing."]}
  ]}');

  -- =====================================================
  -- MODULE 2: INVISIBLE CHAINS
  -- Recognizing Toxic Patterns
  -- Registry: 2.1 Gaslighting, 2.2 Manipulation,
  --           2.3 Projection, 2.4 Emotional Immaturity
  -- Status: REVIEW / COMPREHENSIVE (content in PDFs)
  -- =====================================================
  INSERT INTO modules (course_id, module_number, title, description, sort_order)
  VALUES (flagship_id, '2', 'Invisible Chains', 'Recognize toxic patterns hiding in plain sight — gaslighting, manipulation, projection, and emotional immaturity.', 2)
  RETURNING id INTO mod_id;

  INSERT INTO lessons (module_id, title, sort_order, content_json) VALUES
  (mod_id, 'Gaslighting', 1, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"Gaslighting"},
    {"type":"subheading","content":"When Your Reality Gets Rewritten"},
    {"type":"text","content":"Gaslighting is one of the most insidious patterns in relationships because it makes you doubt the one thing you should be able to trust: your own experience. It doesn''t always look like the dramatic scenes in movies. Often, it''s subtle — a gentle rewriting of what happened, a dismissal of what you felt, a slow erosion of your confidence in your own perception."},
    {"type":"callout","icon":"alert","content":"Gaslighting is not just ''being forgetful'' or ''seeing things differently.'' It is a pattern of behavior — intentional or not — that causes you to question your own reality. If you find yourself constantly wondering ''Am I crazy?'' or ''Did that really happen?'' — pay attention."},
    {"type":"text","content":"Common gaslighting phrases include: ''That never happened.'' ''You''re being too sensitive.'' ''I never said that.'' ''You''re imagining things.'' ''Everyone agrees with me.'' Over time, these phrases don''t just hurt — they rewire your trust in yourself."},
    {"type":"text","content":"Some gaslighting is unconscious — learned behavior from families where truth-telling was unsafe. That doesn''t make it okay. But it does mean it can be unlearned."},
    {"type":"exercise","title":"Practice: Reality Anchoring","prompt":"Start keeping a simple log of moments that felt confusing or dismissive in your relationship.","steps":["When something happens that doesn''t feel right, write it down — what happened, what was said, and how you felt.","Don''t analyze it yet. Just record it.","After two weeks, read through your log. Look for patterns.","Share what you notice with a trusted friend, counselor, or your partner if it feels safe to do so."]}
  ]}'),
  (mod_id, 'Manipulation', 2, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"Manipulation"},
    {"type":"subheading","content":"Recognizing Control Disguised as Love"},
    {"type":"text","content":"Manipulation in relationships rarely looks like a villain twirling a mustache. More often, it looks like someone who ''just wants what''s best for you'' — while slowly steering every decision, every friendship, every boundary to serve their comfort."},
    {"type":"text","content":"Manipulation can show up as guilt trips (''After everything I''ve done for you...''), silent treatment (withdrawing love as punishment), love-bombing (overwhelming affection after a conflict to avoid accountability), or moving the goalposts (changing expectations so you can never quite meet them)."},
    {"type":"callout","icon":"lightbulb","content":"The core question to ask yourself: ''Am I making this choice because I want to — or because I''m afraid of what will happen if I don''t?'' If your decisions are driven by fear of your partner''s reaction rather than your own values, manipulation may be at play."},
    {"type":"text","content":"Here is the compassionate truth: people who manipulate often learned it as children. When direct communication wasn''t safe, they learned to get their needs met sideways. Understanding this doesn''t excuse the behavior, but it does open the door to change."},
    {"type":"exercise","title":"Practice: The Freedom Check","prompt":"Evaluate whether your choices in the relationship are truly free.","steps":["Think of a recent decision you made in your relationship — large or small.","Ask yourself honestly: Did I make this choice freely, or was I managing my partner''s reaction?","If fear was a factor, name the specific fear: rejection, anger, silence, withdrawal.","Write down what you would have chosen if you felt completely safe."]}
  ]}'),
  (mod_id, 'Projection', 3, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"Projection"},
    {"type":"subheading","content":"The Mirror You Don''t Know You''re Holding"},
    {"type":"text","content":"Projection is when you attribute your own unresolved feelings, wounds, or fears onto your partner — without realizing you''re doing it. It''s one of the most common and least recognized patterns in relationships."},
    {"type":"text","content":"For example: You feel guilty about something, so you accuse your partner of being dishonest. You feel inadequate, so you criticize your partner for not being enough. You''re afraid of abandonment, so you interpret every late text as proof they''re pulling away."},
    {"type":"callout","icon":"lightbulb","content":"The things that bother you most about your partner are often mirrors reflecting something unresolved in you. That''s not a judgment — it''s an invitation to look deeper."},
    {"type":"text","content":"Projection isn''t lying. It''s your subconscious mind trying to make sense of uncomfortable internal experiences by placing them outside yourself. When you learn to recognize projection, you stop fighting your partner and start facing your own healing."},
    {"type":"exercise","title":"Practice: The Mirror Question","prompt":"The next time you feel intensely frustrated with your partner, pause and ask yourself these questions.","steps":["What am I accusing my partner of? Name the specific quality or behavior.","Is there any way this quality also lives in me — perhaps in a different form?","What feeling does this situation activate in me? (Fear, shame, inadequacy, helplessness?)","When is the earliest time I remember feeling this same feeling?"]}
  ]}'),
  (mod_id, 'Emotional Immaturity', 4, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"Emotional Immaturity"},
    {"type":"subheading","content":"When Feelings Run the Show"},
    {"type":"text","content":"Emotional immaturity is not about intelligence or age. It''s about capacity — the ability to sit with uncomfortable feelings without acting them out, shutting down, or making them someone else''s problem."},
    {"type":"text","content":"Signs of emotional immaturity include: difficulty taking responsibility (''It''s not my fault''), inability to tolerate disagreement, making everything about themselves, avoiding hard conversations, using anger or tears to control outcomes, and refusing to apologize or repair."},
    {"type":"callout","icon":"heart","content":"Emotional immaturity is not a permanent label. It''s a developmental stage — and with awareness and practice, anyone can grow. The fact that you''re reading this lesson is evidence that you''re already on the path."},
    {"type":"text","content":"Many emotionally immature patterns were learned in childhood. If your emotions were dismissed, punished, or had to be managed for the adults around you, your emotional development may have paused at that age. Your adult self handles logistics brilliantly, but your emotional self may still be operating with the tools of a child."},
    {"type":"subheading","content":"The Emotional Maturity Spectrum"},
    {"type":"list","items":["Reactive — Emotions control behavior. Outbursts, blame, withdrawal.","Aware — Can name emotions but still struggles to manage them in the moment.","Regulated — Can feel emotions fully without being controlled by them. Can pause, reflect, and choose a response.","Integrated — Emotions are welcomed as information. Can hold space for both their own and their partner''s feelings simultaneously."],"ordered":true},
    {"type":"exercise","title":"Practice: Where Am I on the Spectrum?","prompt":"Honestly assess your emotional maturity — with compassion, not judgment.","steps":["Read through the four stages above. Which one describes you most of the time? (Not your best day — your average day.)","Think of a recent conflict. Which stage were you operating from?","Ask your partner (gently): ''Where do you experience me on this spectrum?'' Listen without defending.","Identify one specific practice that could help you move toward the next stage."]}
  ]}');

  -- =====================================================
  -- MODULE 3: THE DEEP ROOTS
  -- Healing Your Childhood Mindprint
  -- Registry: 3.1 From Entangled to Empowered, 3.2 Breaking Free,
  --           3.3 Art of Healthy Connection, 3.4 Anxiety & Abandonment
  -- Status: 3.1-3.2 REVIEW, 3.3-3.4 MISSING
  -- =====================================================
  INSERT INTO modules (course_id, module_number, title, description, sort_order)
  VALUES (flagship_id, '3', 'The Deep Roots', 'Understand how your childhood wrote a Mindprint — and how to rewrite it.', 3)
  RETURNING id INTO mod_id;

  INSERT INTO lessons (module_id, title, sort_order, content_json) VALUES
  (mod_id, 'From Entangled to Empowered', 1, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"From Entangled to Empowered"},
    {"type":"subheading","content":"What Differentiation Really Means"},
    {"type":"text","content":"There is a beautiful paradox at the heart of every healthy relationship: the closer you want to be with someone, the more important it is that you can stand on your own. This is differentiation — the ability to hold onto yourself while staying connected to another person."},
    {"type":"text","content":"Think of two trees growing side by side. Their roots may intertwine underground, and their branches may brush in the wind — but each tree stands on its own trunk. That''s differentiation. You are connected, but you are not merged."},
    {"type":"callout","icon":"lightbulb","content":"Differentiation is not distance. It is the ability to be close without losing yourself — to love without disappearing."},
    {"type":"text","content":"When differentiation is low, you may find yourself taking everything your partner says personally, needing their approval to feel okay, losing your own opinions to keep the peace, or feeling responsible for their emotions."},
    {"type":"text","content":"The opposite of differentiation is enmeshment — when two people become so fused that neither can think, feel, or act independently without the other''s permission or reaction. We will explore that more in the next lesson."},
    {"type":"exercise","title":"Practice: The Differentiation Check-In","prompt":"Assess where you are on the differentiation spectrum.","steps":["Can I hold a different opinion from my partner without anxiety?","Can I soothe myself when my partner is upset — without fixing or fleeing?","Can I say ''no'' without guilt or fear of punishment?","Can I let my partner have their own experience without making it about me?","For any question where the answer is ''not yet,'' that is your growing edge. No shame — just awareness."]}
  ]}'),
  (mod_id, 'Breaking Free from Enmeshment', 2, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"Breaking Free from Enmeshment"},
    {"type":"subheading","content":"Where Do You End and They Begin?"},
    {"type":"text","content":"Enmeshment happens when the boundaries between two people dissolve — when your identity, emotions, and decisions become so tangled with your partner''s that you can no longer tell where you end and they begin."},
    {"type":"text","content":"Imagine two pieces of wet paper pressed together. You can''t separate them without tearing. That''s what enmeshment feels like — the fear that pulling apart will destroy you both."},
    {"type":"callout","icon":"heart","content":"Enmeshment is not love. It is fear disguised as closeness. Real love creates space. Enmeshment eliminates it."},
    {"type":"text","content":"Signs of enmeshment: You feel responsible for your partner''s happiness. You can''t enjoy yourself if they''re upset. You suppress your own needs to avoid rocking the boat. Your sense of self fluctuates based on how your partner is doing."},
    {"type":"text","content":"Enmeshment often begins in childhood — in families where love was conditional, where a child had to manage a parent''s emotions, or where independence was punished. The child learned: ''My safety depends on keeping this person happy.''"},
    {"type":"exercise","title":"Practice: Boundary Awareness","prompt":"Begin noticing where your boundaries blur with your partner''s.","steps":["Name one area where you routinely sacrifice your own needs to manage your partner''s emotions.","Ask yourself: ''If I stopped doing this, what am I afraid would happen?''","Practice one small act of healthy differentiation this week: expressing a preference, keeping a plan with a friend, or simply saying ''I need a few minutes to myself.''"]}
  ]}'),
  (mod_id, 'The Art of Healthy Connection', 3, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"The Art of Healthy Connection"},
    {"type":"subheading","content":"What It Looks Like When It''s Working"},
    {"type":"text","content":"After exploring entanglement and enmeshment, you might wonder: what does healthy connection actually look like? Not the Hollywood version. Not the Instagram version. The real, daily, messy-beautiful version that sustains a marriage through decades."},
    {"type":"text","content":"Healthy connection is built on three pillars: safety (I can be myself here), responsiveness (you notice and respond when I need you), and engagement (we actively choose each other, day after day)."},
    {"type":"callout","icon":"heart","content":"Connection isn''t a feeling you wait for. It''s a practice you build — one small choice at a time. It''s choosing to turn toward your partner when it would be easier to turn away."},
    {"type":"text","content":"Rituals of connection are the glue of healthy relationships. They can be as simple as a morning greeting, a goodnight prayer, a weekly check-in, or a shared cup of coffee. What matters isn''t the activity — it''s the consistency and intention behind it."},
    {"type":"exercise","title":"Practice: Building Your Connection Rituals","prompt":"Design three daily rituals of connection with your partner.","steps":["Choose a morning ritual: How will you greet each other at the start of the day?","Choose an evening ritual: How will you reconnect at the end of the day?","Choose a weekly ritual: What will you do together once a week that is just for your relationship?","Write these down and commit to them for two weeks. Then evaluate: what shifted?"]}
  ]}'),
  (mod_id, 'Anxiety and Fear of Abandonment', 4, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"Anxiety and Fear of Abandonment"},
    {"type":"subheading","content":"When Your Nervous System Won''t Let You Rest"},
    {"type":"text","content":"For some people, the fear of being left — emotionally or physically — runs so deep that it shapes every interaction, every silence, every goodbye. This isn''t neediness. This is a nervous system that learned very early: people leave. Closeness can disappear. Safety is temporary."},
    {"type":"text","content":"Abandonment wounds don''t always come from dramatic events. Sometimes they form from the quiet absence of a parent who was physically present but emotionally checked out. From a caregiver who was unpredictable — warm one day, withdrawn the next. From any experience that taught your young nervous system: ''I cannot rely on the people I love.''"},
    {"type":"callout","icon":"alert","content":"Abandonment anxiety doesn''t mean you''re weak or ''too much.'' It means your system learned that love was unreliable. That''s not a character flaw — it''s an adaptation. And adaptations can be updated."},
    {"type":"text","content":"In adult relationships, abandonment fear shows up as: hypervigilance about your partner''s mood, reading rejection into neutral situations, needing constant reassurance, difficulty with goodbyes or separations, and a deep sensitivity to perceived withdrawal."},
    {"type":"exercise","title":"Practice: Anchoring in Safety","prompt":"When abandonment anxiety rises, use this anchoring sequence to return to the present.","steps":["Name it: ''This is my abandonment wound activating. This is old pain, not current reality.''","Ground: Feel your feet on the floor. Press your palms together. Take three slow breaths.","Check: ''Am I actually being abandoned right now? Or is my system replaying an old story?''","Reach: If your partner is available, share what you''re feeling: ''I''m feeling scared. Can you remind me we''re okay?''"]}
  ]}');

  -- =====================================================
  -- MODULE 4: BREAKTHROUGH COMMUNICATION
  -- Bridging the Attachment Gap
  -- Registry: 4.1 Understanding Attachment Styles, 4.2 My Attachment Map,
  --           4.3 Expressing Needs Without Fear, 4.4 The Art of Active Listening
  -- Status: REVIEW / COMPREHENSIVE (content in PDFs)
  -- =====================================================
  INSERT INTO modules (course_id, module_number, title, description, sort_order)
  VALUES (flagship_id, '4', 'Breakthrough Communication', 'Express needs without blame, listen without defending — bridging the attachment gap.', 4)
  RETURNING id INTO mod_id;

  INSERT INTO lessons (module_id, title, sort_order, content_json) VALUES
  (mod_id, 'Understanding Attachment Styles', 1, '{"estimated_minutes":75,"blocks":[
    {"type":"heading","content":"Understanding Attachment Styles"},
    {"type":"subheading","content":"The Blueprint You Brought Into the Relationship"},
    {"type":"text","content":"Before you ever met your partner, your nervous system had already been trained in how to love. Your earliest relationships — with parents, caregivers, or anyone who held your safety in their hands — wrote an attachment blueprint that you now carry into every intimate relationship."},
    {"type":"text","content":"Attachment theory, developed by John Bowlby and expanded by Mary Ainsworth, shows us that the way we bond (or struggle to bond) in adult relationships is deeply connected to the way we experienced safety and connection as children."},
    {"type":"callout","icon":"lightbulb","content":"Your attachment style is not your identity. It is your operating system — the default programming your nervous system runs when love feels uncertain. And operating systems can be updated."},
    {"type":"subheading","content":"The Four Attachment Styles"},
    {"type":"callout","icon":"heart","content":"Secure Attachment (The Oak Tree): Comfortable with intimacy and independence. Trusts others, communicates openly, handles conflict calmly. Believes they are worthy of love. ''I can be close and still be me.''"},
    {"type":"callout","icon":"alert","content":"Anxious Attachment (The Octopus): Craves closeness but fears abandonment. Seeks constant reassurance, gets anxious during uncertainty, may become clingy or hypervigilant. ''Please don''t leave me.''"},
    {"type":"callout","icon":"alert","content":"Avoidant Attachment (The Turtle): Prioritizes independence, pulls back from vulnerability. Values self-reliance and avoids deep emotional conversations. ''I''m fine on my own.''"},
    {"type":"callout","icon":"alert","content":"Disorganized Attachment (The Cat in a Tree): Craves connection but fears it simultaneously. Swings between pursuing intensely and withdrawing suddenly. ''I want you close but I''m terrified of what happens when you are.''"},
    {"type":"text","content":"These styles are not fixed labels — they are early patterns that can shift toward secure with consistent practice, safe relationships, and tools like the ones you are learning here."},
    {"type":"exercise","title":"Practice: Identify Your Style","prompt":"Reflect on your attachment pattern — with curiosity, not judgment.","steps":["Read through the four styles above. Which one resonates most with you?","Think about what happens when you feel disconnected from your partner. Do you reach (anxious), retreat (avoidant), or oscillate (disorganized)?","Ask: What was the emotional climate of my childhood home? Was love consistent, unpredictable, conditional, or absent?","Share your reflection with your partner: ''I think my attachment style is _____, and it shows up when _____.''"]}
  ]}'),
  (mod_id, 'My Attachment Map', 2, '{"estimated_minutes":75,"blocks":[
    {"type":"heading","content":"My Attachment Map"},
    {"type":"subheading","content":"Mapping Your Patterns to Your History"},
    {"type":"text","content":"Now that you understand the four attachment styles, it is time to map your personal attachment blueprint — the specific experiences, messages, and emotional climates that shaped how you love today."},
    {"type":"text","content":"Your attachment map is not about blame. It is about understanding. When you can trace the line from ''what I experienced as a child'' to ''how I react in my marriage,'' you gain the power to interrupt old patterns and choose new responses."},
    {"type":"callout","icon":"book","content":"Your attachment map answers the question: ''Where did I learn to love like this?'' Not to assign fault — but to find the roots of patterns that no longer serve you."},
    {"type":"exercise","title":"Practice: Drawing Your Attachment Map","prompt":"Map the key relationships that shaped your attachment style.","steps":["Draw a circle in the center of a page with your name in it.","Around it, draw circles for each primary caregiver or significant figure from your childhood.","For each person, write: Were they emotionally available? Consistent? Critical? Warm? Distant? Unpredictable?","Draw lines between you and each person: solid for safe connections, dotted for inconsistent ones, jagged for painful ones.","Look at the pattern: Which attachment style does this map reflect? Share and discuss with your partner."]}
  ]}'),
  (mod_id, 'Expressing Needs Without Fear', 3, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"Expressing Needs Without Fear"},
    {"type":"subheading","content":"The Language That Doesn''t Start a Fight"},
    {"type":"text","content":"Most people in relationships don''t struggle because they lack needs — they struggle because they don''t know how to express them without activating their partner''s defenses."},
    {"type":"text","content":"When needs get expressed as criticism (''You never listen''), as blame (''This is your fault''), or not at all (silence), the result is the same: your partner either fights back, shuts down, or both. And your need goes unmet — again."},
    {"type":"callout","icon":"lightbulb","content":"The ''I Feel / I Need'' formula transforms how you communicate. Instead of leading with what your partner did wrong, you lead with your own experience — which is much harder to argue with."},
    {"type":"subheading","content":"The Formula"},
    {"type":"bold_text","content":"''When [specific situation], I feel [emotion], and what I need is [specific request].''"},
    {"type":"text","content":"Example: Instead of ''You never help with the kids,'' try: ''When I''m handling bedtime alone, I feel overwhelmed and unsupported. What I need is for us to take turns — even two nights a week would make a difference.''"},
    {"type":"exercise","title":"Practice: The I Feel / I Need Script","prompt":"Convert one recurring complaint into an ''I Feel / I Need'' statement.","steps":["Think of something that consistently frustrates you in your relationship.","Write it as a complaint first (get it out of your system).","Now rewrite it using the formula: When _____, I feel _____, and what I need is _____.","Share the rewritten version with your partner this week. Notice the difference in their response."]}
  ]}'),
  (mod_id, 'The Art of Active Listening', 4, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"The Art of Active Listening"},
    {"type":"subheading","content":"Hearing What They''re Actually Saying"},
    {"type":"text","content":"Active listening is not waiting for your turn to talk. It is not preparing your defense while your partner is still speaking. It is the radical act of setting aside your own agenda and genuinely trying to understand another person''s experience."},
    {"type":"text","content":"In most arguments, both people are talking but nobody is listening. Each person is focused on being heard — which means nobody feels heard. Active listening breaks this cycle by making your partner''s experience the priority, even when it is uncomfortable."},
    {"type":"callout","icon":"heart","content":"The greatest gift you can give your partner is the experience of being truly heard. Not fixed. Not corrected. Not argued with. Just heard."},
    {"type":"subheading","content":"The Three Levels of Listening"},
    {"type":"list","items":["Level 1: Listening to respond — You hear the words but you are already forming your rebuttal.","Level 2: Listening to understand — You are trying to grasp what your partner means and feels.","Level 3: Listening to connect — You are fully present, hearing what is said and what is underneath it. You are listening with your whole system."],"ordered":true},
    {"type":"exercise","title":"Practice: Reflective Listening","prompt":"Practice Level 3 listening with your partner using this structured format.","steps":["One partner speaks for 3 minutes about something on their heart. The other listens without interrupting.","The listener reflects back: ''What I heard you say is _____. Did I get that right?''","The speaker corrects or confirms. The listener reflects again until the speaker says ''Yes, you got it.''","Switch roles. Repeat.","Debrief together: How did it feel to be fully heard? What was hardest about listening without responding?"]}
  ]}');

  -- =====================================================
  -- MODULE 5: THE BODY OF BELONGING
  -- Rewiring Your Nervous System
  -- Registry: 5.1-5.2 Meet Your Nervous System, 5.3 Mastering the Flow,
  --           5.4 The Nervous System Map
  -- Status: PUBLISHED / COMPREHENSIVE (content in PDFs)
  -- =====================================================
  INSERT INTO modules (course_id, module_number, title, description, sort_order)
  VALUES (flagship_id, '5', 'The Body of Belonging', 'Calm the storm inside before addressing the storm between you — your nervous system is the key.', 5)
  RETURNING id INTO mod_id;

  INSERT INTO lessons (module_id, title, sort_order, content_json) VALUES
  (mod_id, 'Meet Your Nervous System', 1, '{"estimated_minutes":90,"blocks":[
    {"type":"heading","content":"Meet Your Nervous System"},
    {"type":"subheading","content":"Why Your System Takes Over Before Your Brain Can Think"},
    {"type":"text","content":"This might be the most important lesson in the entire Healing Hearts program. Everything you have learned so far — attachment styles, communication tools, toxic patterns — all of it connects back to one place: your nervous system."},
    {"type":"text","content":"Your nervous system is the body''s command center. It decides — in milliseconds — whether you are safe, in danger, or overwhelmed. And it makes that decision before your conscious mind has any say in the matter."},
    {"type":"callout","icon":"lightbulb","content":"When your partner says something that stings, your nervous system responds in 0.03 seconds. Your conscious brain takes 0.5 seconds. By the time you ''think'' about what to say, your system has already decided: fight, flee, freeze, or fawn."},
    {"type":"subheading","content":"Critter Brain vs. CEO Brain"},
    {"type":"text","content":"We use two terms throughout Healing Hearts to describe these systems:"},
    {"type":"bold_text","content":"The Critter Brain (your amygdala) is your ancient protective wiring. It scans for danger, sounds the alarm, and takes over when it detects a threat. It doesn''t reason. It reacts. It has kept your ancestors alive for hundreds of thousands of years."},
    {"type":"bold_text","content":"The CEO Brain (your prefrontal cortex) is your rational, compassionate, creative mind. It plans, empathizes, problem-solves, and makes wise decisions. But it goes offline under stress — which is exactly when you need it most."},
    {"type":"text","content":"Here is the critical insight: you cannot access your CEO Brain when your Critter Brain has taken the wheel. You physically cannot think clearly, empathize, or problem-solve when your nervous system is in survival mode. This is biology, not weakness."},
    {"type":"callout","icon":"heart","content":"Every argument that spirals out of control is not a communication failure. It is a nervous system event. The words are secondary. The state of your system is primary."},
    {"type":"exercise","title":"Practice: Critter Brain Awareness","prompt":"Start recognizing when your Critter Brain takes over.","steps":["Think of the last argument with your partner that escalated quickly.","What did your system do? Heart racing? Jaw clenching? Going silent? Wanting to leave the room?","Those are not bad reactions — they are your Critter Brain doing its job: protecting you.","This week, when you notice your system activating, simply name it internally: ''Critter Brain is online right now.'' That awareness alone begins to shift the pattern."]}
  ]}'),
  (mod_id, 'The 90-Second Wave', 2, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"Mastering the Flow of Emotion"},
    {"type":"subheading","content":"Riding the 90-Second Wave"},
    {"type":"text","content":"Here is a piece of neuroscience that will change how you handle every emotional storm for the rest of your life: every emotion — anger, fear, sadness, shame — lasts approximately 90 seconds in your system. That is how long it takes for the neurochemical surge to rise, peak, and naturally pass through."},
    {"type":"text","content":"So why do some emotions feel like they last for hours? Because we keep re-activating them. We replay the argument. We rehearse what we should have said. We scroll through the mental highlight reel of every time our partner did the same thing. Each replay sends a fresh wave of chemicals through your system."},
    {"type":"callout","icon":"lightbulb","content":"The emotion is 90 seconds. Everything after that is a story you are telling yourself. The key to regulation is learning to ride the initial wave without re-activating it."},
    {"type":"subheading","content":"How to Ride the Wave"},
    {"type":"list","items":["Pause — Stop talking, stop texting, stop engaging. Just pause.","Breathe — Three slow breaths. Inhale for 4 counts, hold for 4, exhale for 6.","Feel — Let the emotion move through your system without fighting it. Where do you feel it? Chest? Stomach? Throat?","Wait — Count to 90 in your head if you need to. The wave will crest and begin to subside.","Choose — Once the wave passes, your CEO Brain comes back online. Now you can respond instead of react."],"ordered":true},
    {"type":"exercise","title":"Practice: Riding Your Next Wave","prompt":"The next time you feel a strong emotion rising, practice the 90-second ride.","steps":["When activation hits, tell yourself: ''This is a wave. It will pass in 90 seconds.''","Physically pause. Remove yourself from the conversation if needed. Say: ''I need 2 minutes.''","Breathe slowly and feel the sensation in your system without trying to fix it.","After the wave passes, notice: Do you feel different? Is your CEO Brain back online?","Over time, this practice rewires your nervous system to trust that emotions are temporary — not emergencies."]}
  ]}'),
  (mod_id, 'The Nervous System Map', 3, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"The Nervous System Map"},
    {"type":"subheading","content":"Understanding the Zones You Live In"},
    {"type":"text","content":"Your nervous system operates in distinct zones — each with its own set of feelings, behaviors, and capabilities. Understanding these zones is like having a map of your inner landscape. Once you can name where you are, you can navigate your way back to safety."},
    {"type":"subheading","content":"The Four Zones of Resilience"},
    {"type":"callout","icon":"heart","content":"The Green Zone (Safety & Connection): This is home base. In the Green Zone, your heart rate is steady, your breathing is calm, and your CEO Brain is fully online. You can think clearly, listen deeply, and respond with compassion. This is where love grows."},
    {"type":"callout","icon":"alert","content":"The Yellow Zone (Caution): You are moving toward activation. Patience is thinning, tone is shifting, body is tensing. This is the early warning system — the moment to intervene before things escalate."},
    {"type":"callout","icon":"alert","content":"The Red Zone (Fight or Flight): Full activation. Heart pounding, adrenaline flooding, tunnel vision. In this state, your Critter Brain is in control. You may yell, blame, criticize, or become aggressive. Your CEO Brain is offline."},
    {"type":"callout","icon":"alert","content":"The Blue Zone (Freeze & Shutdown): If the Red Zone energy overwhelms your system, you collapse. Numbness, dissociation, brain fog, withdrawal. ''I don''t care anymore'' is often the Blue Zone talking."},
    {"type":"text","content":"Most conflicts between couples are really two nervous systems colliding: one in the Red Zone (pursuing, demanding, escalating) and one in the Blue Zone (withdrawing, shutting down, going silent). They are not choosing these responses — their systems are."},
    {"type":"exercise","title":"Practice: Zone Mapping","prompt":"Map your typical zones during conflict — and learn to recognize them early.","steps":["Think of a recent disagreement. What zone were you in at the start? At the peak? After?","What are your personal Yellow Zone signals? (Jaw tightening? Shorter answers? Wanting to leave?)","What are your partner''s Yellow Zone signals?","Create a shared agreement: ''When either of us hits Yellow, we pause for _____ minutes before continuing.''"]}
  ]}');

  -- =====================================================
  -- MODULE 6: GREEN ZONE LIVING
  -- Expanding Your Capacity
  -- Registry: 6.1 The Connection Map, 6.2 Expanding Your Green Zone,
  --           6.3 The 6 Pillars, 6.4 When Your Green Zone Shrinks
  -- Vault content: 6.3 (17K), 6.4 (25K)
  -- =====================================================
  INSERT INTO modules (course_id, module_number, title, description, sort_order)
  VALUES (flagship_id, '6', 'Green Zone Living', 'Map your emotional landscape and learn to expand your capacity for connection and calm.', 6)
  RETURNING id INTO mod_id;

  INSERT INTO lessons (module_id, title, sort_order, content_json) VALUES
  (mod_id, 'The Connection Map', 1, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"The Connection Map"},
    {"type":"subheading","content":"Where Are You Spending Your Emotional Energy?"},
    {"type":"text","content":"Before you can expand your Green Zone, you need to understand where your emotional energy is currently going. The Connection Map is an assessment tool that helps you see — clearly and without judgment — the landscape of your relationships and energy flow."},
    {"type":"text","content":"Think of your emotional energy like a bank account. Every relationship, responsibility, and interaction either deposits or withdraws from that account. When you are overdrawn, your Green Zone shrinks — not because something is wrong with you, but because the math doesn''t work."},
    {"type":"callout","icon":"lightbulb","content":"You cannot pour from an empty cup. The Connection Map helps you see where your cup is being drained — and where it''s being filled."},
    {"type":"exercise","title":"Practice: Draw Your Connection Map","prompt":"Map the people and responsibilities that fill and drain your emotional energy.","steps":["Draw a large circle with your name in the center.","Around it, draw smaller circles for each significant person and responsibility in your life.","Color code: Green for relationships that fill you. Red for those that drain you. Yellow for mixed.","Draw arrows showing energy flow: thick arrows for major energy demands, thin for minor.","Step back and look at the whole picture. Where is the imbalance? What needs to shift?"]}
  ]}'),
  (mod_id, 'Expanding Your Green Zone', 2, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"Expanding Your Green Zone"},
    {"type":"subheading","content":"Daily Practices That Build Capacity"},
    {"type":"text","content":"Now that you understand the zones and have mapped your emotional energy, it is time to actively grow your Green Zone. This is not a one-time event — it is a daily practice, like strengthening a muscle."},
    {"type":"text","content":"Your Green Zone expands through four channels: predictability (your system loves knowing what comes next), early repair (addressing ruptures before they calcify), co-regulation (borrowing calm from a safe person), and daily regulation rhythms (small practices that tell your system ''you are safe'')."},
    {"type":"callout","icon":"heart","content":"The Green Zone doesn''t expand through willpower. It expands through repeated experiences of safety. Every time your system experiences calm and returns to baseline, it learns: ''I can handle this. I am okay.''"},
    {"type":"exercise","title":"Practice: Green Zone Expansion Plan","prompt":"Choose daily practices that send safety signals to your nervous system.","steps":["Choose one morning practice: breathing, stretching, prayer, or journaling (even 5 minutes).","Choose one micro-regulation practice for stressful moments: a physiological sigh, a walk, or a grounding technique.","Choose one evening practice: a gratitude reflection, a connection ritual with your partner, or screen-free wind-down.","Practice all three for one week. Notice what shifts in your patience, reactivity, and connection."]}
  ]}'),

  -- Module 6.3: The 6 Pillars of Mental Health — REAL VAULT CONTENT
  (mod_id, 'The 6 Pillars of Mental Health', 3, '{"estimated_minutes":75,"blocks":[
    {"type":"heading","content":"The 6 Pillars of Mental, Emotional, and Physical Health"},
    {"type":"subheading","content":"A Continuation of Expanding Your Green Zone"},
    {"type":"text","content":"I''ve been teaching these six concepts to my clients for years: simple, science-backed rhythms that quietly rewire your nervous system from the inside out. Think of them as anchors of safety. Each one whispers to your system, ''You''re okay. You can rest.''"},
    {"type":"text","content":"When you practice them consistently, they don''t just calm your mind — they deepen connection, restore energy, and keep your CEO Brain online when life gets noisy."},
    {"type":"quote","content":"Science gives the ''how,'' and Healing Hearts helps you live the ''why.''","attribution":"Trisha Jamison"},
    {"type":"list","items":["Sleep","Light Exposure","Movement","Nutrition","Social Connection","Stress Control"],"ordered":true},
    {"type":"divider"},
    {"type":"subheading","content":"01 — Sleep: Your Nightly Reset"},
    {"type":"text","content":"Sleep isn''t a luxury — it''s your system''s nightly repair shop. It''s when your brain clears out stress hormones, processes emotion, and resets your nervous system for another day of connection and decision-making. When you shortchange sleep, your patience, empathy, and problem-solving all take a hit. Your CEO Brain goes offline and your Critter Brain takes charge."},
    {"type":"exercise","title":"Practice: Sleep Hygiene","prompt":"Protect your nightly reset with these small changes.","steps":["Aim for 7–9 hours of quality sleep.","Keep a consistent bedtime and wake time — yes, even on weekends.","Make your room cool, dark, and phone-free.","Avoid caffeine within 8–10 hours of bedtime.","Do a quick brain dump before bed — write down your worries so they don''t crawl into bed with you."]},
    {"type":"divider"},
    {"type":"subheading","content":"02 — Light Exposure: Set Your Inner Clock"},
    {"type":"text","content":"Light is your system''s natural rhythm keeper. Morning light says ''You''re alive and safe.'' Evening darkness whispers ''You can rest now.'' When sunlight hits the back of your retina, it signals your brain to release cortisol — the good kind that boosts alertness and energy. This simple morning ritual resets your circadian rhythm."},
    {"type":"exercise","title":"Practice: Morning & Evening Light","prompt":"Use natural light to regulate your internal clock.","steps":["Step outside within 30–60 minutes of waking for 5–10 minutes of natural light (longer if cloudy).","Skip sunglasses during morning light exposure.","In the evening, dim the lights and step outside to enjoy the sunset.","Use blue light blockers and turn off screens an hour before bed."]},
    {"type":"divider"},
    {"type":"subheading","content":"03 — Movement: Complete the Stress Cycle"},
    {"type":"text","content":"Movement isn''t just about burning calories — it''s about burning off stress. Your system needs a way to release what your mind can''t. Movement tells your system the danger has passed. When you move, your brain releases endorphins, dopamine, and serotonin — nature''s built-in mood boosters."},
    {"type":"text","content":"Jeff and I either walk or play pickleball in the mornings. Sometimes it''s 30 minutes, sometimes an hour and a half on the court — but 90% of our best conversations happen with sneakers on and the sun coming up. There''s something about moving together that sets everything else in motion."},
    {"type":"divider"},
    {"type":"subheading","content":"04 — Nutrition: Fuel for Safety & Stability"},
    {"type":"text","content":"Food is more than fuel — it''s information. Every bite you take sends a message to your nervous system about whether you''re safe and supported. Your gut produces nearly 90% of your serotonin, the feel-good chemical that keeps you grounded and hopeful. So yes, your mood starts in your stomach."},
    {"type":"text","content":"I once had a couple who argued every night before dinner. We eventually realized they weren''t in a communication crisis — they were just hangry. Now they eat first, talk later. Sometimes, healing starts with a snack."},
    {"type":"exercise","title":"Practice: Nutrition Anchors","prompt":"Nourish your capacity for calm with these simple shifts.","steps":["Eat real, colorful foods: proteins, healthy fats, fruits, veggies. Think ''rainbow, not restriction.''","Stay hydrated — drink half your body weight in ounces of water daily.","Eat regularly. Skipping meals tells your system to panic.","For every cup of coffee, balance it with two cups of water."]},
    {"type":"divider"},
    {"type":"subheading","content":"05 — Social Connection: Heal Through Safe People"},
    {"type":"text","content":"We are biologically wired for connection. From birth, our nervous system learns safety through the tone of a voice, the warmth of a touch, and the presence of people who feel steady. When we spend time with safe people, our system releases oxytocin — the ''I belong'' hormone. Isolation triggers the same stress pathways as physical pain."},
    {"type":"quote","content":"Find your safe people — the ones you don''t have to perform for.","attribution":"Trisha Jamison"},
    {"type":"divider"},
    {"type":"subheading","content":"06 — Stress Control: Teach Your System to Come Home"},
    {"type":"text","content":"Stress is inevitable. But staying stuck there? That''s optional. The goal isn''t to avoid stress — it''s to recover faster. Every time you come back to calm, you teach your system that safety is stronger than chaos."},
    {"type":"exercise","title":"Practice: The Physiological Sigh","prompt":"This breathing technique can bring you back to Green Zone in under a minute.","steps":["Take two inhales through your nose — the first fills your lungs about three-quarters full, the second fills them completely.","Hold at the top for a count of four.","Release one long, slow exhale through your mouth.","Repeat 3–5 times.","Use this before difficult conversations, during stressful moments, or as a daily regulation practice."]},
    {"type":"divider"},
    {"type":"subheading","content":"Couples Integration"},
    {"type":"text","content":"When your daily pillars start lining up, something beautiful happens — your nervous systems begin to move in rhythm instead of reaction. Arguments soften faster. Laughter sneaks back in. Even the hard moments start to feel safer."},
    {"type":"exercise","title":"Practice: Pillar Partners","prompt":"Choose one pillar this week to strengthen together. Keep it light — no blame, no shame.","steps":["Ask each other: ''What would it look like to make this one pillar just a little stronger?''","Choose together: a sunrise walk (Light), a no-phone dinner (Nutrition), or a nightly prayer (Stress Control).","Practice it for one week. Then discuss: What shifted?"]},
    {"type":"quote","content":"Your healing won''t come in perfect, linear lines. It will come in micro-moments of safety practiced again and again.","attribution":"Trisha Jamison"}
  ]}'),

  -- Module 6.4: When Your Green Zone Shrinks — REAL VAULT CONTENT
  (mod_id, 'When Your Green Zone Shrinks', 4, '{"estimated_minutes":90,"blocks":[
    {"type":"heading","content":"When Your Green Zone Shrinks"},
    {"type":"subheading","content":"…and What You Can Do About It"},
    {"type":"text","content":"In earlier lessons, you learned how to grow your Green Zone — the place where your system settles, your brain stays online, and connection feels possible. You practiced daily regulation, predictability, early repair, co-regulation, and your six daily pillars. You built capacity. You strengthened your nervous system."},
    {"type":"text","content":"And now… we flip the coin. Because even well-regulated people have moments — or seasons — when their Green Zone shrinks. Not because something is wrong. Because life happens."},
    {"type":"callout","icon":"heart","content":"This isn''t about staying regulated all the time. It''s about knowing what to do when you''re not."},
    {"type":"text","content":"Your nervous system expands in safety and contracts under strain — like breath, like a muscle, like your relationship when you are both tired. Listen when your system is saying: ''I''m carrying too much.'' ''I need a pause.'' ''Now is not the time for a deep conversation.''"},
    {"type":"divider"},
    {"type":"subheading","content":"The 9 Forces That Shrink the Green Zone"},
    {"type":"bold_text","content":"1. Trauma — Past or Present"},
    {"type":"quote","content":"Trauma is not the story of something that happened long ago. It is the current imprint of that pain on body, mind, and soul.","attribution":"Bessel van der Kolk"},
    {"type":"text","content":"Sometimes your nervous system responds to something happening today with the intensity of something that happened forty years ago. Not because you want more drama — because your system is still trying to protect you. Trauma isn''t the event. It''s the impact on the nervous system. Your Critter Brain keeps a detailed filing cabinet labeled ''Everything That Ever Threatened Us'' — and sometimes it pulls a file you did not request. At Costco. In the laundry room."},
    {"type":"bold_text","content":"2. Illness, Injury & Chronic Pain"},
    {"type":"text","content":"Your nervous system doesn''t differentiate emotional stress from physical stress. When your system is fighting something internally — autoimmune flares, migraines, chronic fatigue, hormonal chaos — your Green Zone gets smaller because your system is already using every available resource just to function. It''s like trying to host a dinner party while firefighters are running through your house."},
    {"type":"bold_text","content":"3. Abandonment Wounds & Disconnection"},
    {"type":"text","content":"If trauma is the loud thief, disconnection is the quiet one. Humans were designed for closeness. When connection starts to feel wobbly — being dismissed, unanswered texts, a partner pulling away — your system reads danger. Not because your partner is dangerous, but because your heart has history."},
    {"type":"bold_text","content":"4. Anxiety & Hypervigilance"},
    {"type":"text","content":"Anxiety is anticipation energy. Hypervigilance is survival energy. Both keep your nervous system in a constant state of ''almost'' — almost ready, almost braced, almost at rest but not quite. As one wife told me: ''I monitor everyone''s tone like I work for TSA.'' Hypervigilance isn''t personality. It''s protection."},
    {"type":"bold_text","content":"5. Emotional Suppression & People-Pleasing"},
    {"type":"text","content":"Some of you learned early: ''Don''t be too much.'' ''Don''t upset anyone.'' ''Just be agreeable.'' That''s not personality — that''s survival. What you don''t feel doesn''t disappear. It waits. Quietly. Stored in the system. Until one day your Green Zone can''t stretch any further."},
    {"type":"bold_text","content":"6. Lack of Repair After Conflict"},
    {"type":"text","content":"Unrepaired conflict is the quiet way the Green Zone shrinks. Not just the big blowups — the snarky remarks, the sighs that never get named, the apologies that almost happened. As one couple told me: ''We rarely fight… we just simmer.'' Simmering is slow-motion dysregulation."},
    {"type":"bold_text","content":"7. Loneliness & Isolation"},
    {"type":"text","content":"Loneliness doesn''t always look like being alone. Sometimes it looks like being together and feeling invisible. You can share a home, a bed, a calendar — and still feel profoundly unseen."},
    {"type":"bold_text","content":"8. Perfectionism & Chronic Pressure"},
    {"type":"text","content":"Perfectionism is the nervous system trying to earn safety. If your worth ever felt conditional growing up, your adult system may still believe: ''I must be impressive to be loved.''"},
    {"type":"quote","content":"Perfectionism is not the same thing as striving for excellence. Perfectionism is driven by the fear of not being enough.","attribution":"Bren\u00e9 Brown"},
    {"type":"bold_text","content":"9. Limiting Core Beliefs"},
    {"type":"text","content":"Your nervous system responds to beliefs as if they are facts. Especially the ones formed early: ''I''m not enough.'' ''I''m too much.'' ''I''m hard to love.'' ''People leave.'' These beliefs create a quiet, constant pressure — a background tension that says ''Be careful. Don''t relax. Stay alert.''"},
    {"type":"divider"},
    {"type":"subheading","content":"Re-Expanding the Green Zone: 6 Steps"},
    {"type":"text","content":"A shrinking Green Zone is your system quietly raising its hand and saying: ''Something needs care. I don''t feel okay right now.'' The path back isn''t through force — it''s through safety, softness, and small, compassionate steps."},
    {"type":"exercise","title":"Step 1: Slow Down Before You Speed Up","prompt":"Regulation does not happen at full speed.","steps":["One slow breath before transitions.","A pause before responding.","Sitting still for two minutes and actually feeling your feet on the floor.","Letting your system arrive before your words do."]},
    {"type":"exercise","title":"Step 2: Refill Your Tank","prompt":"You don''t earn rest by burning out first.","steps":["Real rest (even ten minutes — not scrolling).","Music that lifts you.","Being outside.","Laughter on purpose.","Stillness without productivity."]},
    {"type":"exercise","title":"Step 3: Repair What''s Frayed","prompt":"Unrepaired moments quietly shrink the Green Zone.","steps":["''That didn''t land the way I hoped — can we rewind?''","''I was activated earlier. I want to reconnect.''","A soft tone. Gentle touch.","Humor that invites, not dismisses."]},
    {"type":"exercise","title":"Step 4: Re-Train Your Inner Voice","prompt":"Your nervous system is always listening to the voice inside your head.","steps":["Replace ''What''s wrong with me?'' with ''What''s happening inside me?''","Speak to yourself the way you would to a tired child.","Use calming reminders: ''It''s safe to slow down.'' ''I don''t need to earn rest.'' ''This feeling will pass.''"]},
    {"type":"exercise","title":"Step 5: Reconnect With Safe People","prompt":"Healing does not happen in isolation. Your nervous system regulates fastest in safe connection.","steps":["Sit close without fixing.","Share silence.","Make eye contact for ten seconds.","Let someone else''s calm steady yours."]},
    {"type":"exercise","title":"Step 6: Reflect — Don''t Judge","prompt":"Your nervous system learns through curiosity, not criticism.","steps":["What helped me today?","What drained me?","What needs care right now?"]},
    {"type":"divider"},
    {"type":"subheading","content":"A Note From Trisha"},
    {"type":"text","content":"A shrinking Green Zone is not evidence that you''re failing. It''s evidence that your nervous system has been carrying a lot — physical pain, emotional weight, mental load… sometimes all three at once."},
    {"type":"text","content":"Regulation isn''t a straight line. It''s a rhythm: expanding and contracting, inhaling and exhaling, holding and releasing. So when your Green Zone shrinks — don''t panic. Don''t judge. And please don''t push. Just listen. Offer yourself kindness. And return softly. Again, and again. That''s healing."},
    {"type":"quote","content":"Progress doesn''t always look calm — sometimes it looks like catching the storm mid-spin. That''s awareness without shame.","attribution":"Trisha Jamison"}
  ]}');

  -- =====================================================
  -- MODULE 7: THE UNSEEN ARCHITECT
  -- Tapping Into Your Subconscious
  -- Registry: 7.1 Uncovering the Hidden Blueprint, 7.2 The Power of Forgiveness,
  --           7.3 From Letting Go to Living Free, 7.4 The Path to True Intimacy
  -- PREVIEW MODULE — free for all authenticated users
  -- =====================================================
  INSERT INTO modules (course_id, module_number, title, description, sort_order, is_preview)
  VALUES (flagship_id, '7', 'The Unseen Architect', 'Heal the hidden wounds driving your relationship patterns.', 7, true)
  RETURNING id INTO mod_id;

  -- 7.1: Uncovering the Hidden Blueprint — REAL VAULT CONTENT
  INSERT INTO lessons (module_id, title, sort_order, is_preview, content_json) VALUES
  (mod_id, 'Uncovering the Hidden Blueprint', 1, true, '{"estimated_minutes":90,"blocks":[
    {"type":"heading","content":"Uncovering the Hidden Blueprint"},
    {"type":"subheading","content":"Your Subconscious Survival Code"},
    {"type":"text","content":"Let''s pause. Breathe in… breathe out… together, nice and slow. In the previous module, you practiced catching that exact moment when your Green Zone starts shrinking. You noticed it early, without judgment, without shaming yourself. You just listened. A shrinking Green Zone isn''t a failure. It''s information."},
    {"type":"text","content":"This module is your warm, cozy invitation to finally sit down with that program. To understand where it came from, why it''s still hanging around, and how it''s been trying to protect you your whole life — even when it feels like it''s holding you back."},
    {"type":"callout","icon":"heart","content":"No blame lives here. Only compassion, clarity, and the sweet beginning of freedom. This is the part where so many people let out the biggest exhale and whisper: ''Ohhh… so I''m not crazy after all. I''m just deeply patterned.''"},
    {"type":"divider"},
    {"type":"subheading","content":"The Giant Behind the Curtain"},
    {"type":"text","content":"Here is some jaw-dropping information. Your subconscious mind handles 95–97% of your brain''s processing power — millions of bits per second — while your conscious mind is stuck with just 3–5%, processing a measly 40–50 bits per second."},
    {"type":"text","content":"All the working, talking, planning, and ''I really should know better by now'' inner pep talks you give yourself? That''s only tapping into about 5% of your total brainpower. The other 95%? That''s your subconscious quietly running the entire operation: scanning your environment, firing emotional reactions, running habits on autopilot, storing memories, and protecting you faster than you can blink."},
    {"type":"callout","icon":"lightbulb","content":"Your conscious mind speaks fluent language, logic, and reasoning. Your subconscious speaks emotion, vivid imagery, felt experiences, and repetition. It literally does not understand words the way your thinking brain does. That is why ''I shouldn''t feel this way'' does absolutely nothing."},
    {"type":"subheading","content":"Why Words Bounce Off"},
    {"type":"text","content":"Healing happens when we speak the subconscious''s native language: emotion and feelings, imagery and visualization, repetition, regulation, safe experiences, and co-regulation with a safe person. This is why co-regulation, vivid visualizations, and repeated calm moments are pure gold — they bypass the thinking mind and go straight to the heart of change."},
    {"type":"subheading","content":"The Pink Elephant Principle"},
    {"type":"text","content":"Quick experiment: Whatever you do… don''t think of a pink elephant. No trunk. No floppy ears. And definitely not wearing a sparkly purple tutu."},
    {"type":"text","content":"Your subconscious doesn''t process negatives like ''don''t'' or ''stop.'' It hears only the vivid image. So when we say ''Don''t shut down'' — the subconscious hears SHUT DOWN. ''Don''t get anxious'' — it hears ANXIETY."},
    {"type":"callout","icon":"lightbulb","content":"Instead of telling yourself what NOT to feel, move toward what you want. ''I am safe.'' ''I choose connection.'' ''I can stay present.'' Your subconscious responds to direction, not negation."},
    {"type":"subheading","content":"The 12 Key Principles of the Subconscious"},
    {"type":"text","content":"Your subconscious operates by specific rules — principles that explain why change feels so stubbornly hard at first (spoiler: it''s not you). Understanding these principles is the first step to working with your subconscious instead of fighting against it."},
    {"type":"list","items":["Principle 1: Your subconscious runs on autopilot — it prefers efficiency over accuracy.","Principle 2: It cannot distinguish between real and vividly imagined experiences.","Principle 3: Early emotional imprints become permanent templates (before age 7-8).","Principle 4: It communicates through feelings, images, and body sensations — not words.","Principle 5: Protection always wins over growth — safety first, always.","Principle 6: Repetition + emotion = programming. This is how patterns get installed.","Principle 7: Relational mirroring — your partner''s reactions often mirror your own unresolved wounds.","Principle 8: The subconscious seeks what is familiar, not what is healthy.","Principle 9: Habitual thought loops create emotional highways — the more you think it, the faster it fires.","Principle 10: Early life is a ''super-learning'' period — everything absorbed before age 8 becomes foundational code.","Principle 11: The mind-body connection is bidirectional — your system stores emotions as physical sensations.","Principle 12: The subconscious can be reprogrammed — but only through its own language: safety, repetition, emotion, and imagery."],"ordered":true},
    {"type":"divider"},
    {"type":"text","content":"In the next lesson, we will apply these principles directly to the work of forgiveness — one of the most powerful acts of subconscious reprogramming available to you."},
    {"type":"quote","content":"Your subconscious is millions of times more powerful than your conscious mind.","attribution":"Bruce Lipton"}
  ]}'),

  -- 7.2: The Power of Forgiveness — ENHANCED WITH VAULT CONTENT
  (mod_id, 'The Power of Forgiveness', 2, true, '{"estimated_minutes":75,"blocks":[
    {"type":"heading","content":"The Power of Forgiveness"},
    {"type":"subheading","content":"Releasing the Chains That Bind Your Subconscious and Your Heart"},
    {"type":"text","content":"In Module 7.1, we unlocked the 12 Key Principles of the Subconscious. We saw how your mind isn''t just a recorder — it''s a relentless architect, building patterns from emotional imprints, habitual loops, and protective barriers."},
    {"type":"text","content":"Those principles showed us that resentment isn''t just ''bad vibes.'' It''s a subconscious glitch that keeps you stuck in survival mode, shrinking your capacity for peace and joy, especially in relationships."},
    {"type":"callout","icon":"heart","content":"Module 7.2 isn''t here to pile on more theory. It''s your invitation to RELEASE. We''re tying those principles directly into forgiveness as the ultimate reset."},
    {"type":"divider"},
    {"type":"subheading","content":"What Forgiveness Actually Is — And What It Isn''t"},
    {"type":"text","content":"Forgiveness is not about excusing what happened. It''s about releasing the weight so you can move forward. Forgiveness does not mean saying ''It didn''t matter'' when it absolutely did. It does not mean allowing harmful behavior to continue. It does not mean skipping accountability, rebuilding trust overnight, or forgetting what happened."},
    {"type":"bold_text","content":"Forgiveness is about telling your own system, with clarity and authority: ''This no longer gets to run me.''"},
    {"type":"callout","icon":"lightbulb","content":"Forgiveness doesn''t mean reconciliation. It doesn''t mean forgetting. It means choosing to stop letting the pain control your present. When we carry resentment, our nervous system stays in a state of low-grade threat. Forgiveness — done at your own pace, on your own terms — helps your system finally exhale."},
    {"type":"divider"},
    {"type":"subheading","content":"Why the System Holds On"},
    {"type":"text","content":"When hurt is not processed, it does not disappear — it relocates. Pain settles into the nervous system, muscles, breath, gut, and heart. Over time, this stored pain begins to shape how we live, how we love, and how we protect ourselves."},
    {"type":"text","content":"Unforgiveness is not simply an attitude or a choice — it is stored activation. Unreleased pain often lives in chronic muscle tension, emotional reactivity or shutdown, hypervigilance and anxiety, and relational distance and guardedness."},
    {"type":"quote","content":"Holding onto anger is like drinking poison and expecting the other person to suffer. The system always pays the price.","attribution":"Trisha Jamison"},
    {"type":"subheading","content":"The Physical Cost of Bitterness"},
    {"type":"text","content":"When anger is sustained without repair, it leads to chronic stress, emotional rigidity, and long-term health consequences. This can show up as muscle tension in the shoulders and neck, jaw clenching, headaches, shallow breathing, digestive issues, ongoing fatigue, and a constant feeling of being ''on edge.''"},
    {"type":"text","content":"Sleep becomes lighter and more disrupted. Stress hormones remain elevated. Over time, the immune system can become suppressed, leaving the system more vulnerable to illness and inflammation. The system ends up spending enormous energy bracing instead of repairing."},
    {"type":"divider"},
    {"type":"subheading","content":"The Path to Release"},
    {"type":"text","content":"Forgiveness is a process, not a moment. It unfolds in layers, at your pace, when your system is ready. Here is a gentle framework:"},
    {"type":"exercise","title":"Practice: The Forgiveness Process","prompt":"Begin this process with something small — a minor hurt, not the biggest wound. Build your forgiveness muscles gradually.","steps":["Name the hurt clearly: What happened? Who was involved? What did you lose?","Feel the feelings: Allow yourself to grieve what the experience cost you — without rushing to ''get over it.''","Separate the person from the behavior: ''What they did was wrong. That does not mean they are entirely defined by this action.''","Release the demand for a different past: ''I cannot change what happened. I can change what I carry.''","Choose to redirect your energy: Instead of feeding the wound, ask: ''What do I want to build with this energy?''","Repeat as needed: Forgiveness is not a one-time event. Some wounds require multiple rounds of release. That is normal."]},
    {"type":"callout","icon":"heart","content":"Forgiveness released the burden. The practices in the next lesson teach your system how to live like it''s free. That is how freedom becomes practical: one steady, honest choice at a time."},
    {"type":"quote","content":"Come unto me, all ye that labour and are heavy laden, and I will give you rest.","attribution":"Matthew 11:28"}
  ]}'),

  -- 7.3: From Letting Go to Living Free — EXISTING COMPREHENSIVE CONTENT
  (mod_id, 'From Letting Go to Living Free', 3, true, '{"estimated_minutes":25,"blocks":[{"type":"heading","content":"From Letting Go to Living Free"},{"type":"subheading","content":"Exceptional Mastery & Belief Reprogramming"},{"type":"bold_text","content":"Understanding the BTEA Cycle: Beliefs \u2192 Thoughts \u2192 Emotions \u2192 Actions"},{"type":"text","content":"This invisible loop powers most of what we do. We rarely see it running \u2014 we just feel the emotion and react. Once you understand it, you get to step in and take the wheel."},{"type":"list","items":["You carry core beliefs (many formed before age 7, shaped by your early attachment style: secure, anxious, avoidant, or disorganized).","Those beliefs spark automatic thoughts, often slipping in without you noticing.","Thoughts activate real neurochemical emotions.","Your Reticular Activating System (RAS) acts as the brain''s loyal filter, quietly scanning for evidence that matches those core beliefs.","Emotions fuel your actions \u2014 even the ones you wish you could take back."]},{"type":"divider"},{"type":"subheading","content":"The 4 Attachment Styles"},{"type":"text","content":"We''ve talked about these in a previous module, but here''s a quick overview with real-life examples in adult relationships:"},{"type":"callout","icon":"lightbulb","content":"Secure Attachment (the oak tree \u2014 strong roots, flexible branches): Comfortable with intimacy and independence. Trusts others, communicates openly, handles conflict calmly, and believes they''re worthy of love."},{"type":"callout","icon":"heart","content":"Anxious Attachment (the octopus \u2014 reaching for reassurance): Craves closeness but fears abandonment. Seeks constant validation, gets jealous or clingy during uncertainty."},{"type":"callout","icon":"alert","content":"Avoidant Attachment (the turtle in its shell): Prioritizes independence, pulls back from vulnerability. Values self-reliance and avoids deep emotions."},{"type":"callout","icon":"alert","content":"Disorganized Attachment (the cat in a tree \u2014 wants down, but is terrified): Craves connection but fears it. Swings between pursuing intensely and withdrawing suddenly."},{"type":"text","content":"These styles aren''t fixed labels \u2014 they''re early patterns that can shift toward secure and safe relationships with consistent practice (like the tools we''re using here). Most people lean toward one, but show traits of others in different situations."},{"type":"divider"},{"type":"subheading","content":"Neurochemical Emotions"},{"type":"text","content":"When we say emotions are neurochemical reactions, we mean they''re not just feelings in your head \u2014 they''re physical events in your system. Every emotion activates a cascade of chemicals:"},{"type":"list","items":["Fear or anxiety floods you with adrenaline and cortisol (fight/flight).","Sadness or grief lowers serotonin and dopamine while increasing stress hormones.","Joy or connection releases oxytocin, endorphins, and dopamine \u2014 the feel-good chemicals that make you feel safe and bonded."]},{"type":"text","content":"These chemicals change your heart rate, breathing, muscle tension, even digestion. That''s why an activated belief can make your chest tighten, your stomach drop, or your whole system freeze. Your nervous system is literally responding as if the old danger is happening right now."},{"type":"callout","icon":"heart","content":"Reprogramming can shift those chemical responses so calm, safety, and peace become the new default."},{"type":"divider"},{"type":"subheading","content":"The Reticular Activating System (RAS)"},{"type":"text","content":"The RAS functions like a filter in the brain. It helps determine what you notice, what stands out, and what your mind automatically pays attention to. When you''ve carried limiting beliefs for a long time, your RAS has been quietly scanning for evidence that confirms those beliefs."},{"type":"text","content":"Here is the hopeful part. The RAS is not fixed. As you begin gently updating your beliefs, your brain also begins learning to look for different kinds of evidence. You start to notice moments of safety. You see small efforts, subtle repairs, and tiny signs of growth."},{"type":"divider"},{"type":"subheading","content":"Why Negative Emotions Are Actually Your Best Friends"},{"type":"text","content":"Emotions are never the enemy. They''re messengers. They''re the smoke alarm telling you a belief is activated or a need is unmet. Here is the order that sets you free:"},{"type":"list","ordered":true,"items":["Feel the emotion (don''t shame it). Pause and allow it to be there fully. Name it, breathe into it, and notice where it lives in your system.","Question the thought or belief behind it. Ask gently: Is this 100% true? What evidence supports or challenges this story?","Identify the unmet need. Ask: What do I really need right now \u2014 reassurance, rest, connection, boundaries, or self-kindness?"]},{"type":"quote","content":"Your feelings reveal your internal programming far more than they describe what''s actually happening outside.","attribution":"Trisha Jamison"},{"type":"divider"},{"type":"subheading","content":"Your Brain Is a Needs-Meeting Machine"},{"type":"text","content":"Your brain is a brilliant needs-meeting machine. The problem is, it will always choose the fastest path to feel safe and secure \u2014 not necessarily the wisest or healthiest one \u2014 until you give it better, more effective options, especially when those options follow your values."},{"type":"divider"},{"type":"subheading","content":"Reprogramming Your Brain: The First Steps"},{"type":"text","content":"There are many steps to truly reprogramming your brain and nervous system so the old survival code can finally rest. Right now, we''re focusing on the foundational first two practices. These are powerful on their own, and they build the safety and awareness your system needs."},{"type":"exercise","title":"Practice 1: What Beliefs Shape My Life?","prompt":"Bring conscious awareness to the limiting beliefs quietly running each area of your life, so you can plant new, intentional seeds of what''s possible. For each area of your life, write one clear, hopeful sentence describing the outcome you truly desire \u2014 as if anything were possible and success were guaranteed.","steps":["Ask yourself: What would I want to create if I knew I was safe, supported, and loved, no matter what?","Keep your statements simple and positive, using present or near-future tense.","If you get stuck, start with: I am free to\u2026"]},{"type":"exercise","title":"Practice 2: The Emotional Processing Tool","prompt":"Interrupt emotional spirals in real time by slowing down, identifying what you''re feeling, uncovering the story underneath it, and choosing a healthier response. Practice this on one or two real moments per week.","steps":["Name the Emotion: What am I feeling right now? (Angry, Anxious, Overwhelmed, Hurt, Sad, Lonely, Ashamed, Insecure, Powerless, Unseen, Unsafe)","Identify the Activation: What just happened? Be specific \u2014 describe the moment, not the entire history.","Uncover the Meaning: What did I make this mean about me, my worth, my relationships, or my future?","Question the Story: Can I know with 100% certainty this belief is true?","Challenge & Update: List three pieces of evidence that do NOT support the painful belief. Find a kinder, more balanced explanation.","Name the Need: What do I actually need right now \u2014 reassurance, rest, connection, boundaries, validation, space, or self-compassion?","Choose a Healthy Strategy: What is one small, realistic way I can meet this need?"]},{"type":"divider"},{"type":"callout","icon":"heart","content":"You do not have to do this perfectly. You are learning \u2014 and that matters. The goal is not to eliminate emotion. The goal is to understand it, meet it with kindness, and choose a new response. Every time you walk through this process, you weaken an old neural pathway and strengthen a new one."},{"type":"quote","content":"Forgiveness released the burden. This practice teaches your system how to live like it''s free. That is how freedom becomes practical: one steady, honest choice at a time.","attribution":"Trisha Jamison"},{"type":"divider"},{"type":"heading","content":"A Note From Trisha"},{"type":"text","content":"Now that you have reached the end of this module, pause for a moment and recognize what you just did. You did not simply learn information. You integrated awareness, forgiveness, and intentional change into one powerful practice."},{"type":"text","content":"In 7.1, you saw your patterns clearly. In 7.2, you released what was heavy. In 7.3, you learned how to update what your system learned when it was trying to survive. Most people never get this framework."},{"type":"text","content":"Old reactions may resurface at times. That does not erase your progress. It simply means you are human. Return to what you have learned. Slow down. Practice again. Strengthen the new pathway."},{"type":"quote","content":"You are no longer operating on autopilot. You are living with awareness, and that changes everything. Forgiveness sets your heart free. Now you are teaching your nervous system how to live in that freedom.","attribution":"Trisha Jamison"}]}');

  -- 7.4: The Path to True Intimacy (parent + sub-lessons) — KEPT FROM EXISTING SEED
  INSERT INTO lessons (module_id, title, sort_order, is_preview, content_json)
  VALUES (mod_id, 'The Path to True Intimacy', 4, true, '{"estimated_minutes":8,"blocks":[{"type":"heading","content":"Healing Hearts and Rekindled Flames: The Path to True Intimacy"},{"type":"text","content":"Explore the six levels of intimacy and rebuild connection from the inside out."}]}')
  RETURNING id INTO parent_lesson_id;

  INSERT INTO lessons (module_id, parent_lesson_id, title, sort_order, is_preview, content_json) VALUES
  (mod_id, parent_lesson_id, 'Foundations & Safety', 5, true, '{"estimated_minutes":35,"blocks":[{"type":"text","content":"Trust, commitment, the SPARK Method\u2122, sliding door moments, and healing betrayal trauma."}]}'),
  (mod_id, parent_lesson_id, 'The Connection Layers', 6, true, '{"estimated_minutes":25,"blocks":[{"type":"text","content":"Verbal, emotional, and intellectual intimacy \u2014 tone, vulnerability, and curious before furious."}]}'),
  (mod_id, parent_lesson_id, 'Spiritual & Physical Intimacy', 7, true, '{"estimated_minutes":25,"blocks":[{"type":"text","content":"Shared meaning, safe touch, co-regulation, and the dual control model."}]}'),
  (mod_id, parent_lesson_id, 'Sexual Connection & Action Plan', 8, true, '{"estimated_minutes":25,"blocks":[{"type":"text","content":"Altruistic pleasure, sacred connection, and your weekly maintenance plan."}]}');

  -- =====================================================
  -- MODULE 8: LEGACY OF LOVE
  -- Integration, Resilience, and a Secured Future
  -- Registry: 8.1 Burnout, 8.2 Healthy Coping,
  --           8.3 Financial Freedom (F.1-F.4), 8.4 Future-Proofing
  -- Vault content: B.1 (7.5K), F.1-F.4 (~31K total)
  -- =====================================================
  INSERT INTO modules (course_id, module_number, title, description, sort_order)
  VALUES (flagship_id, '8', 'Legacy of Love', 'Integration, resilience, and building a secured future together.', 8)
  RETURNING id INTO mod_id;

  -- 8.1: Running on Empty — REAL VAULT CONTENT (Module B.1)
  INSERT INTO lessons (module_id, title, sort_order, content_json) VALUES
  (mod_id, 'Running on Empty', 1, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"The Architecture of Exhaustion"},
    {"type":"quote","content":"Burnout isn''t a failure of will. It''s a structural collapse caused by carrying too much, for too long, alone.","attribution":"Trisha Jamison"},
    {"type":"text","content":"Welcome. If you are reading this module, it''s likely because you or your partner feel like you are running on fumes — or perhaps, you ran out of fumes miles ago and are now just coasting on sheer willpower."},
    {"type":"text","content":"In the Healing Hearts curriculum, we talk a lot about emotional safety and connection. But sometimes, the physical and mental load of life becomes so heavy that ''connection'' feels like just another chore on the to-do list. That isn''t a character flaw. It''s a physiological state called Burnout."},
    {"type":"divider"},
    {"type":"subheading","content":"The View from the Edge — Dr. Mark''s Story"},
    {"type":"text","content":"Dr. Mark is a Family Practice Physician with over 30 years of experience. He understands burnout not just because he has treated it in hundreds of patients, but because he has lived it."},
    {"type":"text","content":"''I owned my own medical practice for nearly 30 years. My patients got the best of me — my compassion, my focus, my energy. My family got the worst of me — my silence, my irritability, and my exhaustion. I don''t know exactly when I crossed the line from stressed to burned out. It likely happened years before I noticed.''"},
    {"type":"callout","icon":"heart","content":"Burnout is real. It has real costs. But it does not have to be your permanent address."},
    {"type":"divider"},
    {"type":"subheading","content":"Stress vs. Burnout"},
    {"type":"bold_text","content":"Stress is visiting the Red Zone. Burnout is getting stuck there."},
    {"type":"text","content":"When you are in burnout, your system believes it is being hunted 24/7. You toggle between high-anxiety (Red) and total collapse (Blue). The Green Zone — where you connect with your partner — becomes physically inaccessible. You aren''t unloving. You are structurally unavailable."},
    {"type":"subheading","content":"How We Break: The Gendered Phenotypes"},
    {"type":"text","content":"One of the most confusing parts of burnout is that it looks different on everyone. Often, men and women break in different ways."},
    {"type":"callout","icon":"alert","content":"The ''Female'' Experience — Emotional Exhaustion: Feeling of having your emotional well dry up completely. The internal voice: ''I have nothing left to give.'' Shows up as weeping, feeling invisible, deep physical fatigue that sleep doesn''t fix, and over-functioning to earn rest."},
    {"type":"callout","icon":"alert","content":"The ''Male'' Experience — Depersonalization & Cynicism: A defense mechanism where the brain detaches from people to stop the drain. The internal voice: ''Everyone is an idiot'' or ''I just want to be left alone.'' Shows up as irritability, treating people like obstacles, and numbing out."},
    {"type":"quote","content":"In the architecture of exhaustion, cynicism isn''t a bad attitude — it''s emergency structural bracing.","attribution":"Dr. Mark"},
    {"type":"text","content":"If your partner is acting cold, cynical, or distant, it is easy to assume they don''t love you. In reality, their nervous system might be building a wall to keep them from collapsing. They aren''t trying to shut you out — they are trying to hold themselves up."},
    {"type":"divider"},
    {"type":"subheading","content":"Self-Assessment: The Vitals Check"},
    {"type":"text","content":"Stress is characterized by too much: too much pressure, too much urgency. Burnout is characterized by not enough: not enough motivation, not enough hope."},
    {"type":"exercise","title":"Practice: The Burnout Vitals Check","prompt":"Check the statements that feel true for you right now. If you check 3 or more on the Burnout list, your engine light is on.","steps":["Stress signs: I feel anxious and hyperactive. I can''t turn my brain off at night. I feel like if I just work harder, I can catch up.","Burnout signs: I feel numb or empty. I dread getting out of bed. I feel cynical about things I used to care about. I feel ineffective — like nothing I do makes a difference.","If burnout resonates: Please stop trying to push through. You cannot productivity-hack your way out of burnout. The only way out is to repair the structure.","Share your results with your partner — not to fix, but to be seen."]}
  ]}'),

  -- 8.2: Healthy Coping — stub (vault content exists in DOCX, not yet converted)
  (mod_id, 'Healthy Coping', 2, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"When the Ladder Leads Nowhere"},
    {"type":"subheading","content":"Healthy Coping Strategies for Couples in Crisis"},
    {"type":"text","content":"When burnout hits, most people reach for the coping strategies they already know — some healthy, many not. This lesson helps you identify which strategies are actually restoring you and which ones are just numbing the pain without healing the wound."},
    {"type":"text","content":"Healthy coping is not about being perfect. It''s about being honest. It''s about recognizing when your current strategies are keeping you stuck in survival mode, and choosing — one small step at a time — to build something better."},
    {"type":"callout","icon":"lightbulb","content":"Full lesson content is being prepared. This module will cover: identifying numbing vs. restoring strategies, building a personal coping toolkit, and creating a couples'' recovery plan."},
    {"type":"exercise","title":"Practice: The Coping Audit","prompt":"Honestly evaluate your current coping strategies.","steps":["List the 5 things you do most often when you are stressed or overwhelmed.","For each one, ask: Does this restore me, or just numb me?","Identify one numbing strategy you are willing to replace with one restoring strategy this week."]}
  ]}');

  -- 8.3: Financial Freedom — Parent lesson with F.1-F.4 as sub-lessons
  INSERT INTO lessons (module_id, title, sort_order, content_json)
  VALUES (mod_id, 'Financial Freedom', 3, '{"estimated_minutes":10,"blocks":[
    {"type":"heading","content":"Financial Freedom"},
    {"type":"subheading","content":"Because Money Fights Are Never Really About Money"},
    {"type":"text","content":"This series of four lessons will transform how you and your partner relate to money. We are not starting with spreadsheets. We are starting with safety — because you cannot do high-level math when you are being chased by a tiger."},
    {"type":"text","content":"You will learn how your nervous system reacts to financial stress, how your attachment style shows up in your wallet, how to face debt without shame, how to build long-term wealth together, and how to make big financial decisions as a team."}
  ]}')
  RETURNING id INTO parent_lesson_id;

  -- F.1: The Financial Nervous System — REAL VAULT CONTENT
  INSERT INTO lessons (module_id, parent_lesson_id, title, sort_order, content_json) VALUES
  (mod_id, parent_lesson_id, 'The Financial Nervous System', 4, '{"estimated_minutes":45,"blocks":[
    {"type":"heading","content":"The Financial Nervous System"},
    {"type":"subheading","content":"Why Money Feels Like a Tiger"},
    {"type":"quote","content":"Money is the currency of the world, but trust is the currency of your relationship. We cannot build one without the other.","attribution":"Trisha Jamison"},
    {"type":"text","content":"If you have ever felt your heart race when a bill arrives, or felt a sudden wave of exhaustion when your partner says ''We need to talk about the budget,'' you are not alone. Money is often cited as the number one source of conflict in relationships. But here is the secret: couples rarely fight about math. They fight about what the money represents."},
    {"type":"text","content":"To your Critter Brain, money is not just paper or numbers. Money is food, shelter, safety, and freedom. When money feels scarce or uncertain, your nervous system doesn''t see a balance sheet problem. It sees a threat to your survival. It sees a tiger."},
    {"type":"callout","icon":"alert","content":"You cannot do high-level math when you are being chased by a tiger. If you or your partner are in the Red Zone or Blue Zone, no amount of budgeting software or financial advice will help. The first step to financial literacy is regulation."},
    {"type":"divider"},
    {"type":"subheading","content":"The Money Map: Attachment Styles and Your Wallet"},
    {"type":"callout","icon":"lightbulb","content":"The Avoidant ''Turtle'' & Money: Values independence above all. ''My money is my safety.'' Often keeps finances separate or secret. Good at saving but may hide debt to avoid conflict."},
    {"type":"callout","icon":"lightbulb","content":"The Anxious ''Octopus'' & Money: Seeks connection and reassurance. May use spending to soothe anxiety (''retail therapy''). Might micromanage the budget or constantly ask ''Are we okay?'' Highly attuned to the family''s needs and generous."},
    {"type":"callout","icon":"heart","content":"The Secure ''Oak Tree'' & Money: Views money as a shared resource to build a shared life. ''We can figure this out.'' Can talk about debt or mistakes without shame. Transparency is the default."},
    {"type":"divider"},
    {"type":"subheading","content":"Undiscussed Assumptions — Your Hidden Blueprints"},
    {"type":"text","content":"A CPA we work with noted that the biggest cause of financial failure isn''t a lack of income — it''s ''Undiscussed Assumptions.'' These are the scripts you heard growing up. Imagine: Partner 1 grew up poor. To them, $1,000 in savings feels unsafe — they need $10,000 to breathe. Partner 2 grew up wealthy but neglected. To them, spending money is how you show love. The conflict? They aren''t fighting about math. They are fighting about their blueprints."},
    {"type":"exercise","title":"Practice: Building Financial Safety","prompt":"Choose the intensity level that feels right for you today.","steps":["Low Intensity — The 3-Minute History: Take 3 minutes alone. Finish: ''One phrase I heard about money growing up was...'' Share with your partner. The listener can only say: ''Thank you for sharing.''","Medium Intensity — The Zone Checklist: For common financial scenarios (paying bills, discussing debt, making big purchases), mark which Zone you usually go into. Share with your partner and ask: ''What is one thing I can do to help you stay in the Green Zone?''","High Intensity — The I Feel / I Need Money Talk: Pick one current financial stressor. Take turns: ''When I think about [issue]... I feel [emotion]... My story is that [fear]... What I need to feel safe is [specific request].''"]},
    {"type":"callout","icon":"heart","content":"I know it is tempting to skip this ''feeling'' work and get straight to the spreadsheets. But please, pause. If you try to build a budget while your nervous system is screaming ''Danger!'' — that budget will fail. Not because you are bad at math. Because your biology is overriding your logic."}
  ]}'),

  -- F.2: The Safety Net — REAL VAULT CONTENT
  (mod_id, parent_lesson_id, 'The Safety Net', 5, '{"estimated_minutes":45,"blocks":[
    {"type":"heading","content":"The Safety Net"},
    {"type":"subheading","content":"Turning ''The Budget'' into a Permission Slip"},
    {"type":"quote","content":"A budget isn''t a prison. It is simply a plan for your money so it doesn''t accidentally get spent on things you don''t care about.","attribution":"Trisha Jamison"},
    {"type":"text","content":"We are going to use the B-word: Budget. For many, this word feels like a punishment — restriction, scarcity, and saying no. But in the Healing Hearts framework, we look at it differently."},
    {"type":"text","content":"If you were walking through a dark forest, would you want a flashlight? Of course. A budget is just a flashlight. It doesn''t tell you where to go — it just illuminates where you are so you don''t trip."},
    {"type":"divider"},
    {"type":"subheading","content":"Facing the Hidden Ghost"},
    {"type":"text","content":"When we are in the Blue Zone (Freeze/Avoid), we try to survive by not looking. We swipe the card and hope it goes through. We toss the bill in the drawer. This creates a ''Hidden Ghost'' — a low-level anxiety that runs in the background 24/7. It drains your energy, kills your libido, and shortens your patience. The goal today is not to fix everything instantly. The goal is simply to turn on the lights."},
    {"type":"subheading","content":"Two Strategies for Clearing Debt"},
    {"type":"callout","icon":"lightbulb","content":"Strategy A — The Debt Snowball (Emotional Momentum): List debts from smallest to largest balance. Pay minimum on everything, throw extra at the smallest. When it''s gone — you get a quick win! Your brain releases dopamine. Roll that payment into the next debt. Best for: the Anxious Octopus or those feeling overwhelmed."},
    {"type":"callout","icon":"lightbulb","content":"Strategy B — The Debt Avalanche (Logical Speed): List debts by highest interest rate. Attack the highest-rate debt first. Mathematically saves the most money over time. Best for: the Avoidant Turtle or highly logical thinkers."},
    {"type":"divider"},
    {"type":"subheading","content":"The Green Zone Budget Meeting"},
    {"type":"text","content":"Most couples try to budget when they are already stressed. That is a recipe for disaster. We are going to treat this meeting like a date."},
    {"type":"exercise","title":"Practice: The Budget Date","prompt":"Schedule your first Green Zone budget meeting using these rules of engagement.","steps":["Schedule it — do not spring it on your partner on a Tuesday night.","Set the timer: 30 minutes maximum. If you aren''t done, you stop anyway.","No ''You'' statements. Use: ''I feel worried about...'' instead of ''You spent too much on...''","The Stop Word: If either partner hits the Red Zone (heart racing, anger), call ''Time Out.'' Regulate. Come back later.","Start with the easy numbers first. Celebrate the money coming in before looking at what''s going out."]},
    {"type":"callout","icon":"heart","content":"One of you might be the ''Gas'' (pushing for growth, investing, fun). One of you might be the ''Brakes'' (checking for safety, saving, risk-management). A car needs both gas and brakes to drive safely. You are a team. And now, you have a flashlight."}
  ]}'),

  -- F.3: Growing the Oak Tree — REAL VAULT CONTENT
  (mod_id, parent_lesson_id, 'Growing the Oak Tree', 6, '{"estimated_minutes":45,"blocks":[
    {"type":"heading","content":"Growing the Oak Tree"},
    {"type":"subheading","content":"Credit, Assets, and Building a Shared Future"},
    {"type":"quote","content":"Compound interest is just the financial version of trust. Small deposits, repeated over time, create something unshakeable.","attribution":"Trisha Jamison"},
    {"type":"text","content":"In the previous modules, we focused on safety — putting out fires, facing debt. Now, we are shifting our focus to growth. We are going to look at how you build a financial Oak Tree that can shelter your family for decades."},
    {"type":"divider"},
    {"type":"subheading","content":"The Trust Score (FICO)"},
    {"type":"text","content":"In a relationship, trust is built by showing up, keeping promises, and being predictable. In the financial world, trust is measured by a three-digit number: your FICO Score. Many people feel shame about their score. Let''s reframe this: your credit score is not a report card on your value as a human being. It is simply a measurement of reliability."},
    {"type":"text","content":"65% of your score comes down to two things: Did you keep your promise (Payment History — 35%)? And are you maxed out (Amounts Owed — 30%)? The goal: we want our credit score to be ''boring.'' Predictable. No drama."},
    {"type":"subheading","content":"The Magic of Time — Compound Interest"},
    {"type":"text","content":"Compound interest is money making babies, and then those babies making babies. If you invest $100 today, next year you might have $110. The year after, you aren''t earning interest on $100 — you are earning on $110. You do not need to be rich to build an Oak Tree. You just need Time."},
    {"type":"text","content":"In relationships, one date night doesn''t save a marriage. But a weekly date night for 10 years creates an unbreakable bond. In finance, saving $50 once doesn''t make you rich. But saving $50 a month for 30 years creates a forest."},
    {"type":"subheading","content":"The Home: Investment vs. Sanctuary"},
    {"type":"text","content":"''House Poor'' is when you have a beautiful roof over your head, but you are eating ramen noodles in the dark because you can''t afford the electric bill. If owning a home creates constant fight-or-flight anxiety about the mortgage, it is not an Oak Tree. It''s a cage. It is okay to rent if renting keeps your nervous system in the Green Zone."},
    {"type":"exercise","title":"Practice: The Future Vision","prompt":"Choose the intensity that feels right.","steps":["Low: Check your credit score separately. Share a color instead of a number — Green (700+), Yellow (600-699), or Red (<600). If your partner says Yellow or Red, simply say: ''Thank you for being honest. We can improve that color together.''","Medium: Sit together. Imagine 20 years from now. Ask: ''If we put away just small amounts consistently, what do we want that to look like?'' Write down one small action (e.g., auto-transfer $50/month) that starts that forest today.","High: For a major purchase (home, car), use the Green Zone Check — if one of you lost your job for 3 months, would this payment put you in the Red Zone? If yes, it might be too much risk right now."]}
  ]}'),

  -- F.4: The Decision Toolbox — REAL VAULT CONTENT
  (mod_id, parent_lesson_id, 'The Decision Toolbox', 7, '{"estimated_minutes":45,"blocks":[
    {"type":"heading","content":"The Decision Toolbox"},
    {"type":"subheading","content":"The Mechanics of Big Decisions"},
    {"type":"quote","content":"Anxiety comes from the unknown. Peace comes from having a plan.","attribution":"Trisha Jamison"},
    {"type":"text","content":"Welcome to the Toolbox. In Modules F.1 through F.3, we built the foundation: safety, communication, and long-term vision. This final module is your Reference Manual — you will pull this out when life presents you with a specific, expensive choice."},
    {"type":"divider"},
    {"type":"subheading","content":"The Car Conundrum: Lease vs. Buy"},
    {"type":"text","content":"Buying a car is often the second largest purchase a family makes. There is immense value in the last 50,000 miles of a car''s life — when it is paid off but still running. That is where you save money."},
    {"type":"exercise","title":"Decision Tree: Lease or Buy?","prompt":"Walk through these questions to find your path.","steps":["Do you drive more than 12,000 miles per year? If YES — you should likely BUY (leases have strict mileage penalties).","Do you insist on driving a brand-new car every 2–3 years? If YES — CONSIDER LEASING (leasing is essentially a long-term rental).","Do you have the cash for a down payment? If YES — BUY and drive it as long as you can.","Green Zone Tip: Never buy the ''extra warranty'' or ''protection packages'' without sleeping on it first. That is where the dealer makes their gravy."]},
    {"type":"subheading","content":"The Mortgage Menu"},
    {"type":"list","items":["Fixed-Rate Mortgage (The Oak Tree): Rate stays the same for 15 or 30 years. Your payment never changes. Best for families who plan to stay put.","ARM — Adjustable Rate Mortgage: Rate starts low but floats up or down after a few years. If rates skyrocket, your payment could double. Best only for people who know they will move in 3–5 years.","HELOC — Home Equity Line of Credit: A credit card backed by your house. Only use for things that add value to the home — never for consumer spending. If you can''t pay it back, you risk foreclosure."],"ordered":false},
    {"type":"subheading","content":"The Credit Card Trap — Daily Compounding"},
    {"type":"text","content":"Why is it so hard to pay off credit cards? Because of daily compounding. Day 1: they charge interest on the balance. Day 2: they charge interest on the balance PLUS the interest from Day 1. Day 3: interest on everything including interest on interest. When you make a minimum payment, you are mostly paying the interest on the interest."},
    {"type":"exercise","title":"Practice: The Big Purchase Simulation","prompt":"Run the numbers while in the Green Zone — before you enter the dealership or bank.","steps":["The True Cost: Listed Price + Taxes & Fees (usually 10%) = Total Price.","The Monthly Impact: Estimated Payment + New Insurance Cost = Total Monthly Hit.","The Stress Test: Look at your budget. Add the Total Monthly Hit. Imagine one partner loses their income for 3 months. Can you still make this payment?","The Value Check: Does this purchase bring us closer to our Oak Tree vision? Or are we buying it to self-soothe or impress others?"]},
    {"type":"callout","icon":"heart","content":"Financial literacy isn''t about knowing every tax code or stock trend. It is about alignment — two people looking at a scary world and saying: ''We have a plan. We have a flashlight. And we have each other.''"}
  ]}');

  -- 8.4: Future-Proofing — stub
  INSERT INTO lessons (module_id, title, sort_order, content_json) VALUES
  (mod_id, 'Future-Proofing Your Marriage', 8, '{"estimated_minutes":60,"blocks":[
    {"type":"heading","content":"Future-Proofing Your Marriage"},
    {"type":"subheading","content":"Building a Legacy That Transforms Generations"},
    {"type":"text","content":"You have journeyed through eight modules of deep, transformative work. You have mapped your attachment styles, understood your nervous system, healed core wounds, practiced forgiveness, expanded your Green Zone, and built financial safety together."},
    {"type":"text","content":"This final lesson is about integration — weaving everything you have learned into a sustainable vision for the marriage you are building. Not a perfect marriage. A resilient one. One that can weather storms, grow through seasons, and leave a legacy of love for the next generation."},
    {"type":"callout","icon":"heart","content":"Full lesson content is being prepared. This module will cover: creating your shared marriage vision, building a 30-day legacy plan, designing sustainable rhythms of connection, and writing your marriage mission statement."},
    {"type":"exercise","title":"Practice: Your Marriage Vision","prompt":"Craft a shared vision for the marriage you are building together.","steps":["Separately, write down: What do I want our marriage to look like in 5 years? 10 years? 20 years?","Share your visions with each other. Look for overlap and shared dreams.","Together, write one paragraph — your Marriage Vision Statement — that captures the essence of where you are headed.","Post it somewhere you will both see it daily. Let it anchor your choices."]}
  ]}');

END $$;

-- =====================================================
-- STANDALONE BUNDLES
-- =====================================================

INSERT INTO courses (slug, title, description, price_cents, course_type) VALUES
('conflict-rescue-kit', 'The Conflict Rescue Kit', 'Stop the bleeding. Learn to fight without destroying. If your arguments have become a warzone, this is where you start.', 3900, 'bundle'),
('communication-mastery', 'Communication Mastery Toolkit', 'Say what you mean — and hear what they''re really saying. Teaches you to express needs without blame.', 3900, 'bundle'),
('toxic-pattern-breaker', 'Toxic Pattern Breaker', 'Name it. Trace it. Break the cycle. Identify gaslighting, manipulation, and emotional immaturity patterns.', 3900, 'bundle'),
('spark-intimacy', 'Spark & Intimacy Bundle', 'From roommates back to lovers. Addresses the full spectrum of intimacy.', 4900, 'bundle'),
('financial-unity', 'Financial Unity System', 'Because money fights are never really about money. Understand how financial childhoods shaped spending identities.', 3900, 'bundle');
