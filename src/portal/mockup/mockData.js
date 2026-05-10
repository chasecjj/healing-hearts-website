/**
 * Static stub data for Wave 5 hero-state mockups.
 *
 * Hardcoded lesson titles, course names, progress numbers per brief
 * §"Stub data strategy". Not wired to Supabase. Happy-path only.
 */

export const MOCK_USER = {
  firstName: 'Chase',
};

// Dashboard — active hero card (single "today's next lesson")
export const MOCK_HERO_LESSON = {
  moduleNumber: '2',
  moduleTitle: 'The Seven Devils',
  lessonNumber: '2.3',
  lessonTitle: 'The First Devil — Avoidance',
  duration: 38,
  resumeFraction: 0.42,
  coverTint: '#B89177', // flavor-home
};

// Dashboard — "Continue Watching" rail
export const MOCK_CONTINUE_RAIL = [
  {
    id: 'c1',
    title: 'Naming the Pattern',
    module: 'Module 2 · Lesson 2',
    tint: '#B89177',
  },
  {
    id: 'c2',
    title: 'Soft Starts, Soft Landings',
    module: 'Module 1 · Lesson 5',
    tint: '#C68A4E',
  },
  {
    id: 'c3',
    title: 'The Nervous System at Rest',
    module: 'Module 1 · Lesson 3',
    tint: '#6F8266',
  },
  {
    id: 'c4',
    title: 'Repair Is the Practice',
    module: 'Module 1 · Lesson 4',
    tint: '#B3746F',
  },
];

// Dashboard — journey stats (compact strip below-the-fold)
export const MOCK_JOURNEY_STATS = {
  lessonsCompleted: 5,
  moduleInProgress: 'Module 2',
  totalLessons: 93,
  overallProgressPct: 5,
};

// Dashboard — "My Courses" grid (secondary, bottom)
export const MOCK_COURSES = [
  {
    id: 'hh',
    title: 'The Healing Hearts Program',
    subtitle: 'Eight modules to mend what came before.',
    badge: 'Enrolled',
    tint: '#B96A5F',
  },
  {
    id: 'rk',
    title: 'Rescue Kit',
    subtitle: 'Tools for the hardest moments, kept close.',
    badge: 'Included',
    tint: '#C68A4E',
  },
  {
    id: 'spark',
    title: '7-Day Spark',
    subtitle: 'A daily practice delivered to your inbox.',
    badge: 'Complete',
    tint: '#6F8266',
  },
];

// Module 2 page — lessons
export const MOCK_MODULE = {
  number: '2',
  title: 'The Seven Devils',
  eyebrow: 'MODULE 2',
  description:
    'Every couple meets the same seven patterns. Learning to name them — gently, without shame — is how the unspoken becomes speakable again.',
  lessonsCompleteText: '3 of 7 lessons complete',
  lessons: [
    { num: '2.1', title: 'An Invitation to See Clearly', state: 'Complete' },
    { num: '2.2', title: 'The First Devil — Avoidance', state: 'Complete' },
    { num: '2.3', title: 'Naming Without Shaming', state: 'Complete' },
    { num: '2.4', title: 'The Second Devil — Criticism', state: 'In Progress' },
    { num: '2.5', title: 'Defensiveness as Protection', state: 'Upcoming' },
    { num: '2.6', title: 'Contempt and the Slow Erosion', state: 'Upcoming' },
    { num: '2.7', title: 'Stonewalling — When Words Run Out', state: 'Upcoming' },
  ],
  resources: [
    {
      title: 'Reflection Journal',
      kind: 'PDF',
      copy: 'A guided worksheet for the seven patterns. Five minutes, a pen, and a willingness to look.',
    },
    {
      title: 'Grounding Meditation',
      kind: 'AUDIO · 12 min',
      copy: 'A quiet anchor before you begin. Breath, body, back to the present.',
    },
  ],
};

// Lesson view — full lesson content
export const MOCK_LESSON = {
  moduleNumber: '2',
  moduleTitle: 'The Seven Devils',
  lessonNumber: '2.4',
  lessonTitle: 'The Second Devil — Criticism',
  duration: 38,
  eyebrow: 'MODULE 2 · LESSON 4',
  paragraph:
    "Criticism does not arrive as a weapon. It arrives as a plea — dressed in the wrong clothes. Underneath every criticism is a longing: to be seen, to be chosen, to matter. The language is harsh; the ache is soft. This lesson is about hearing the ache underneath the words, in yourself and in the person across from you.",
  paragraph2:
    "We begin with a simple distinction. A complaint names the moment: 'When you came home late without calling, I felt forgotten.' A criticism names the person: 'You're so selfish.' Both feelings are real. Only one opens a door.",
  noteSnippet:
    "Notice when I slip from complaint into criticism — usually when I'm tired. The anchor: what do I actually need right now?",
};

// Course outline for drawer (in-lesson)
export const MOCK_COURSE_OUTLINE = [
  {
    id: 'm1',
    number: '1',
    title: 'Foundations',
    expanded: false,
    lessonCount: 6,
    complete: true,
  },
  {
    id: 'm2',
    number: '2',
    title: 'The Seven Devils',
    expanded: true,
    lessonCount: 7,
    current: true,
    lessons: [
      { num: '2.1', title: 'An Invitation to See Clearly', state: 'Complete' },
      { num: '2.2', title: 'The First Devil — Avoidance', state: 'Complete' },
      { num: '2.3', title: 'Naming Without Shaming', state: 'Complete' },
      { num: '2.4', title: 'The Second Devil — Criticism', state: 'Active' },
      { num: '2.5', title: 'Defensiveness as Protection', state: 'Upcoming' },
      { num: '2.6', title: 'Contempt and the Slow Erosion', state: 'Upcoming' },
      { num: '2.7', title: 'Stonewalling — When Words Run Out', state: 'Upcoming' },
    ],
  },
  { id: 'm3', number: '3', title: 'The Language of Repair', expanded: false, lessonCount: 5 },
  { id: 'm4', number: '4', title: 'Attachment and Its Shadows', expanded: false, lessonCount: 6 },
  { id: 'm5', number: '5', title: 'Forgiveness — A Long Road', expanded: false, lessonCount: 5 },
  { id: 'm6', number: '6', title: 'Building the Weekly Ritual', expanded: false, lessonCount: 4 },
  { id: 'm7', number: '7', title: 'Hard Conversations', expanded: false, lessonCount: 5 },
  { id: 'm8', number: '8', title: 'The Life You Build Together', expanded: false, lessonCount: 4 },
];
