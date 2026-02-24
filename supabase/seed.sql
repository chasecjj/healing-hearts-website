-- =====================================================
-- Healing Hearts — Seed Data
-- Run AFTER 001_initial_schema.sql
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
BEGIN
  SELECT id INTO flagship_id FROM courses WHERE slug = 'healing-hearts-journey';

  -- Module 1: Love's Foundation
  INSERT INTO modules (course_id, module_number, title, description, sort_order)
  VALUES (flagship_id, '1', 'Love''s Foundation', 'Personality blueprint, attachment style, and love language.', 1)
  RETURNING id INTO mod_id;

  INSERT INTO lessons (module_id, title, sort_order, content_json) VALUES
  (mod_id, 'Welcome to the Journey', 1, '{"blocks":[{"type":"text","content":"Welcome to Healing Hearts. In this introductory lesson, Jeff and Trisha walk you through what to expect from the program and how to get the most from your experience."}]}'),
  (mod_id, 'Your Personality Blueprint', 2, '{"blocks":[{"type":"text","content":"Understanding your unique personality wiring is the first step to understanding your relationship dynamics."}]}'),
  (mod_id, 'Attachment Styles 101', 3, '{"blocks":[{"type":"text","content":"Discover your attachment style and how it shapes every interaction with your partner."}]}'),
  (mod_id, 'The Language of Connection', 4, '{"blocks":[{"type":"text","content":"Learn to speak your partner''s love language — and teach them yours."}]}');

  -- Module 2: Invisible Chains
  INSERT INTO modules (course_id, module_number, title, description, sort_order)
  VALUES (flagship_id, '2', 'Invisible Chains', 'Recognize toxic patterns hiding in plain sight.', 2)
  RETURNING id INTO mod_id;

  INSERT INTO lessons (module_id, title, sort_order, content_json) VALUES
  (mod_id, 'Recognizing Toxic Patterns', 1, '{"blocks":[{"type":"text","content":"Some patterns erode trust at the foundation. Learn to identify gaslighting, manipulation, and emotional immaturity."}]}'),
  (mod_id, 'Projection and Shadow', 2, '{"blocks":[{"type":"text","content":"Understanding how we project our unresolved wounds onto our partner — and how to stop."}]}'),
  (mod_id, 'Breaking the Cycle', 3, '{"blocks":[{"type":"text","content":"Practical strategies for interrupting destructive patterns before they escalate."}]}');

  -- Module 3: The Deep Roots
  INSERT INTO modules (course_id, module_number, title, description, sort_order)
  VALUES (flagship_id, '3', 'The Deep Roots', 'Understand how your childhood wrote a Mindprint.', 3)
  RETURNING id INTO mod_id;

  INSERT INTO lessons (module_id, title, sort_order, content_json) VALUES
  (mod_id, 'Your Childhood Blueprint', 1, '{"blocks":[{"type":"text","content":"How early experiences created your relational template."}]}'),
  (mod_id, 'The Mindprint', 2, '{"blocks":[{"type":"text","content":"Mapping the subconscious patterns that drive your behavior in relationships."}]}'),
  (mod_id, 'Reparenting Exercises', 3, '{"blocks":[{"type":"text","content":"Practical exercises for healing childhood wounds that show up in your marriage."}]}');

  -- Module 4: Breakthrough Communication
  INSERT INTO modules (course_id, module_number, title, description, sort_order)
  VALUES (flagship_id, '4', 'Breakthrough Communication', 'Express needs without blame, listen without defending.', 4)
  RETURNING id INTO mod_id;

  INSERT INTO lessons (module_id, title, sort_order, content_json) VALUES
  (mod_id, 'The SPARK Method', 1, '{"blocks":[{"type":"text","content":"A 5-step framework for transforming conflict into connection."}]}'),
  (mod_id, 'Active Listening Deep Dive', 2, '{"blocks":[{"type":"text","content":"Master the art of truly hearing your partner — beyond just the words."}]}'),
  (mod_id, 'Expressing Needs Without Blame', 3, '{"blocks":[{"type":"text","content":"Learn to voice your deepest needs in ways that invite closeness rather than defensiveness."}]}');

  -- Module 5: Nervous System Regulation
  INSERT INTO modules (course_id, module_number, title, description, sort_order)
  VALUES (flagship_id, '5', 'Nervous System Regulation', 'Calm the storm inside before addressing the storm between you.', 5)
  RETURNING id INTO mod_id;

  INSERT INTO lessons (module_id, title, sort_order, content_json) VALUES
  (mod_id, 'The 90-Second Wave', 1, '{"blocks":[{"type":"text","content":"Understanding the neurochemistry of emotional flooding and how to ride the wave."}]}'),
  (mod_id, 'Zones of Resilience', 2, '{"blocks":[{"type":"text","content":"Identify your window of tolerance and learn to expand it."}]}'),
  (mod_id, 'Co-Regulation Practices', 3, '{"blocks":[{"type":"text","content":"How to regulate together — calming each other''s nervous systems as a team."}]}');

  -- Module 6: Emotional Zones
  INSERT INTO modules (course_id, module_number, title, description, sort_order)
  VALUES (flagship_id, '6', 'Emotional Zones', 'Map your emotional landscape and learn to navigate it together.', 6)
  RETURNING id INTO mod_id;

  INSERT INTO lessons (module_id, title, sort_order, content_json) VALUES
  (mod_id, 'Critter Brain vs CEO Brain', 1, '{"blocks":[{"type":"text","content":"Understanding the two operating systems in your brain and when each takes over."}]}'),
  (mod_id, 'Emotional Maturity Assessment', 2, '{"blocks":[{"type":"text","content":"Honestly evaluate where you are on the emotional maturity spectrum."}]}'),
  (mod_id, 'Growing Together', 3, '{"blocks":[{"type":"text","content":"How couples can grow emotionally together instead of apart."}]}');

  -- Module 7: Subconscious Core Wounds (PREVIEW MODULE — free for all authenticated users)
  INSERT INTO modules (course_id, module_number, title, description, sort_order, is_preview)
  VALUES (flagship_id, '7', 'Subconscious Core Wounds', 'Heal the hidden wounds driving your relationship patterns.', 7, true)
  RETURNING id INTO mod_id;

  INSERT INTO lessons (module_id, title, sort_order, is_preview, content_json) VALUES
  (mod_id, 'Identifying Core Wounds', 1, true, '{"estimated_minutes":12,"blocks":[{"type":"heading","content":"Identifying Core Wounds"},{"type":"text","content":"Discover the deep wounds that silently control your reactions. In this lesson, you''ll learn to recognize the patterns that have been running beneath the surface of your relationships — patterns rooted in early attachment experiences and childhood pain."},{"type":"callout","icon":"heart","content":"Core wounds are not character flaws. They are survival strategies your younger self created to stay safe. Recognizing them is the first act of healing."},{"type":"text","content":"Every couple faces moments where a small disagreement suddenly feels enormous. That''s often a sign that a core wound has been touched — a deep belief about your worth, safety, or lovability that was formed long before your current relationship."}]}'),
  (mod_id, 'The Power of Forgiveness', 2, true, '{"estimated_minutes":15,"blocks":[{"type":"heading","content":"The Power of Forgiveness"},{"type":"text","content":"Forgiveness is not about excusing what happened. It''s about releasing the weight so you can move forward. In this lesson, you''ll explore what real forgiveness looks like — and what it doesn''t."},{"type":"callout","icon":"lightbulb","content":"Forgiveness doesn''t mean reconciliation. It doesn''t mean forgetting. It means choosing to stop letting the pain control your present."},{"type":"text","content":"When we carry resentment, our nervous system stays in a state of low-grade threat. Forgiveness — done at your own pace, on your own terms — helps your body finally exhale."}]}'),
  (mod_id, 'From Letting Go to Living Free', 3, true, '{"estimated_minutes":25,"blocks":[{"type":"heading","content":"From Letting Go to Living Free"},{"type":"subheading","content":"Exceptional Mastery & Belief Reprogramming"},{"type":"bold_text","content":"Understanding the BTEA Cycle: Beliefs → Thoughts → Emotions → Actions"},{"type":"text","content":"This invisible loop powers most of what we do. We rarely see it running — we just feel the emotion and react. Once you understand it, you get to step in and take the wheel."},{"type":"list","items":["You carry core beliefs (many formed before age 7, shaped by your early attachment style: secure, anxious, avoidant, or disorganized).","Those beliefs spark automatic thoughts, often slipping in without you noticing.","Thoughts trigger real neurochemical emotions.","Your Reticular Activating System (RAS) acts as the brain''s loyal filter, quietly scanning for evidence that matches those core beliefs.","Emotions fuel your actions — even the ones you wish you could take back."]},{"type":"divider"},{"type":"subheading","content":"The 4 Attachment Styles"},{"type":"text","content":"We''ve talked about these in a previous module, but here''s a quick overview with real-life examples in adult relationships:"},{"type":"callout","icon":"lightbulb","content":"Secure Attachment (the oak tree — strong roots, flexible branches): Comfortable with intimacy and independence. Trusts others, communicates openly, handles conflict calmly, and believes they''re worthy of love."},{"type":"callout","icon":"heart","content":"Anxious Attachment (the octopus — reaching for reassurance): Craves closeness but fears abandonment. Seeks constant validation, gets jealous or clingy during uncertainty."},{"type":"callout","icon":"alert","content":"Avoidant Attachment (the turtle in its shell): Prioritizes independence, pulls back from vulnerability. Values self-reliance and avoids deep emotions."},{"type":"callout","icon":"alert","content":"Disorganized Attachment (the cat in a tree — wants down, but is terrified): Craves connection but fears it. Swings between pursuing intensely and withdrawing suddenly."},{"type":"text","content":"These styles aren''t fixed labels — they''re early patterns that can shift toward secure and safe relationships with consistent practice (like the tools we''re using here). Most people lean toward one, but show traits of others in different situations."},{"type":"divider"},{"type":"subheading","content":"Neurochemical Emotions"},{"type":"text","content":"When we say emotions are neurochemical reactions, we mean they''re not just feelings in your head — they''re physical events in your body and brain. Every emotion triggers a cascade of chemicals:"},{"type":"list","items":["Fear or anxiety floods you with adrenaline and cortisol (fight/flight).","Sadness or grief lowers serotonin and dopamine while increasing stress hormones.","Joy or connection releases oxytocin, endorphins, and dopamine — the feel-good chemicals that make you feel safe and bonded."]},{"type":"text","content":"These chemicals change your heart rate, breathing, muscle tension, even digestion. That''s why a triggered belief can make your chest tighten, your stomach drop, or your whole body freeze. Your nervous system is literally responding as if the old danger is happening right now."},{"type":"callout","icon":"heart","content":"Reprogramming can shift those chemical responses so calm, safety, and peace become the new default."},{"type":"divider"},{"type":"subheading","content":"The Reticular Activating System (RAS)"},{"type":"text","content":"The RAS functions like a filter in the brain. It helps determine what you notice, what stands out, and what your mind automatically pays attention to. When you''ve carried limiting beliefs for a long time, your RAS has been quietly scanning for evidence that confirms those beliefs."},{"type":"text","content":"Here is the hopeful part. The RAS is not fixed. As you begin gently updating your beliefs, your brain also begins learning to look for different kinds of evidence. You start to notice moments of safety. You see small efforts, subtle repairs, and tiny signs of growth."},{"type":"divider"},{"type":"subheading","content":"Why Negative Emotions Are Actually Your Best Friends"},{"type":"text","content":"Emotions are never the enemy. They''re messengers. They''re the smoke alarm telling you a belief is triggered or a need is unmet. Here is the order that sets you free:"},{"type":"list","ordered":true,"items":["Feel the emotion (don''t shame it). Pause and allow it to be there fully. Name it, breathe into it, and notice where it lives in your body.","Question the thought or belief behind it. Ask gently: Is this 100% true? What evidence supports or challenges this story?","Identify the unmet need. Ask: What do I really need right now — reassurance, rest, connection, boundaries, or self-kindness?"]},{"type":"quote","content":"Your feelings reveal your internal programming far more than they describe what''s actually happening outside.","attribution":"Trisha Jamison"},{"type":"divider"},{"type":"subheading","content":"Your Brain Is a Needs-Meeting Machine"},{"type":"text","content":"Your brain is a brilliant needs-meeting machine. The problem is, it will always choose the fastest path to feel safe and secure — not necessarily the wisest or healthiest one — until you give it better, more effective options, especially when those options follow your values."},{"type":"divider"},{"type":"subheading","content":"Reprogramming Your Brain: The First Steps"},{"type":"text","content":"There are many steps to truly reprogramming your brain and nervous system so the old survival code can finally rest. Right now, we''re focusing on the foundational first two exercises. These are powerful on their own, and they build the safety and awareness your system needs."},{"type":"exercise","title":"Exercise 1: What Beliefs Shape My Life?","prompt":"Bring conscious awareness to the limiting beliefs quietly running each area of your life, so you can plant new, intentional seeds of what''s possible. For each area of your life, write one clear, hopeful sentence describing the outcome you truly desire — as if anything were possible and success were guaranteed.","steps":["Ask yourself: What would I want to create if I knew I was safe, supported, and loved, no matter what?","Keep your statements simple and positive, using present or near-future tense.","If you get stuck, start with: I am free to…"]},{"type":"exercise","title":"Exercise 2: The Emotional Processing Tool","prompt":"Interrupt emotional spirals in real time by slowing down, identifying what you''re feeling, uncovering the story underneath it, and choosing a healthier response. Practice this on one or two real moments per week.","steps":["Name the Emotion: What am I feeling right now? (Angry, Anxious, Overwhelmed, Hurt, Sad, Lonely, Ashamed, Insecure, Powerless, Unseen, Unsafe)","Identify the Trigger: What just happened? Be specific — describe the moment, not the entire history.","Uncover the Meaning: What did I make this mean about me, my worth, my relationships, or my future?","Question the Story: Can I know with 100% certainty this belief is true?","Challenge & Update: List three pieces of evidence that do NOT support the painful belief. Find a kinder, more balanced explanation.","Name the Need: What do I actually need right now — reassurance, rest, connection, boundaries, validation, space, or self-compassion?","Choose a Healthy Strategy: What is one small, realistic way I can meet this need?"]},{"type":"divider"},{"type":"callout","icon":"heart","content":"You do not have to do this perfectly. You are learning — and that matters. The goal is not to eliminate emotion. The goal is to understand it, meet it with kindness, and choose a new response. Every time you walk through this process, you weaken an old neural pathway and strengthen a new one."},{"type":"quote","content":"Forgiveness released the burden. This practice teaches your body how to live like it''s free. That is how freedom becomes practical: one steady, honest choice at a time.","attribution":"Trisha Jamison"},{"type":"divider"},{"type":"heading","content":"A Note From Trisha"},{"type":"text","content":"Now that you have reached the end of this module, pause for a moment and recognize what you just did. You did not simply learn information. You integrated awareness, forgiveness, and intentional change into one powerful practice."},{"type":"text","content":"In 7:1, you saw your patterns clearly. In 7:2, you released what was heavy. In 7:3, you learned how to update what your body learned when it was trying to survive. Most people never get this framework."},{"type":"text","content":"Old reactions may resurface at times. That does not erase your progress. It simply means you are human. Return to what you have learned. Slow down. Practice again. Strengthen the new pathway."},{"type":"quote","content":"You are no longer operating on autopilot. You are living with awareness, and that changes everything. Forgiveness sets your heart free. Now you are teaching your nervous system how to live in that freedom.","attribution":"Trisha Jamison"}]}');

  -- Module 8: Legacy Building
  INSERT INTO modules (course_id, module_number, title, description, sort_order)
  VALUES (flagship_id, 'F', 'Legacy Building', 'Build a marriage that transforms generations.', 8)
  RETURNING id INTO mod_id;

  INSERT INTO lessons (module_id, title, sort_order, content_json) VALUES
  (mod_id, 'The 6 Levels of Intimacy', 1, '{"blocks":[{"type":"text","content":"From roommates back to lovers — understanding the full spectrum of intimacy."}]}'),
  (mod_id, 'Your Marriage Vision', 2, '{"blocks":[{"type":"text","content":"Craft a shared vision for the marriage you''re building together."}]}'),
  (mod_id, 'The 30-Day Legacy Plan', 3, '{"blocks":[{"type":"text","content":"A concrete 30-day plan to cement your transformation and build lasting habits."}]}');

END $$;

-- =====================================================
-- STANDALONE BUNDLES
-- =====================================================

INSERT INTO courses (slug, title, description, price_cents, course_type) VALUES
('conflict-rescue-kit', 'The Conflict Rescue Kit', 'Stop the bleeding. Learn to fight without destroying. If your arguments have become a warzone, this is where you start.', 3900, 'bundle'),
('communication-mastery', 'Communication Mastery Toolkit', 'Say what you mean—and hear what they''re really saying. Teaches you to express needs without blame.', 3900, 'bundle'),
('toxic-pattern-breaker', 'Toxic Pattern Breaker', 'Name it. Trace it. Break the cycle. Identify gaslighting, manipulation, and emotional immaturity patterns.', 3900, 'bundle'),
('spark-intimacy', 'Spark & Intimacy Bundle', 'From roommates back to lovers. Addresses the full spectrum of intimacy.', 4900, 'bundle'),
('financial-unity', 'Financial Unity System', 'Because money fights are never really about money. Understand how financial childhoods shaped spending identities.', 3900, 'bundle');
