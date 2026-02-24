-- =====================================================
-- Healing Hearts Course Platform — Initial Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL)
-- =====================================================

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Products / Courses
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  price_cents integer NOT NULL,
  stripe_price_id text,
  stripe_sub_price_id text,
  course_type text NOT NULL CHECK (course_type IN ('flagship', 'bundle', 'subscription_content')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Module groups within courses
CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_number text NOT NULL,
  title text NOT NULL,
  description text,
  sort_order integer NOT NULL,
  is_preview boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Individual lessons
CREATE TABLE lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  sort_order integer NOT NULL,
  content_json jsonb,
  mux_asset_id text,
  mux_playback_id text,
  duration_seconds integer,
  has_workbook boolean DEFAULT false,
  workbook_storage_path text,
  is_preview boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Purchase records / enrollments
CREATE TABLE enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  stripe_payment_id text,
  stripe_subscription_id text,
  revcat_entitlement text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'refunded')),
  enrolled_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Per-user lesson progress tracking
CREATE TABLE lesson_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  last_position_seconds integer DEFAULT 0,
  completed_at timestamptz,
  notes text,
  PRIMARY KEY (user_id, lesson_id)
);

-- Extended user profiles
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'coach')),
  bio text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- COMMUNITY TABLES
-- =====================================================

-- Discussion threads (per-lesson or per-course)
CREATE TABLE discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Comments within discussions
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body_text text NOT NULL,
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Reactions on comments
CREATE TABLE comment_reactions (
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('heart', 'lightbulb', 'pray')),
  PRIMARY KEY (comment_id, user_id, reaction_type)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_modules_sort ON modules(course_id, sort_order);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_sort ON lessons(module_id, sort_order);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_discussions_lesson ON discussions(lesson_id);
CREATE INDEX idx_discussions_course ON discussions(course_id);
CREATE INDEX idx_comments_discussion ON comments(discussion_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- COURSES: publicly readable (for Programs page), admin-writable
CREATE POLICY "courses_public_read" ON courses
  FOR SELECT USING (is_active = true);

CREATE POLICY "courses_admin_write" ON courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- MODULES: publicly readable (for course structure display)
CREATE POLICY "modules_public_read" ON modules
  FOR SELECT USING (true);

CREATE POLICY "modules_admin_write" ON modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- LESSONS: preview content is public; full content requires enrollment
CREATE POLICY "lessons_read" ON lessons
  FOR SELECT USING (
    is_preview = true
    OR EXISTS (
      SELECT 1 FROM enrollments e
      JOIN modules m ON m.course_id = e.course_id
      WHERE m.id = lessons.module_id
        AND e.user_id = auth.uid()
        AND e.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "lessons_admin_write" ON lessons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ENROLLMENTS: users see their own; admins see all
CREATE POLICY "enrollments_own_read" ON enrollments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "enrollments_admin_read" ON enrollments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "enrollments_admin_write" ON enrollments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow service role (webhooks) to insert enrollments
CREATE POLICY "enrollments_service_insert" ON enrollments
  FOR INSERT WITH CHECK (true);

-- LESSON PROGRESS: own data only
CREATE POLICY "progress_own" ON lesson_progress
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "progress_admin_read" ON lesson_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- USER PROFILES: own profile read/update; public display_name
CREATE POLICY "profiles_own" ON user_profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "profiles_public_read" ON user_profiles
  FOR SELECT USING (true);

-- DISCUSSIONS: enrolled users can read and create
CREATE POLICY "discussions_read" ON discussions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.course_id = discussions.course_id
        AND e.user_id = auth.uid()
        AND e.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "discussions_create" ON discussions
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.course_id = discussions.course_id
        AND e.user_id = auth.uid()
        AND e.status = 'active'
    )
  );

-- COMMENTS: visible unless hidden (admins see all)
CREATE POLICY "comments_read" ON comments
  FOR SELECT USING (
    NOT is_hidden
    OR EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "comments_create" ON comments
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "comments_admin_moderate" ON comments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- COMMENT REACTIONS: own reactions only
CREATE POLICY "reactions_own" ON comment_reactions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "reactions_read" ON comment_reactions
  FOR SELECT USING (true);

-- =====================================================
-- TRIGGER: Auto-create user_profile on signup
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
