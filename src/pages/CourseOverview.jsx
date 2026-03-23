import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, PlayCircle, ChevronRight, BookOpen } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const MODULES = [
  { number: '1', title: "Love's Foundation", description: 'Personality blueprint, attachment style, and love language.', lessons: 4 },
  { number: '2', title: 'Invisible Chains', description: 'Recognize toxic patterns hiding in plain sight.', lessons: 3 },
  { number: '3', title: 'The Deep Roots', description: 'Understand how your childhood wrote a Mindprint.', lessons: 3 },
  { number: '4', title: 'Breakthrough Communication', description: 'Express needs without blame, listen without defending.', lessons: 3 },
  { number: '5', title: 'Nervous System Regulation', description: 'Calm the storm inside before addressing the storm between you.', lessons: 3 },
  { number: '6', title: 'Emotional Zones', description: 'Map your emotional landscape and learn to navigate it together.', lessons: 3 },
  { number: '7', title: 'Forgiveness & Letting Go', description: 'Heal the hidden wounds driving your relationship patterns.', lessons: 3, isPreview: true },
  { number: 'F', title: 'Legacy Building', description: 'Build a marriage that transforms generations.', lessons: 3 },
];

export default function CourseOverview() {
  usePageMeta('Course Overview', 'Explore the complete 8-module Healing Hearts program — from attachment foundations to legacy building. Free preview of Module 7.');
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="font-outfit text-sm uppercase tracking-widest text-background/70 mb-4">
            The Healing Hearts Journey
          </p>
          <h1 className="font-drama italic text-4xl md:text-6xl text-background mb-6">
            Rebuild what matters most.
          </h1>
          <p className="font-sans font-light text-background/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            8 modules designed by marriage coaches Jeff & Trisha Jamison. Real tools, real science, real transformation — from understanding your patterns to building a lasting legacy.
          </p>
          {user ? (
            <Link
              to="/portal"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-accent text-background font-outfit font-medium shadow-xl hover:bg-accent/90 transition-colors"
            >
              Continue Learning <ChevronRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-accent text-background font-outfit font-medium shadow-xl hover:bg-accent/90 transition-colors"
            >
              Start Free Preview <ChevronRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Module List */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <h2 className="font-outfit font-bold text-2xl text-primary mb-2">Course Modules</h2>
        <p className="font-sans text-foreground/60 mb-10">
          Module 7 is available as a free preview. Full access coming soon.
        </p>

        <div className="space-y-4">
          {MODULES.map((mod) => (
            <div
              key={mod.number}
              className={`rounded-2xl border p-6 transition-colors ${
                mod.isPreview
                  ? 'border-accent/30 bg-accent/5'
                  : 'border-primary/10 bg-background'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    mod.isPreview
                      ? 'bg-accent text-background'
                      : 'bg-primary/10 text-primary/50'
                  }`}
                >
                  {mod.isPreview ? (
                    <PlayCircle className="w-5 h-5" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-outfit font-bold text-lg text-primary">
                      {mod.number === 'F' ? 'Final' : `Module ${mod.number}`}: {mod.title}
                    </h3>
                    {mod.isPreview && (
                      <span className="text-xs font-outfit font-medium text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">
                        Free Preview
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-foreground/60 text-sm leading-relaxed">
                    {mod.description}
                  </p>
                  <p className="font-sans text-foreground/40 text-xs mt-2">
                    {mod.lessons} lessons
                  </p>
                </div>
                {mod.isPreview && (
                  <Link
                    to={user ? '/portal/module-7' : '/signup'}
                    className="hidden sm:inline-flex items-center gap-1 text-sm font-outfit font-medium text-accent hover:text-accent/80 transition-colors flex-shrink-0"
                  >
                    {user ? 'Open' : 'Sign up'} <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <div className="bg-primary/5 rounded-3xl p-10 md:p-16">
          <BookOpen className="w-10 h-10 text-accent mx-auto mb-4" />
          <h3 className="font-drama italic text-3xl text-primary mb-4">
            Ready to experience the program?
          </h3>
          <p className="font-sans text-foreground/60 max-w-lg mx-auto mb-8">
            Module 7 covers core wounds, forgiveness, and reprogramming your nervous system. Three full lessons, no credit card required.
          </p>
          {user ? (
            <Link
              to="/portal"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-background font-outfit font-medium shadow-lg hover:bg-accent/90 transition-colors"
            >
              Go to Course Portal <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-background font-outfit font-medium shadow-lg hover:bg-accent/90 transition-colors"
            >
              Create Free Account <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
