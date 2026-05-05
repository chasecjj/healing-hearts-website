import React from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import { TeardropImage, OrganicDivider, Card, CardContent, Button } from '@scoria/ui';
import { Mail, Phone } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  /meet/jeff — Personal networking page for Orlando workshop         */
/*  Conversion intensity: 3/10 (networking, not funnel)               */
/*  Mobile-portrait-first — QR-scanned on venue floor                 */
/* ------------------------------------------------------------------ */

export default function MeetJeff() {
  usePageMeta({
    title: 'Meet Dr. Jeff Jamison — Healing Hearts',
    description:
      'Dr. Jeff Jamison is a board-certified family physician with nearly 30 years in practice. Co-founder of Healing Hearts.',
  });

  return (
    <div className="w-full min-h-screen bg-neutral-50 text-foreground">

      {/* ── Section 1: Hero ───────────────────────────────────────── */}
      <section
        aria-labelledby="jeff-hero-headline"
        className="w-full px-6 py-12 sm:px-10 sm:py-20 bg-neutral-50"
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12">
          {/* Photo — stacks above text on mobile, right on desktop */}
          <div className="order-first sm:order-last flex-shrink-0 flex justify-center sm:justify-end">
            <TeardropImage
              src="/images/team/jeff.jpg"
              alt="Dr. Jeff Jamison, board-certified family physician and co-founder of Healing Hearts"
              className="w-52 sm:w-64"
              overlayClass="bg-primary/10"
            />
          </div>

          {/* Text */}
          <div className="flex flex-col gap-3 sm:flex-1">
            <p className="font-sans text-primary/60 tracking-widest uppercase text-xs">
              Healing Hearts
            </p>
            <h1
              id="jeff-hero-headline"
              className="font-accent italic text-5xl sm:text-6xl text-primary leading-tight"
            >
              Jeff
            </h1>
            <p className="font-sans text-foreground/70 text-base sm:text-lg leading-relaxed font-light">
              Board-certified family physician. Clinical lens for the work Trisha builds.
            </p>
          </div>
        </div>
      </section>

      {/* ── Wave divider ─────────────────────────────────────────── */}
      <OrganicDivider variant="wave-1" />

      {/* ── Section 2: Short story ───────────────────────────────── */}
      <section
        aria-label="About Jeff"
        className="w-full px-6 py-12 sm:px-10 sm:py-16 bg-background"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="font-accent italic text-2xl sm:text-3xl text-primary mb-6">
            How I got here
          </h2>
          <p className="font-sans text-foreground/80 text-base sm:text-lg leading-relaxed font-light mb-6">
            I'm a board-certified family physician. I ran my own practice for nearly 30 years and
            held a five-star rating across that span. Trisha and I have been married more than 38
            years and raised six children.
          </p>
          <p className="font-sans text-foreground/80 text-base sm:text-lg leading-relaxed font-light">
            Medical training taught me to compartmentalize emotion — useful in an exam room,
            devastating in a marriage. I bring the clinical lens to the work Trisha architects: the
            body, stress, and how they shape what happens at home.
          </p>
        </div>
      </section>

      {/* ── Section 3: What I help with ──────────────────────────── */}
      <section
        aria-label="What Jeff helps with"
        className="w-full px-6 py-12 sm:px-10 sm:py-16 bg-neutral-50"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="font-accent italic text-2xl sm:text-3xl text-primary mb-6">
            What I help with
          </h2>
          <div className="flex flex-col gap-4">
            <Card className="border border-primary/10 bg-white rounded-2xl">
              <CardContent className="p-6">
                <p className="font-sans text-foreground/80 text-base leading-relaxed font-light">
                  Helping physician families recognize the patterns medical training builds in.
                </p>
              </CardContent>
            </Card>
            <Card className="border border-primary/10 bg-white rounded-2xl">
              <CardContent className="p-6">
                <p className="font-sans text-foreground/80 text-base leading-relaxed font-light">
                  Grounding emotional work in what's medically practical and measurable.
                </p>
              </CardContent>
            </Card>
            <Card className="border border-primary/10 bg-white rounded-2xl">
              <CardContent className="p-6">
                <p className="font-sans text-foreground/80 text-base leading-relaxed font-light">
                  Speaking honestly with men who got the "provider" script and lost the marriage.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Section 4: Connect block ──────────────────────────────── */}
      <section
        aria-label="Connect with Jeff"
        className="w-full px-6 py-12 sm:px-10 sm:py-16 bg-background"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="font-accent italic text-2xl sm:text-3xl text-primary mb-6">
            Let's stay in touch
          </h2>
          <Card className="border border-primary/10 bg-white rounded-2xl">
            <CardContent className="p-6 flex flex-col gap-4">
              <a
                href="mailto:jeffjamison@healingheartscourse.com"
                className="flex items-center gap-3 text-primary hover:text-primary/70 transition-colors min-h-[48px]"
                aria-label="Email Jeff"
              >
                <Mail className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="font-sans text-base">
                  jeffjamison@healingheartscourse.com
                </span>
              </a>
              <a
                href="tel:+15099955876"
                className="flex items-center gap-3 text-primary hover:text-primary/70 transition-colors min-h-[48px]"
                aria-label="Call Jeff — Business"
              >
                <Phone className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="font-sans text-base">
                  +1 509-995-5876 <span className="text-foreground/50 text-sm">(Business)</span>
                </span>
              </a>
              {/* LinkedIn placeholder — uncomment when URL confirmed
              <a
                href="https://linkedin.com/in/PLACEHOLDER"
                className="flex items-center gap-3 text-primary hover:text-primary/70 transition-colors min-h-[48px]"
                aria-label="Jeff on LinkedIn"
              >
                <span className="font-sans text-base">LinkedIn</span>
              </a>
              */}
              {/* Instagram placeholder — uncomment when handle confirmed
              <a
                href="https://instagram.com/PLACEHOLDER"
                className="flex items-center gap-3 text-primary hover:text-primary/70 transition-colors min-h-[48px]"
                aria-label="Jeff on Instagram"
              >
                <span className="font-sans text-base">Instagram</span>
              </a>
              */}
              <div className="pt-2">
                <Link to="/journey">
                  <Button
                    className="w-full sm:w-auto min-h-[48px] bg-primary-500 text-white hover:bg-primary-600"
                    aria-label="Visit Healing Hearts website"
                  >
                    Visit healingheartscourse.com
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Section 5: Footer ─────────────────────────────────────── */}
      <footer className="w-full px-6 py-8 bg-neutral-50 text-center">
        <p className="font-sans text-foreground/50 text-sm">
          <Link to="/" className="hover:text-primary transition-colors">
            healingheartscourse.com
          </Link>{' '}
          &copy; Healing Hearts
        </p>
      </footer>

    </div>
  );
}
