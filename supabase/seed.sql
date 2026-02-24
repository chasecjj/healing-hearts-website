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
  INSERT INTO modules (course_id, module_number, title, description, sort_order, is_preview)
  VALUES (flagship_id, '1', 'Love''s Foundation', 'Personality blueprint, attachment style, and love language.', 1, true)
  RETURNING id INTO mod_id;

  INSERT INTO lessons (module_id, title, sort_order, is_preview, content_json) VALUES
  (mod_id, 'Welcome to the Journey', 1, true, '{"blocks":[{"type":"text","content":"Welcome to Healing Hearts. In this introductory lesson, Jeff and Trisha walk you through what to expect from the program and how to get the most from your experience."}]}'),
  (mod_id, 'Your Personality Blueprint', 2, false, '{"blocks":[{"type":"text","content":"Understanding your unique personality wiring is the first step to understanding your relationship dynamics."}]}'),
  (mod_id, 'Attachment Styles 101', 3, false, '{"blocks":[{"type":"text","content":"Discover your attachment style and how it shapes every interaction with your partner."}]}'),
  (mod_id, 'The Language of Connection', 4, false, '{"blocks":[{"type":"text","content":"Learn to speak your partner''s love language — and teach them yours."}]}');

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

  -- Module 7: Subconscious Core Wounds
  INSERT INTO modules (course_id, module_number, title, description, sort_order)
  VALUES (flagship_id, '7', 'Subconscious Core Wounds', 'Heal the hidden wounds driving your relationship patterns.', 7)
  RETURNING id INTO mod_id;

  INSERT INTO lessons (module_id, title, sort_order, content_json) VALUES
  (mod_id, 'Identifying Core Wounds', 1, '{"blocks":[{"type":"text","content":"Discover the deep wounds that silently control your reactions."}]}'),
  (mod_id, 'The Healing Process', 2, '{"blocks":[{"type":"text","content":"A guided process for addressing and healing your core wounds."}]}'),
  (mod_id, 'Integration and Forgiveness', 3, '{"blocks":[{"type":"text","content":"Bringing it all together — forgiveness, integration, and moving forward."}]}');

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
