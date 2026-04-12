import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, ChevronRight, BookOpen } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const MODULES = [
  { number: '1', title: 'The Seven Devils', description: 'Name the seven patterns destroying your relationship. Learn the SPARK Method. Meet your Critter Brain and CEO Brain. Build your first week of practice.', lessons: 28 },
  { number: '2', title: 'The Devils Up Close', description: 'Face Criticism, Contempt, Defensiveness, Stonewalling, Avoidance, and Unhealthy Coping. Complete your Devil Audit and build a practice plan.', lessons: 24 },
  { number: '3', title: 'The Deep Roots', description: 'Trace your patterns to their origin. Your childhood wrote a Mindprint — now you get to read it.', lessons: 3 },
  { number: '4', title: 'Breakthrough Communication', description: 'Master active listening, the "I Feel / I Need" formula, and repair conversations that actually land.', lessons: 3 },
  { number: '5', title: 'Nervous System Regulation', description: 'Master the 90-Second Wave. Map your Zones of Resilience. Learn co-regulation practices.', lessons: 3 },
  { number: '6', title: 'Emotional Zones', description: 'Meet your Critter Brain and CEO Brain. Take the Emotional Maturity Assessment. Grow together.', lessons: 3 },
  { number: '7', title: 'Subconscious Core Wounds', description: 'Identify the 12 Subconscious Principles. Uncover core wounds. Walk the path to true intimacy and forgiveness.', lessons: 18 },
  { number: '8', title: 'Legacy of Love', description: 'Integration, resilience, and a secured future. Financial freedom, healthy coping, and future-proofing your marriage.', lessons: 8 },
];

export default function CourseOverview() {
  usePageMeta('Course Overview', 'Explore the complete 8-module Healing Hearts program — from attachment foundations to legacy building. Start free with the 7-Day Spark Challenge.');
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
              to="/spark-challenge"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-accent text-background font-outfit font-medium shadow-xl hover:bg-accent/90 transition-colors"
            >
              Start the Spark Challenge <ChevronRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Module List */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <h2 className="font-outfit font-bold text-2xl text-primary mb-2">Course Modules</h2>
        <p className="font-sans text-foreground/60 mb-10">
          The full curriculum. Access the complete program by enrolling — or start free with the 7-Day Spark Challenge.
        </p>

        <div className="space-y-4">
          {MODULES.map((mod) => (
            <div
              key={mod.number}
              className="rounded-2xl border border-primary/10 bg-background p-6 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary/50">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-outfit font-bold text-lg text-primary">
                      {mod.number === 'F' ? 'Final' : `Module ${mod.number}`}: {mod.title}
                    </h3>
                  </div>
                  <p className="font-sans text-foreground/60 text-sm leading-relaxed">
                    {mod.description}
                  </p>
                  <p className="font-sans text-foreground/40 text-xs mt-2">
                    {mod.lessons} lessons
                  </p>
                </div>
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
            Start with the free 7-Day Spark Challenge — a daily practice delivered to your inbox — then enroll when you are ready for the full program.
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
              to="/spark-challenge"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-background font-outfit font-medium shadow-lg hover:bg-accent/90 transition-colors"
            >
              Start the Spark Challenge <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
